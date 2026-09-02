<script setup>
import ProductCard from '../components/ProductCard.vue'
import productsData from '../data/products.json'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()

const handleAddToCart = (product) => {
  cartStore.addToCart(product)
}
</script>

<template>
  <div class="home-page container py-5">
    <h1 class="text-center mb-4">Fashion Collection</h1>
    <div class="row g-4">
      <div 
        v-for="product in productsData.products" 
        :key="product.id" 
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <ProductCard 
          :product="product" 
          @add-to-cart="handleAddToCart"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  font-family: var(--font-family-base);
}
</style>