import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null
  }),

  actions: {
    login(email, password) {
      if (email && password) {
        this.isLoggedIn = true
        this.user = { email }
      }
    },

    register(userData) {
      if (userData.email && userData.password) {
        this.isLoggedIn = true
        this.user = { 
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone
        }
      }
    },

    logout() {
      this.isLoggedIn = false
      this.user = null
    }
  }
})