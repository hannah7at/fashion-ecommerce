<template>
  <div class="container py-4">

    <h1 class="text-center mb-4">
      Our Products
    </h1>
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <label class="form-label">
          Search
        </label>
        <input
          type="text"
          v-model="search"
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
          type="number"
          v-model="maxPrice"
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
        <ProductCard :product="product" />
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

<script>
import ProductCard from '../components/ProductCard.vue'
import data from '../data/products.json'
export default {
  components: {
    ProductCard
  },
  data() {
    return {
      products: data.products,
      search: '',
      selectedCategory: '',
      maxPrice: ''
    }
  },
  computed: {
    categories() {
      return [
        ...new Set(
          this.products.map(product => product.category)
        )
      ]
    },
    filteredProducts() {
      return this.products.filter(product => {
        const searchMatch =
          this.search === '' ||
          product.name.toLowerCase().includes(this.search.toLowerCase())
        const categoryMatch =
          this.selectedCategory === '' ||
          product.category === this.selectedCategory
        const priceMatch =
          this.maxPrice === '' ||
          product.price <= Number(this.maxPrice)
        return searchMatch && categoryMatch && priceMatch
      })
    }
  }
}
</script>