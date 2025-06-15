const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Middleware de validation pour l'inscription
const validateRegister = (req, res, next) => {
    const { email, password, first_name, last_name, country, education_level } = req.body;
    
    // Vérification des champs requis
    if (!email || !password || !first_name || !last_name || !country || !education_level) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    // Validation du mot de passe
    if (password.length < 8) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    next();
};

// Middleware de validation pour la connexion
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    next();
};

// Route d'inscription
router.post('/register', validateRegister, async (req, res) => {
    const { email, password, first_name, last_name, country, education_level } = req.body;

    try {
        // Créer l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) throw authError;

        // Créer le profil utilisateur dans la table users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                first_name,
                last_name,
                country,
                education_level,
                role: 'student'
            })
            .select()
            .single();

        if (userError) throw userError;

        res.status(201).json(userData);
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

// Route de connexion
router.post('/login', validateLogin, async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            if (error.message === 'Invalid login credentials') {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }
            if (error.message.includes('Email not confirmed')) {
                return res.status(401).json({ error: 'Veuillez confirmer votre email avant de vous connecter' });
            }
            throw error;
        }

        // Récupérer les informations de l'utilisateur
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (userError) throw userError;

        res.json({
            user: userData,
            session: data.session
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(401).json({ error: 'Erreur lors de la connexion. Veuillez réessayer.' });
    }
});

// Route de déconnexion
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
});

// Route pour obtenir la liste des utilisateurs (admin uniquement)
router.get('/users', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, first_name, email, role');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route pour obtenir le profil de l'utilisateur connecté
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        res.json(profile);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route pour obtenir les documents de l'utilisateur
router.get('/documents', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError) throw authError;

        const { data: documents, error: documentsError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (documentsError) throw documentsError;

        res.json(documents);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route pour obtenir les conversations de l'utilisateur
router.get('/conversations', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError) throw authError;

        const { data: conversations, error: conversationsError } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (conversationsError) throw conversationsError;

        res.json(conversations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route pour rafraîchir le token
router.post('/refresh-token', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        // Vérifier si le token est valide
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        // Si le token est valide, on renvoie le même token
        // Le frontend continuera à l'utiliser
        res.json({ 
            message: 'Token valide',
            user: user
        });
    } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router; 