```vue
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import productsData from '../data/products.json'

const route = useRoute()
const router = useRouter()

const products = productsData.products

const product = computed(() => {
  return products.find(item => String(item.id) === String(route.params.id))
})

const goToCheckout = () => {
  router.push('/checkout')
}
</script>

<template>
  <div class="product-details">
    <div v-if="product" class="product-container">
      <div class="product-image">
        <img :src="product.image" :alt="product.name" />
      </div>

      <div class="product-info">
        <h1>{{ product.name }}</h1>

        <p class="price">${{ product.price }}</p>

        <p class="description">
          {{ product.description }}
        </p>

        <button class="checkout-btn" @click="goToCheckout">
          Proceed to Checkout
        </button>

        <button class="back-btn" @click="router.back()">
          Back
        </button>
      </div>
    </div>

    <div v-else class="not-found">
      <h2>Product Not Found</h2>
      <button @click="router.push('/')">
        Back to Home
      </button>
    </div>
  </div>
</template>

<style scoped>
.product-details {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: center;
}

.product-image img {
  width: 100%;
  max-height: 600px;
  object-fit: contain;
  border-radius: 12px;
}

.product-info h1 {
  font-size: 36px;
  margin-bottom: 20px;
}

.price {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.description {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.checkout-btn,
.back-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 10px;
}

.checkout-btn {
  background: black;
  color: white;
}

.back-btn {
  background: #eee;
  color: black;
}

.not-found {
  text-align: center;
  padding: 100px 20px;
}

@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
  }
}
</style>
```
