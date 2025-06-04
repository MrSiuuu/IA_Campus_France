const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Middleware de validation pour l'inscription
const validateRegister = (req, res, next) => {
    const { email, password, firstName, lastName, country, educationLevel } = req.body;
    
    // Vérification des champs requis
    if (!email || !password || !firstName || !lastName || !country || !educationLevel) {
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
    try {
        const { email, password, firstName, lastName, country, educationLevel } = req.body;

        // Inscription avec Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // Création du profil utilisateur dans la table users
        const { error: profileError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email: authData.user.email,
                    first_name: firstName,
                    last_name: lastName,
                    country,
                    education_level: educationLevel,
                    role: 'student', // Par défaut, tous les nouveaux utilisateurs sont des étudiants
                    tokens_remaining: 3 // Correction du nom de colonne
                }
            ]);

        if (profileError) throw profileError;

        res.status(201).json({ 
            message: 'Inscription réussie', 
            user: {
                id: authData.user.id,
                email: authData.user.email,
                firstName,
                lastName,
                country,
                educationLevel,
                role: 'student',
                tokens: 3
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route de connexion
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Récupération des informations utilisateur
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (userError) throw userError;

        res.json({ 
            user: {
                id: data.user.id,
                email: data.user.email,
                role: userData.role,
                ...userData
            }, 
            session: data.session 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route de déconnexion
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
        res.status(400).json({ error: error.message });
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

module.exports = router; 