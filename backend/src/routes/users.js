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
  const { code } = req.body;
  const userId = req.user.id;

  try {
    if (!code || !userId) {
      return res.status(400).json({ error: 'Code ou utilisateur manquant' });
    }

    // 1. Chercher le code promo actif
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (promoError || !promo) {
      return res.status(400).json({ error: 'Code promo invalide' });
    }

    // 2. Nettoyer used_by[] (évite UUID bugué)
    const usedBy = (promo.used_by || []).map((u) => u.trim());

    // 3. Vérifier si l'utilisateur a déjà utilisé
    if (usedBy.includes(userId)) {
      return res.status(400).json({ error: 'Code déjà utilisé' });
    }

    // 4. Vérifier la limite globale (si définie)
    if (promo.max_uses && usedBy.length >= promo.max_uses) {
      return res.status(400).json({ error: 'Limite d\'utilisation atteinte' });
    }

    // 5. Ajouter les tokens à l'utilisateur (cumul)
    // On récupère le solde actuel pour éviter l'écrasement
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('tokens_remaining')
      .eq('id', userId)
      .single();
    if (userError || !user) {
      return res.status(400).json({ error: 'Utilisateur introuvable' });
    }
    const newBalance = (user.tokens_remaining || 0) + promo.token_amount;
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ tokens_remaining: newBalance })
      .eq('id', userId);
    if (updateUserError) throw updateUserError;

    // 6. Ajouter userId à used_by[] (toujours repartir d'un tableau propre)
    const newUsedBy = [...(promo.used_by || []), String(userId).trim()].filter(Boolean);
    console.log('Mise à jour used_by pour le code', promo.code, ':', newUsedBy);

    const { error: updatePromoError } = await supabase
      .from('promo_codes')
      .update({ used_by: newUsedBy })
      .eq('id', promo.id);
    if (updatePromoError) throw updatePromoError;

    res.json({ success: true, tokens_awarded: promo.token_amount, new_balance: newBalance });
  } catch (error) {
    console.error('[PROMO ERROR]', error);
    res.status(500).json({ error: 'Erreur interne serveur' });
  }
});

module.exports = router; 