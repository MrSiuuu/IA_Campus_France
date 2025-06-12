import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    session: null
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
    },
    logout() {
      // Nettoyer le state
      this.session = null
      this.user = null
      this.isAuthenticated = false
      
      // Nettoyer le localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error)
        this.logout()
      }
    }
  }
}) 