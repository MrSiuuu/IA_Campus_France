import axios from 'axios'

// Configuration de base d'axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Intercepteur pour ajouter le token à chaque requête
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      const session = JSON.parse(token)
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si le token est invalide, on déconnecte l'utilisateur
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axios 