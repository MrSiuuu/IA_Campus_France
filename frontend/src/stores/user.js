import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
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

    clearUser() {
      this.user = null
      localStorage.removeItem('user')
    }
  }
}) 