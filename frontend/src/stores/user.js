import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null
  }),

  actions: {
    setUser(user) {
      if (!user) {
        this.clearUser()
        return
      }
      
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    clearUser() {
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }
}) 