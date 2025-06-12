const supabase = require('../config/supabase')

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou format invalide' })
  }
  const token = authHeader.split(' ')[1]

  try {
    // Vérifier si le token est valide
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    // Vérifier si le token correspond à la session
    if (!session || session.access_token !== token) {
      return res.status(401).json({ error: 'Session invalide' })
    }

    // Récupérer les informations de l'utilisateur
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError) throw userError
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' })
    
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