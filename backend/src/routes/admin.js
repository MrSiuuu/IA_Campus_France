const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')
const { authenticateToken, isAdmin } = require('../middleware/auth')

// Middleware d'authentification et de vérification du rôle admin pour toutes les routes
router.use(authenticateToken, isAdmin)

// Récupérer les statistiques générales
router.get('/stats', async (req, res) => {
  try {
    // Compter le nombre total d'étudiants
    const { count: studentCount, error: studentError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')

    if (studentError) throw studentError

    // Compter le nombre total de messages
    const { count: messageCount, error: messageError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    if (messageError) throw messageError

    // Calculer le total des tokens consommés
    const { data: tokensData, error: tokensError } = await supabase
      .from('messages')
      .select('tokens_used')

    if (tokensError) throw tokensError

    const totalTokens = tokensData.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0)

    // Compter les documents partagés
    const { count: documentCount, error: documentError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('is_shared', true)

    if (documentError) throw documentError

    // Statistiques mensuelles des nouveaux étudiants
    const { data: monthlyStudents, error: monthlyError } = await supabase
      .from('users')
      .select('created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: true })

    if (monthlyError) throw monthlyError

    const monthlyStats = monthlyStudents.reduce((acc, user) => {
      const month = new Date(user.created_at).toLocaleString('fr-FR', { month: 'long' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    // Analyse des messages par jour de la semaine
    const { data: messagesByDay, error: dayError } = await supabase
      .from('messages')
      .select('created_at')

    if (dayError) throw dayError

    const dayStats = messagesByDay.reduce((acc, msg) => {
      const day = new Date(msg.created_at).toLocaleString('fr-FR', { weekday: 'long' })
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})

    // Distribution des types de documents
    const { data: documentTypes, error: typeError } = await supabase
      .from('documents')
      .select('file_type')

    if (typeError) throw typeError

    const typeStats = documentTypes.reduce((acc, doc) => {
      acc[doc.file_type] = (acc[doc.file_type] || 0) + 1
      return acc
    }, {})

    // Activité des utilisateurs par heure
    const { data: userActivity, error: activityError } = await supabase
      .from('messages')
      .select('created_at')

    if (activityError) throw activityError

    const hourStats = userActivity.reduce((acc, msg) => {
      const hour = new Date(msg.created_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    // Distribution des tokens par type de message
    const { data: tokenDistribution, error: tokenError } = await supabase
      .from('messages')
      .select('role, tokens_used')

    if (tokenError) throw tokenError

    const tokenStats = tokenDistribution.reduce((acc, msg) => {
      acc[msg.role] = (acc[msg.role] || 0) + (msg.tokens_used || 0)
      return acc
    }, {})

    res.json({
      totalStudents: studentCount,
      totalMessages: messageCount,
      totalTokens,
      sharedDocuments: documentCount,
      monthlyStudents: monthlyStats,
      messagesByDay: dayStats,
      documentTypes: typeStats,
      userActivity: hourStats,
      tokenDistribution: tokenStats
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer la liste des utilisateurs
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Mettre à jour un utilisateur
router.put('/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Utilisateur non trouvé' })

    res.json(data)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error

    res.json({ message: 'Utilisateur supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les documents partagés
router.get('/shared-documents', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .eq('is_shared', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Erreur lors de la récupération des documents partagés:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les documents de la base de connaissances
router.get('/knowledge-documents', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('file_type', 'knowledge')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Erreur lors de la récupération des documents de la base de connaissances:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les conversations avec leurs statistiques
router.get('/chats', async (req, res) => {
  try {
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .order('updated_at', { ascending: false })

    if (convError) throw convError

    // Pour chaque conversation, récupérer le nombre de messages et de tokens
    const conversationsWithStats = await Promise.all(
      conversations.map(async (conv) => {
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('tokens_used')
          .eq('conversation_id', conv.id)

        if (msgError) throw msgError

        const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0)

        return {
          ...conv,
          messageCount: messages.length,
          totalTokens
        }
      })
    )

    res.json(conversationsWithStats)
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

module.exports = router 