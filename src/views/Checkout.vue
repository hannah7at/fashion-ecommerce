<script setup>
import { useRouter } from 'vue-router'
import productsData from '../data/products.json'

const router = useRouter()

const products = productsData.products || []

const placeOrder = () => {
  alert('Order placed successfully!')
  router.push('/')
}
</script>

<template>
  <div class="checkout">
    <h1>Checkout</h1>

    <div v-if="products.length > 0">
      <h2>Order Summary</h2>

      <div
        v-for="product in products.slice(0, 2)"
        :key="product.id"
        class="item"
      >
        <img
          :src="product.image"
          :alt="product.name"
        />

        <div>
          <h3>{{ product.name }}</h3>
          <p>${{ product.price }}</p>
        </div>
      </div>

      <button @click="placeOrder">
        Place Order
      </button>
    </div>

    <p v-else>No products available.</p>
  </div>
</template>

<style scoped>
.checkout {
  max-width: 1000px;
  margin: auto;
  padding: 40px 20px;
}

h1 {
  margin-bottom: 30px;
}

.item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.item img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

button {
  margin-top: 20px;
  padding: 14px 30px;
  background: black;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>