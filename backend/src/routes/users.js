const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Récupérer le profil de l'utilisateur
router.get('/profile', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour le profil de l'utilisateur
router.put('/profile', async (req, res) => {
  const { first_name, last_name, country, education_level } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        country,
        education_level
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les tokens restants
router.get('/tokens', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('tokens_remaining')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json({ tokens_remaining: data.tokens_remaining });
  } catch (error) {
    console.error('Erreur lors de la récupération des tokens:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 