import { defineStore } from 'pinia'
import axios from '../config/axios'

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
    logout() {
      // Nettoyer le state
      this.session = null
      this.user = null
      this.isAuthenticated = false
      
      // Nettoyer le localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Arrêter la vérification périodique
      this.stopTokenCheck()
    },
    checkAuth() {
      try {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        
        if (!token || !user) {
          this.logout()
          return
        }
        
        const session = JSON.parse(token)
        const parsedUser = JSON.parse(user)
        
        if (!session.access_token) {
          this.logout()
          return
        }
        
        this.session = session
        this.user = parsedUser
        this.isAuthenticated = true

        // Démarrer la vérification périodique
        this.startTokenCheck()
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error)
        this.logout()
      }
    },
    async checkToken() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.logout()
          return
        }

        const response = await axios.post('/api/auth/refresh-token')
        if (response.data.user) {
          // Le token est toujours valide
          return true
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error)
        this.logout()
        return false
      }
    },
    startTokenCheck() {
      // Vérifier le token toutes les 30 minutes
      this.checkInterval = setInterval(() => {
        this.checkToken()
      }, 30 * 60 * 1000)
    },
    stopTokenCheck() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval)
        this.checkInterval = null
      }
    }
  }
}) 