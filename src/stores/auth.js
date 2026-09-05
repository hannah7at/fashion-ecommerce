import { defineStore } from 'pinia'

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

const getAccount = (email) => {
  if (!email) return null

  try {
    return JSON.parse(
      localStorage.getItem(`account_${email.toLowerCase()}`)
    ) || null
  } catch {
    return null
  }
}

const getFavoritesForUser = (email) => {
  if (!email) return []

  try {
    const favorites = JSON.parse(
      localStorage.getItem(`favorites_${email.toLowerCase()}`)
    )

    return Array.isArray(favorites) ? favorites : []
  } catch {
    return []
  }
}

const getOrdersForUser = (email) => {
  if (!email) return []

  try {
    const orders = JSON.parse(
      localStorage.getItem(`orders_${email.toLowerCase()}`)
    )

    return Array.isArray(orders) ? orders : []
  } catch {
    return []
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const storedUser = getStoredUser()

    return {
      isLoggedIn: !!storedUser,

      user: storedUser,

      favorites: storedUser
        ? getFavoritesForUser(storedUser.email)
        : [],

      orders: storedUser
        ? getOrdersForUser(storedUser.email)
        : []
    }
  },

  actions: {
    register(userData) {
      if (
        !userData.fullName ||
        !userData.email ||
        !userData.password
      ) {
        return {
          success: false,
          message: 'Please fill in all required fields.'
        }
      }

      const email = userData.email
        .trim()
        .toLowerCase()

      const existingAccount = getAccount(email)

      if (existingAccount) {
        return {
          success: false,
          message: 'This email is already registered.'
        }
      }

      const account = {
        fullName: userData.fullName.trim(),
        email,
        phone: userData.phone?.trim() || '',
        password: userData.password,
        avatar: userData.avatar || ''
      }

      const userInfo = {
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        avatar: account.avatar
      }

      localStorage.setItem(
        `account_${email}`,
        JSON.stringify(account)
      )

      localStorage.setItem(
        `favorites_${email}`,
        JSON.stringify([])
      )

      localStorage.setItem(
        `orders_${email}`,
        JSON.stringify([])
      )

      localStorage.setItem(
        'user',
        JSON.stringify(userInfo)
      )

      this.isLoggedIn = true
      this.user = userInfo
      this.favorites = []
      this.orders = []

      return {
        success: true,
        message: 'Account created successfully.'
      }
    },

    login(email, password) {
      if (!email || !password) {
        return {
          success: false,
          message: 'Please enter your email and password.'
        }
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase()

      const account = getAccount(normalizedEmail)

      if (!account) {
        this.isLoggedIn = false
        this.user = null
        this.favorites = []
        this.orders = []

        return {
          success: false,
          message: 'No account found with this email.'
        }
      }

      if (account.password !== password) {
        this.isLoggedIn = false
        this.user = null
        this.favorites = []
        this.orders = []

        return {
          success: false,
          message: 'Incorrect password.'
        }
      }

      const userInfo = {
        fullName: account.fullName,
        email: account.email,
        phone: account.phone || '',
        avatar: account.avatar || ''
      }

      this.isLoggedIn = true
      this.user = userInfo

      this.favorites = getFavoritesForUser(
        normalizedEmail
      )

      this.orders = getOrdersForUser(
        normalizedEmail
      )

      localStorage.setItem(
        'user',
        JSON.stringify(userInfo)
      )

      return {
        success: true,
        message: 'Login successful.'
      }
    },

    logout() {
      this.isLoggedIn = false
      this.user = null
      this.favorites = []
      this.orders = []

      localStorage.removeItem('user')
    },

    toggleFavorite(productId) {
      if (!this.isLoggedIn || !this.user?.email) {
        return false
      }

      const index = this.favorites.indexOf(productId)

      if (index === -1) {
        this.favorites.push(productId)
      } else {
        this.favorites.splice(index, 1)
      }

      localStorage.setItem(
        `favorites_${this.user.email.toLowerCase()}`,
        JSON.stringify(this.favorites)
      )

      return true
    },

    isFavorite(productId) {
      return this.favorites.includes(productId)
    },

    addOrder(order) {
      if (!this.isLoggedIn || !this.user?.email) {
        return false
      }

      this.orders.unshift(order)

      localStorage.setItem(
        `orders_${this.user.email.toLowerCase()}`,
        JSON.stringify(this.orders)
      )

      return true
    },

    updateUser(updatedData) {
      if (!this.user) {
        return
      }

      const oldEmail = this.user.email
        .trim()
        .toLowerCase()

      const newEmail = (
        updatedData.email || oldEmail
      )
        .trim()
        .toLowerCase()

      const oldAccount = getAccount(oldEmail)

      const updatedUser = {
        fullName:
          updatedData.fullName ||
          this.user.fullName,

        email: newEmail,

        phone:
          updatedData.phone ??
          this.user.phone ??
          '',

        avatar:
          updatedData.avatar ??
          this.user.avatar ??
          ''
      }

      const updatedAccount = {
        ...(oldAccount || {}),
        ...updatedUser
      }

      if (oldEmail !== newEmail) {
        const existingNewAccount =
          getAccount(newEmail)

        if (existingNewAccount) {
          return
        }

        const oldFavorites =
          getFavoritesForUser(oldEmail)

        const oldOrders =
          getOrdersForUser(oldEmail)

        localStorage.setItem(
          `favorites_${newEmail}`,
          JSON.stringify(oldFavorites)
        )

        localStorage.setItem(
          `orders_${newEmail}`,
          JSON.stringify(oldOrders)
        )

        localStorage.removeItem(
          `favorites_${oldEmail}`
        )

        localStorage.removeItem(
          `orders_${oldEmail}`
        )

        localStorage.removeItem(
          `account_${oldEmail}`
        )
      }

      localStorage.setItem(
        `account_${newEmail}`,
        JSON.stringify(updatedAccount)
      )

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      )

      this.user = updatedUser

      this.favorites =
        getFavoritesForUser(newEmail)

      this.orders =
        getOrdersForUser(newEmail)
    }
  }
})

