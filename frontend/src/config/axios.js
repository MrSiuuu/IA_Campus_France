import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import router from '../router'

let alreadyRedirecting = false

// Configuration de base d'axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Intercepteur pour ajouter le token à chaque requête
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const session = JSON.parse(token)
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`
        }
      } catch (error) {
        console.error('Erreur lors de la lecture du token:', error)
        // Nettoyer le token invalide
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
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
  async (error) => {
    if (error.response?.status === 401 && !alreadyRedirecting) {
      const currentPath = router.currentRoute.value.path
      if (!['/login', '/register'].includes(currentPath)) {
        alreadyRedirecting = true
        
        // Tenter de rafraîchir le token
        try {
          const response = await axios.post('/auth/refresh-token')
          if (response.data.session) {
            // Mettre à jour le token dans le localStorage
            localStorage.setItem('token', JSON.stringify(response.data.session))
            
            // Réessayer la requête originale avec le nouveau token
            const config = error.config
            config.headers.Authorization = `Bearer ${response.data.session.access_token}`
            alreadyRedirecting = false
            return axios(config)
          }
        } catch (refreshError) {
          console.error('Erreur lors du rafraîchissement du token:', refreshError)
          const authStore = useAuthStore()
          await authStore.logout()
        } finally {
          alreadyRedirecting = false
        }
      }
    } else if (!error.response) {
      // Erreur réseau
      console.error('Erreur réseau:', error)
      // Ne pas déconnecter l'utilisateur en cas d'erreur réseau
    }
    return Promise.reject(error)
  }
)

export default axios 