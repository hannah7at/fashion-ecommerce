<script setup>
import { computed, ref } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import productsData from '../data/products.json'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()

const search = ref('')
const selectedCategory = ref('')
const maxPrice = ref('')

const products = productsData.products

const categories = computed(() => {
  return [...new Set(products.map(product => product.category))]
})

const filteredProducts = computed(() => {
  return products.filter(product => {
    const searchMatch =
      search.value === '' ||
      product.name.toLowerCase().includes(search.value.toLowerCase())

    const categoryMatch =
      selectedCategory.value === '' ||
      product.category === selectedCategory.value

    const priceMatch =
      maxPrice.value === '' ||
      product.price <= Number(maxPrice.value)

    return searchMatch && categoryMatch && priceMatch
  })
})

const handleAddToCart = (product) => {
  cartStore.addToCart(product)
}
</script>

<template>
  <div class="home-page container py-4">
    <h1 class="text-center mb-4">
      Fashion Collection
    </h1>

    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <label class="form-label">
          Search
        </label>

        <input
          v-model="search"
          type="text"
          class="form-control"
          placeholder="Search by product name"
        />
      </div>

      <div class="col-md-4 mb-3">
        <label class="form-label">
          Category
        </label>

        <select
          v-model="selectedCategory"
          class="form-select"
        >
          <option value="">
            All Categories
          </option>

          <option
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>

      <div class="col-md-4 mb-3">
        <label class="form-label">
          Maximum Price
        </label>

        <input
          v-model="maxPrice"
          type="number"
          class="form-control"
          placeholder="Enter maximum price"
        />
      </div>
    </div>

    <div class="row g-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <ProductCard
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>
    </div>

    <p
      v-if="filteredProducts.length === 0"
      class="text-center mt-4"
    >
      No products found.
    </p>
  </div>
</template>

<style scoped>
.home-page {
  font-family: var(--font-family-base);
}
</style>