import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: !!localStorage.getItem('user'),
    user: JSON.parse(localStorage.getItem('user')) || null
  }),

  actions: {
    login(email, password) {
      if (email && password) {
        const userData = { email }
        this.isLoggedIn = true
        this.user = userData
        localStorage.setItem('user', JSON.stringify(userData))
      }
    },

    register(userData) {
      if (userData.email && userData.password) {
        const userInfo = { 
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone
        }
        this.isLoggedIn = true
        this.user = userInfo
        localStorage.setItem('user', JSON.stringify(userInfo))
      }
    },

    logout() {
      this.isLoggedIn = false
      this.user = null
      localStorage.removeItem('user')
    }
  }
})