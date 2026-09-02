```vue
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import productsData from '../data/products.json'

const router = useRouter()

const products = productsData.products

const cartItems = computed(() => {
  return products.slice(0, 2)
})

const total = computed(() => {
  return cartItems.value.reduce((sum, product) => {
    return sum + Number(product.price)
  }, 0)
})

const placeOrder = () => {
  alert('Order placed successfully!')
  router.push('/')
}
</script>

<template>
  <div class="checkout">
    <h1>Checkout</h1>

    <div v-if="cartItems.length" class="checkout-container">
      <div class="items">
        <h2>Order Summary</h2>

        <div
          v-for="product in cartItems"
          :key="product.id"
          class="item"
        >
          <img :src="product.image" :alt="product.name" />

          <div>
            <h3>{{ product.name }}</h3>
            <p>${{ product.price }}</p>
          </div>
        </div>
      </div>

      <div class="summary">
        <h2>Total</h2>
        <p class="total">${{ total.toFixed(2) }}</p>

        <button @click="placeOrder">
          Place Order
        </button>
      </div>
    </div>

    <div v-else>
      <p>Your cart is empty.</p>
    </div>
  </div>
</template>

<style scoped>
.checkout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

.checkout h1 {
  margin-bottom: 30px;
}

.checkout-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.item {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.item img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.summary {
  padding: 25px;
  border: 1px solid #ddd;
  border-radius: 10px;
  height: fit-content;
}

.total {
  font-size: 28px;
  font-weight: bold;
}

button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: black;
  color: white;
  cursor: pointer;
}

@media (max-width: 768px) {
  .checkout-container {
    grid-template-columns: 1fr;
  }
}
</style>
```
