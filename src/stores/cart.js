import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

  getters: {
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  actions: {
    addToCart(product) {
      const item = this.items.find(i => i.id === product.id)

      if (item) {
        item.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
    },

    removeFromCart(id) {
      this.items = this.items.filter(i => i.id !== id)
    },

    updateQuantity(id, qty) {
      const item = this.items.find(i => i.id === id)
      if (item && qty > 0) item.quantity = qty
    },

    clearCart() {
      this.items = []
    }
  }
})