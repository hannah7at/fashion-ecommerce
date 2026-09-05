
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalPrice = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  })

  const totalItemsCount = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
  })

  function addToCart(product) {
    const existingItem = items.value.find(
      (item) => item.id === product.id
    )

    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        ...product,
        quantity: 1
      })
    }

    return product
  }

  function removeFromCart(productId) {
    items.value = items.value.filter(
      (item) => item.id !== productId
    )
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(
      (item) => item.id === productId
    )

    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalPrice,
    totalItemsCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})