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

// Utiliser un code promo
router.post('/redeem-promo', async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ error: 'Code promo requis' });
    }

    // Vérifier si le code existe et est actif
    const { data: promoCode, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (promoError) {
      if (promoError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Code promo invalide' });
      }
      throw promoError;
    }

    // Vérifier si l'utilisateur a déjà utilisé ce code
    if (promoCode.used_by.includes(userId)) {
      return res.status(400).json({ error: 'Vous avez déjà utilisé ce code promo' });
    }

    // Vérifier si le code a atteint sa limite d'utilisation
    if (promoCode.max_uses && promoCode.used_by.length >= promoCode.max_uses) {
      return res.status(400).json({ error: 'Ce code promo a atteint sa limite d\'utilisation' });
    }

    // Mettre à jour les tokens de l'utilisateur
    // 1. Récupérer le solde actuel
    const { data: userData, error: userReadError } = await supabase
      .from('users')
      .select('tokens_remaining')
      .eq('id', userId)
      .single();

    if (userReadError) throw userReadError;

    // 2. Calculer le nouveau solde
    const newBalance = (userData.tokens_remaining || 0) + promoCode.token_amount;

    // 3. Mettre à jour le solde
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({ tokens_remaining: newBalance })
      .eq('id', userId)
      .select()
      .single();

    if (userError) throw userError;

    // Ajouter l'utilisateur à la liste des utilisateurs du code
    const { error: updateError } = await supabase
      .from('promo_codes')
      .update({ 
        used_by: [...promoCode.used_by, userId]
      })
      .eq('id', promoCode.id);

    if (updateError) throw updateError;

    res.json({ 
      success: true, 
      tokens_awarded: promoCode.token_amount,
      new_balance: user.tokens_remaining
    });
  } catch (error) {
    console.error('Erreur lors de l\'utilisation du code promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 