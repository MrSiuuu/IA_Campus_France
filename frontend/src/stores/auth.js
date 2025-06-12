import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: !!localStorage.getItem('token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  }),
  actions: {
    login(token, user) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      this.isAuthenticated = true
      this.user = user
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.isAuthenticated = false
      this.user = null
    },
    checkAuth() {
      this.isAuthenticated = !!localStorage.getItem('token')
      this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    }
  }
}) 