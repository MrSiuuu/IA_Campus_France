/**
 * Module de gestion des conversations et messages du chat
 * Ce module gère toutes les opérations liées aux conversations et messages
 * entre l'utilisateur et l'assistant IA
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const openai = require('../config/openai');
const { authenticateToken } = require('../middleware/auth');

// Initialisation de la connexion à Supabase
// Utilise les variables d'environnement pour la configuration
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware de debug pour tracer les requêtes authentifiées
router.use((req, res, next) => {
  if (req.user) {
    console.log('Chat route - Utilisateur authentifié :', req.user);
  }
  next();
});

// Protection de toutes les routes du chat avec authentification
router.use(authenticateToken);

/**
 * Route POST /conversations
 * Crée une nouvelle conversation pour l'utilisateur
 * 
 * @body {string} title - Titre de la conversation (optionnel)
 * @returns {Object} La conversation créée
 */
router.post('/conversations', async (req, res) => {
  try {
    const { title } = req.body;
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user_id: req.user.id, title: title || 'Nouvelle conversation' }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route POST /messages
 * Envoie un message et obtient une réponse de l'IA
 * 
 * @body {number} conversation_id - ID de la conversation
 * @body {string} content - Contenu du message
 * @returns {Object} Réponse de l'IA et informations sur les tokens
 * 
 * Processus :
 * 1. Vérifie les tokens disponibles
 * 2. Récupère l'historique des messages
 * 3. Envoie à OpenAI
 * 4. Sauvegarde les messages
 * 5. Met à jour les tokens
 */
router.post('/messages', async (req, res) => {
  try {
    const { conversation_id, content } = req.body;

    if (!conversation_id || !content) {
      return res.status(400).json({ error: 'conversation_id et content sont requis' });
    }

    // Vérification des tokens disponibles
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tokens_remaining')
      .eq('id', req.user.id)
      .single();

    if (userError) throw userError;
    if (userData.tokens_remaining < 10) {
      return res.status(403).json({ error: 'Il vous reste moins de 10 tokens, veuillez augmenter votre solde pour continuer à discuter avec l\'IA.' });
    }

    // Récupération de l'historique des messages
    const { data: history, error: historyError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    // Préparation du contexte pour OpenAI
// Étape 1 : chercher un document pertinent dans faq_docs
const { data: docs, error: docError } = await supabase
  .from("faq_docs")
  .select("title, content")
  .ilike("title", "%lettre%") // on filtre sur le thème pour le test
  .limit(1);

if (docError) throw docError;

const contextDoc = docs?.[0]?.content || "";

// Étape 2 : construire le prompt avec le contexte
const messages = [
  {
    role: 'system',
    content: `
Tu es une intelligence artificielle spécialisée dans l'accompagnement des étudiants africains dans les démarches Campus France.

### 🎯 Ta mission :
- Répondre uniquement à des questions en lien avec Campus France : visa, logement, lettre de motivation, CV, inscriptions, etc.
- Ne jamais inventer d'informations. Utilise seulement le **contexte fourni** si disponible.
- Si le contexte ne contient pas la réponse, tu dois le dire clairement.

### 🧠 Ton style :
- Tu expliques **étape par étape**
- Tu fais des réponses **courtes, précises et structurées**
- Tu réponds en **Markdown clair**, avec :
  - **Titres**
  - **Listes à puces**
  - **Parties importantes en gras**
  - **Paragraphes séparés**
- Tu commences toujours par un **petit résumé clair en une phrase**

### 📚 Contexte :
${contextDoc}
`
  },
  ...history,
  { role: 'user', content }
];


    // Appel à l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500
    });

    const assistantMessage = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;

    // Sauvegarde du message utilisateur
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id,
        user_id: req.user.id,
        role: 'user',
        content,
        tokens_used: tokensUsed
      }]);

    if (userMessageError) throw userMessageError;

    // Sauvegarde de la réponse de l'assistant
    const { error: assistantMessageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id,
        user_id: req.user.id,
        role: 'assistant',
        content: assistantMessage,
        tokens_used: tokensUsed
      }]);

    if (assistantMessageError) throw assistantMessageError;

    // Mise à jour des tokens restants
    const { error: updateTokensError } = await supabase
      .from('users')
      .update({ tokens_remaining: userData.tokens_remaining - tokensUsed })
      .eq('id', req.user.id);

    if (updateTokensError) throw updateTokensError;

    res.json({
      message: assistantMessage,
      tokens_used: tokensUsed,
      tokens_remaining: userData.tokens_remaining - tokensUsed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route GET /conversations
 * Récupère la liste des conversations de l'utilisateur
 * 
 * @returns {Array} Liste des conversations triées par date de création
 */
router.get('/conversations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route GET /conversations/:id/messages
 * Récupère tous les messages d'une conversation spécifique
 * 
 * @param {number} id - ID de la conversation
 * @returns {Array} Liste des messages triés par date
 */
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route PUT /conversations/:id
 * Met à jour le titre d'une conversation
 * 
 * @param {number} id - ID de la conversation
 * @body {string} title - Nouveau titre
 * @returns {Object} Conversation mise à jour
 * 
 * Sécurité :
 * - Vérifie que l'utilisateur est propriétaire de la conversation
 * - Authentification requise
 */
router.put('/conversations/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const { data, error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id) // Vérification de propriété
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route DELETE /conversations/:id
 * Supprime une conversation et ses messages associés
 * 
 * @param {number} id - ID de la conversation
 * @returns {Object} Message de confirmation
 * 
 * Sécurité :
 * - Vérifie que l'utilisateur est propriétaire de la conversation
 * - Authentification requise
 */
router.delete('/conversations/:id', async (req, res) => {
  try {
    // Vérifier que la conversation appartient à l'utilisateur
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée ou non autorisée' });
    }

    // Supprimer la conversation (les messages seront supprimés automatiquement grâce à ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 