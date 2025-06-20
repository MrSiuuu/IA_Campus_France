DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

COMMENT ON SCHEMA public IS 'standard public schema';

-- Restaurer les permissions par défaut pour les rôles internes de Supabase.
-- C'est crucial après avoir supprimé et recréé le schéma.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres;

-- Le service_role (utilisé par votre backend) a besoin d'un accès complet aux objets
-- créés dans le schéma. Ces commandes garantissent que toutes les nouvelles tables,
-- séquences ou fonctions seront accessibles par votre backend.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- Accorder également des droits au rôle postgres, qui possède les objets
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

-- Accorder l'accès au rôle public
GRANT ALL ON SCHEMA public TO public;

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS faq_docs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS contact CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;

-- 1. Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Pour les embeddings (RAG)

-- 2. Types ENUM
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE document_type AS ENUM ('cv', 'letter', 'admin', 'other');

-- 3. Table users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    education_level VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'student',
    tokens_remaining INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type document_type NOT NULL,
    tokens_required INTEGER NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    tokens_purchased INTEGER NOT NULL,
    stripe_payment_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table faq_docs (pour RAG)
CREATE TABLE faq_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Index pour la performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_faq_docs_category ON faq_docs(category);

-- 10. Fonction et triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_docs_updated_at
    BEFORE UPDATE ON faq_docs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_docs ENABLE ROW LEVEL SECURITY;

-- 12. Politiques RLS
-- Users
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "view all" ON users;
DROP POLICY IF EXISTS "Admin or self can view users" ON users;
DROP POLICY IF EXISTS "Admin or self can update users" ON users;
DROP POLICY IF EXISTS "Service role bypass RLS" ON users;
DROP POLICY IF EXISTS "Auth can read users" ON users;
DROP POLICY IF EXISTS "Users can manage their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Vue pour les rôles utilisateurs (évite la récursion)
DROP VIEW IF EXISTS public_user_roles;
CREATE VIEW public_user_roles AS
SELECT id, role FROM users;

-- Politique pour le service_role (bypass complet)
CREATE POLICY "Service role bypass RLS"
    ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Politique pour l'authentification de base (permet la lecture pour la connexion)
CREATE POLICY "Auth can read users"
    ON users
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id 
        OR EXISTS (
            SELECT 1 FROM public_user_roles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politique pour les utilisateurs authentifiés (gestion de leurs propres données)
CREATE POLICY "Users can manage their own data"
    ON users
    FOR ALL
    TO authenticated
    USING (
        auth.uid() = id 
        OR EXISTS (
            SELECT 1 FROM public_user_roles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = id 
        OR EXISTS (
            SELECT 1 FROM public_user_roles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;

CREATE POLICY "Admin or self can view conversations"
    ON conversations FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public_user_roles r
            WHERE r.id = auth.uid() AND r.role = 'admin'
        )
    );

-- Messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;

CREATE POLICY "Admin or self can view messages"
    ON messages FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public_user_roles r
            WHERE r.id = auth.uid() AND r.role = 'admin'
        )
    );

-- Documents
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;

CREATE POLICY "Admin or self can view documents"
    ON documents FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public_user_roles r
            WHERE r.id = auth.uid() AND r.role = 'admin'
        )
    );

-- Payments
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

-- FAQ docs (lecture seule pour tous les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can read FAQ docs"
    ON faq_docs FOR SELECT
    TO authenticated
    USING (true);

-- 13. Table contact (formulaire contact et report)
CREATE TABLE IF NOT EXISTS contact (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'contact', -- 'contact' ou 'report'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE contact ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view all contacts" ON contact;

CREATE POLICY "Admin can view all contacts"
    ON contact FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Anyone can insert contact"
    ON contact FOR INSERT
    TO public
    WITH CHECK (true);

-- 14. Table promo_codes
CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    token_amount INT NOT NULL,
    max_uses INT DEFAULT NULL,
    used_by UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index pour promo_codes
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_used_by ON promo_codes USING GIN (used_by);

-- Activation RLS pour promo_codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins
CREATE POLICY "Admin can manage promo codes"
ON promo_codes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Politique pour les étudiants
CREATE POLICY "Students can check specific promo code"
ON promo_codes FOR SELECT
USING (
    is_active = true
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'student'
    )
    AND code = current_setting('app.current_promo_code', true)
);

-- Trigger pour updated_at
CREATE TRIGGER update_promo_codes_updated_at
    BEFORE UPDATE ON promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Permettre l'insertion à tous dans la table users
CREATE POLICY "Anyone can insert users"
    ON users FOR INSERT
    TO public
    WITH CHECK (true); 