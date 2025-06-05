const supabase = require('../config/supabase')

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou format invalide' })
  }
  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw error
    if (!user) return res.status(401).json({ error: 'Token invalide' })
    
    req.user = user
    next()
  } catch (error) {
    console.error('Erreur d\'authentification:', error)
    return res.status(401).json({ error: 'Token invalide' })
  }
}

const isAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single()

    if (error) throw error
    if (!data || data.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' })
    }

    next()
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}

module.exports = { authenticateToken, isAdmin } 