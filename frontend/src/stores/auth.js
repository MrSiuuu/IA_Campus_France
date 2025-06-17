import { defineStore } from 'pinia'
import axios from '../config/axios'
import router from '../router'

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch (e) {
    return true
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    session: null,
    checkInterval: null
  }),
  actions: {
    login(session, user) {
      if (!session || !session.access_token) {
        console.error('Session invalide')
        return
      }
      
      // Stocker la session et l'utilisateur
      this.session = session
      this.user = user
      this.isAuthenticated = true
      
      // Stocker dans le localStorage
      localStorage.setItem('token', JSON.stringify(session))
      localStorage.setItem('user', JSON.stringify(user))

      // Démarrer la vérification périodique
      this.startTokenCheck()
    },
    async logout() {
      try {
        // Appeler la route de déconnexion
        await axios.post('/auth/logout')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      } finally {
        // Nettoyer le state
        this.session = null
        this.user = null
        this.isAuthenticated = false
        
        // Nettoyer le localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Arrêter la vérification périodique
        this.stopTokenCheck()

        // Rediriger vers la page de connexion
        if (router.currentRoute.value.path !== '/login') {
          await router.push('/login')
        }
      }
    },
    async checkAuth() {
      try {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        
        if (!token || !user) {
          await this.logout()
          return
        }
        
        const session = JSON.parse(token)
        const parsedUser = JSON.parse(user)
        
        // Tenter de rafraîchir le token immédiatement
        try {
          const response = await axios.post('/auth/refresh-token')
          if (response.data.session) {
            this.session = response.data.session
            this.user = response.data.user
            localStorage.setItem('token', JSON.stringify(response.data.session))
            localStorage.setItem('user', JSON.stringify(response.data.user))
            this.isAuthenticated = true
            this.startTokenCheck()
            return
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement du token:', error)
          if (error.response?.status === 401) {
            await this.logout()
            return
          }
        }

        // Si le rafraîchissement échoue, vérifier le token actuel
        if (!session.access_token || isTokenExpired(session.access_token)) {
          await this.logout()
          return
        }

        this.session = session
        this.user = parsedUser
        this.isAuthenticated = true
        this.startTokenCheck()
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error)
        await this.logout()
      }
    },
    async checkToken() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          await this.logout()
          return false
        }

        const session = JSON.parse(token)
        if (!session.access_token || isTokenExpired(session.access_token)) {
          // Tenter de rafraîchir le token
          const response = await axios.post('/auth/refresh-token')
          if (response.data.session) {
            this.session = response.data.session
            this.user = response.data.user
            localStorage.setItem('token', JSON.stringify(response.data.session))
            localStorage.setItem('user', JSON.stringify(response.data.user))
            return true
          }
          await this.logout()
          return false
        }

        return true
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error)
        await this.logout()
        return false
      }
    },
    startTokenCheck() {
      this.stopTokenCheck()
      // Vérifier toutes les 15 minutes au lieu de 55
      this.checkInterval = setInterval(async () => {
        if (!this.isAuthenticated) return
        await this.checkToken()
      }, 1000 * 60 * 15)
    },
    stopTokenCheck() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval)
        this.checkInterval = null
      }
    }
  }
}) 