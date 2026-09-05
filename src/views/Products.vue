<script setup>
import {
  computed,
  ref,
  onMounted,
  onBeforeUnmount
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import productsData from '../data/products.json'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()

const products = productsData.products

const search = ref('')
const selectedCategory = ref('')
const selectedGender = ref('')
const maxPrice = ref('')

const isCategoryOpen = ref(false)
const isGenderOpen = ref(false)

const categoryDropdownRef = ref(null)
const genderDropdownRef = ref(null)

/* =========================
   CART TOAST
========================= */

const showCartToast = ref(false)
const toastProduct = ref(null)
let toastTimer = null

const showAddedToCartMessage = (product) => {
  toastProduct.value = product
  showCartToast.value = true

  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  toastTimer = setTimeout(() => {
    showCartToast.value = false
  }, 3000)
}

const closeCartToast = () => {
  showCartToast.value = false

  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
}

/* =========================
   NORMALIZE
========================= */

const normalize = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
}

/* =========================
   CATEGORY MATCHING
========================= */

const categoryMatches = (
  productCategory,
  selectedValue
) => {
  const category = normalize(productCategory)
  const selected = normalize(selectedValue)

  if (!selected) {
    return true
  }

  if (selected === 'dress') {
    return (
      category === 'dress' ||
      category === 'dresses'
    )
  }

  if (selected === 'shirt') {
    return (
      category === 'shirt' ||
      category === 'shirts' ||
      category === 't-shirt' ||
      category === 't-shirts' ||
      category === 'tshirt'
    )
  }

  if (selected === 'shoes') {
    return (
      category === 'shoes' ||
      category === 'shoe' ||
      category === 'slippers' ||
      category === "women's-shoes" ||
      category === "men's-shoes"
    )
  }

  if (selected === 'bags') {
    return (
      category === 'bag' ||
      category === 'bags' ||
      category === 'handbag' ||
      category === 'handbags' ||
      category === "women's-bags" ||
      category === "men's-bags"
    )
  }

  if (selected === 'accessories') {
    return (
      category === 'accessories' ||
      category === 'accessory' ||
      category === 'watch' ||
      category === "women's-watches" ||
      category === 'jewelry' ||
      category === 'jewellery' ||
      category === "women's-jewellery"
    )
  }

  if (selected === 'jacket') {
    return (
      category === 'jacket' ||
      category === 'jackets' ||
      category === 'coat' ||
      category === 'coats'
    )
  }

  return category === selected
}

/* =========================
   CATEGORIES
========================= */

const categories = computed(() => {
  const categorySet = new Set()

  products.forEach(product => {
    const category = normalize(product.category)

    if (category) {
      categorySet.add(category)
    }
  })

  return [...categorySet].sort()
})

const formatCategoryName = (category) => {
  if (!category) {
    return 'All Categories'
  }

  const specialNames = {
    't-shirt': 'T-Shirts',
    't-shirts': 'T-Shirts',
    tshirt: 'T-Shirts',
    shoes: 'Shoes',
    shoe: 'Shoes',
    slippers: 'Slippers',
    bags: 'Bags',
    bag: 'Bags',
    handbag: 'Handbags',
    handbags: 'Handbags',
    accessories: 'Accessories',
    accessory: 'Accessories',
    jewelry: 'Jewelry',
    jewellery: 'Jewelry',
    "women's-watches": "Women's Watches",
    "women's-jewellery": "Women's Jewelry",
    "women's-shoes": "Women's Shoes",
    "men's-shoes": "Men's Shoes",
    "men's-pants": "Men's Pants",
    "men's-cargo-pants": "Men's Cargo Pants"
  }

  if (specialNames[category]) {
    return specialNames[category]
  }

  return category
    .split('-')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

const selectedCategoryLabel = computed(() => {
  return formatCategoryName(selectedCategory.value)
})

const selectedGenderLabel = computed(() => {
  if (!selectedGender.value) {
    return 'All'
  }

  if (selectedGender.value === 'women') {
    return 'Women'
  }

  if (selectedGender.value === 'men') {
    return 'Men'
  }

  return 'All'
})

/* =========================
   PAGE TITLE
========================= */

const pageTitle = computed(() => {
  if (selectedGender.value === 'men') {
    return 'Men Collection'
  }

  if (selectedGender.value === 'women') {
    return 'Women Collection'
  }

  if (selectedCategory.value === 'dress') {
    return 'Dresses'
  }

  if (selectedCategory.value === 'shirt') {
    return 'Shirts'
  }

  if (selectedCategory.value === 'shoes') {
    return 'Shoes'
  }

  if (selectedCategory.value === 'bags') {
    return 'Bags'
  }

  if (selectedCategory.value === 'accessories') {
    return 'Accessories'
  }

  if (selectedCategory.value === 'jacket') {
    return 'Jackets'
  }

  return 'Shop All Products'
})

const pageDescription = computed(() => {
  if (selectedGender.value === 'men') {
    return 'Discover our latest collection of men’s fashion.'
  }

  if (selectedGender.value === 'women') {
    return 'Discover our latest collection of women’s fashion.'
  }

  if (selectedCategory.value) {
    return `Explore our ${pageTitle.value.toLowerCase()} collection.`
  }

  return 'Discover our latest fashion pieces and find your perfect style.'
})

/* =========================
   FILTERED PRODUCTS
========================= */

const filteredProducts = computed(() => {
  return products.filter(product => {
    const productName = normalize(product.name)
    const searchText = normalize(search.value)

    const searchMatch =
      searchText === '' ||
      productName.includes(searchText)

    const categoryMatch =
      selectedCategory.value === '' ||
      categoryMatches(
        product.category,
        selectedCategory.value
      )

    const genderMatch =
      selectedGender.value === '' ||
      normalize(product.gender) === selectedGender.value

    const priceMatch =
      maxPrice.value === '' ||
      Number(product.price) <= Number(maxPrice.value)

    return (
      searchMatch &&
      categoryMatch &&
      genderMatch &&
      priceMatch
    )
  })
})

/* =========================
   PRODUCT DETAILS
========================= */

/*
 * Open the product details page.
 *
 * ProductCard emits "view-product"
 * when the user clicks the image or product name.
 */
const openProduct = (product) => {
  if (!product?.id) {
    return
  }

  router.push(`/product/${product.id}`)
}

/* =========================
   ADD TO CART
========================= */

const handleAddToCart = (product) => {
  cartStore.addToCart(product)
  showAddedToCartMessage(product)
}

/* =========================
   DROPDOWNS
========================= */

const toggleCategoryDropdown = () => {
  isCategoryOpen.value = !isCategoryOpen.value

  if (isCategoryOpen.value) {
    isGenderOpen.value = false
  }
}

const toggleGenderDropdown = () => {
  isGenderOpen.value = !isGenderOpen.value

  if (isGenderOpen.value) {
    isCategoryOpen.value = false
  }
}

const selectCategory = (category) => {
  selectedCategory.value = category
  isCategoryOpen.value = false
}

const selectGender = (gender) => {
  selectedGender.value = gender
  isGenderOpen.value = false
}

/* =========================
   CLICK OUTSIDE
========================= */

const handleClickOutside = (event) => {
  if (
    categoryDropdownRef.value &&
    !categoryDropdownRef.value.contains(event.target)
  ) {
    isCategoryOpen.value = false
  }

  if (
    genderDropdownRef.value &&
    !genderDropdownRef.value.contains(event.target)
  ) {
    isGenderOpen.value = false
  }
}

/* =========================
   CLEAR FILTERS
========================= */

const clearFilters = () => {
  search.value = ''
  selectedCategory.value = ''
  selectedGender.value = ''
  maxPrice.value = ''

  isCategoryOpen.value = false
  isGenderOpen.value = false

  router.push('/products')
}

/* =========================
   ROUTE FILTERS
========================= */

const applyRouteFilters = () => {
  const routeCategory =
    typeof route.query.category === 'string'
      ? normalize(route.query.category)
      : ''

  const routeGender =
    typeof route.query.gender === 'string'
      ? normalize(route.query.gender)
      : ''

  selectedCategory.value = routeCategory
  selectedGender.value = routeGender
}

/* =========================
   LIFECYCLE
========================= */

onMounted(() => {
  applyRouteFilters()

  document.addEventListener(
    'click',
    handleClickOutside
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    handleClickOutside
  )

  if (toastTimer) {
    clearTimeout(toastTimer)
  }
})
</script>

<template>
  <div class="products-page">

    <!-- HEADER -->
    <section class="products-header">
      <div class="container">

        <p class="eyebrow">
          OUR COLLECTION
        </p>

        <h1>
          {{ pageTitle }}
        </h1>

        <p class="header-description">
          {{ pageDescription }}
        </p>

      </div>
    </section>

    <!-- FILTERS -->
    <section class="filters-section">
      <div class="container">

        <div class="filters-card">

          <!-- SEARCH -->
          <div class="filter-group search-group">
            <label for="product-search">
              Search
            </label>

            <div class="input-wrapper">
              <span class="input-icon">
                ⌕
              </span>

              <input
                id="product-search"
                v-model="search"
                type="text"
                placeholder="Search by product name..."
              />
            </div>
          </div>

          <!-- CATEGORY -->
          <div
            ref="categoryDropdownRef"
            class="filter-group category-filter-group"
          >
            <label>
              Category
            </label>

            <div class="category-dropdown">

              <button
                type="button"
                class="category-trigger"
                :class="{
                  active: isCategoryOpen
                }"
                @click.stop="toggleCategoryDropdown"
              >
                <span
                  :class="{
                    'selected-text':
                      selectedCategory !== ''
                  }"
                >
                  {{ selectedCategoryLabel }}
                </span>

                <span
                  class="dropdown-arrow"
                  :class="{
                    rotated: isCategoryOpen
                  }"
                >
                  ↓
                </span>
              </button>

              <transition name="dropdown">
                <div
                  v-if="isCategoryOpen"
                  class="category-menu"
                >

                  <button
                    type="button"
                    class="category-option all-option"
                    :class="{
                      selected:
                        selectedCategory === ''
                    }"
                    @click="selectCategory('')"
                  >
                    <span>
                      All Categories
                    </span>

                    <span
                      v-if="selectedCategory === ''"
                      class="check-icon"
                    >
                      ✓
                    </span>
                  </button>

                  <div class="menu-divider"></div>

                  <button
                    v-for="category in categories"
                    :key="category"
                    type="button"
                    class="category-option"
                    :class="{
                      selected:
                        selectedCategory === category
                    }"
                    @click="selectCategory(category)"
                  >
                    <span>
                      {{ formatCategoryName(category) }}
                    </span>

                    <span
                      v-if="
                        selectedCategory === category
                      "
                      class="check-icon"
                    >
                      ✓
                    </span>
                  </button>

                </div>
              </transition>

            </div>
          </div>

          <!-- GENDER -->
          <div
            ref="genderDropdownRef"
            class="filter-group gender-filter-group"
          >
            <label>
              Gender
            </label>

            <div class="gender-dropdown">

              <button
                type="button"
                class="gender-trigger"
                :class="{
                  active: isGenderOpen
                }"
                @click.stop="toggleGenderDropdown"
              >
                <span
                  :class="{
                    'selected-text':
                      selectedGender !== ''
                  }"
                >
                  {{ selectedGenderLabel }}
                </span>

                <span
                  class="dropdown-arrow"
                  :class="{
                    rotated: isGenderOpen
                  }"
                >
                  ↓
                </span>
              </button>

              <transition name="dropdown">
                <div
                  v-if="isGenderOpen"
                  class="gender-menu"
                >

                  <button
                    type="button"
                    class="gender-option"
                    :class="{
                      selected:
                        selectedGender === ''
                    }"
                    @click="selectGender('')"
                  >
                    <span>
                      All
                    </span>

                    <span
                      v-if="selectedGender === ''"
                      class="check-icon"
                    >
                      ✓
                    </span>
                  </button>

                  <button
                    type="button"
                    class="gender-option"
                    :class="{
                      selected:
                        selectedGender === 'women'
                    }"
                    @click="selectGender('women')"
                  >
                    <span>
                      Women
                    </span>

                    <span
                      v-if="
                        selectedGender === 'women'
                      "
                      class="check-icon"
                    >
                      ✓
                    </span>
                  </button>

                  <button
                    type="button"
                    class="gender-option"
                    :class="{
                      selected:
                        selectedGender === 'men'
                    }"
                    @click="selectGender('men')"
                  >
                    <span>
                      Men
                    </span>

                    <span
                      v-if="
                        selectedGender === 'men'
                      "
                      class="check-icon"
                    >
                      ✓
                    </span>
                  </button>

                </div>
              </transition>

            </div>
          </div>

          <!-- PRICE -->
          <div class="filter-group">
            <label for="price-filter">
              Maximum Price
            </label>

            <div class="input-wrapper">
              <input
                id="price-filter"
                v-model="maxPrice"
                type="number"
                min="0"
                placeholder="Max price"
              />
            </div>
          </div>

          <!-- CLEAR -->
          <button
            type="button"
            class="clear-button"
            @click="clearFilters"
          >
            Clear
          </button>

        </div>

      </div>
    </section>

    <!-- PRODUCTS -->
    <section class="products-section">
      <div class="container">

        <div class="products-topbar">
          <div>

            <h2>
              {{ pageTitle }}
            </h2>

            <p>
              {{ filteredProducts.length }}
              {{
                filteredProducts.length === 1
                  ? 'product'
                  : 'products'
              }}
              found
            </p>

          </div>
        </div>

        <div
          v-if="filteredProducts.length > 0"
          class="products-grid"
        >

          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @view-product="openProduct"
            @add-to-cart="handleAddToCart"
          />

        </div>

        <div
          v-else
          class="empty-state"
        >

          <div class="empty-icon">
            🔍
          </div>

          <h3>
            No Products Found
          </h3>

          <p>
            Try changing your search or filters.
          </p>

          <button
            type="button"
            class="reset-button"
            @click="clearFilters"
          >
            Reset Filters
          </button>

        </div>

      </div>
    </section>

    <!-- CART TOAST -->
    <Transition name="cart-toast">
      <div
        v-if="showCartToast"
        class="cart-toast"
        role="status"
        aria-live="polite"
      >
        <div class="toast-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <div class="toast-content">
          <strong>
            Added to cart
          </strong>

          <span>
            {{ toastProduct?.name }}
          </span>
        </div>

        <button
          type="button"
          class="toast-close"
          aria-label="Close notification"
          @click="closeCartToast"
        >
          ×
        </button>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.products-page {
  min-height: 100vh;
  background-color: var(--color-white);
  font-family: var(--font-family-base);
}

/* =========================
   HEADER
========================= */

.products-header {
  padding: var(--space-16) 0 var(--space-12);
  background-color: var(--color-beige);
  text-align: center;
}

.eyebrow {
  margin-bottom: var(--space-3);
  color: var(--color-sand);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
}

.products-header h1 {
  margin-bottom: var(--space-4);
  color: var(--color-primary);
  font-size: 42px;
  font-weight: 600;
}

.header-description {
  max-width: 600px;
  margin: 0 auto;
  color: var(--color-gray);
  font-size: 15px;
  line-height: 1.7;
}

/* =========================
   FILTERS
========================= */

.filters-section {
  padding: var(--space-8) 0;
  background-color: var(--color-white);
}

.filters-card {
  display: grid;
  grid-template-columns: 2fr 1.15fr 1fr 1fr auto;
  align-items: end;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);
  background-color: var(--color-beige);
}

.filter-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.filter-group label {
  color: var(--color-gray);
  font-size: 13px;
  font-weight: 600;
}

.filter-group input {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-4);
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-default);
  outline: none;
  background-color: var(--color-white);
  color: var(--color-gray);
  font-family: inherit;
  font-size: 14px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-group input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(27, 59, 54, 0.06);
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  display: block;
}

.search-group .input-wrapper input {
  padding-left: 42px;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  z-index: 1;
  color: var(--color-sand);
  font-size: 21px;
  line-height: 1;
  transform: translateY(-50%);
}

/* =========================
   CUSTOM DROPDOWNS
========================= */

.category-filter-group,
.gender-filter-group {
  z-index: 10;
}

.category-dropdown,
.gender-dropdown {
  position: relative;
  width: 100%;
}

.category-trigger,
.gender-trigger {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-default);
  outline: none;
  background-color: var(--color-white);
  color: #777;
  font-family: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.category-trigger:hover,
.gender-trigger:hover {
  border-color: var(--color-sand);
}

.category-trigger.active,
.gender-trigger.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(27, 59, 54, 0.06);
}

.category-trigger .selected-text,
.gender-trigger .selected-text {
  color: var(--color-primary);
  font-weight: 500;
}

.dropdown-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: var(--color-primary);
  font-size: 17px;
  transition: transform 0.25s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* =========================
   CATEGORY MENU
========================= */

.category-menu,
.gender-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 50;
  padding: 7px;
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-default);
  background-color: var(--color-white);
  box-shadow:
    0 16px 35px rgba(27, 59, 54, 0.12),
    0 4px 12px rgba(27, 59, 54, 0.05);
}

.category-menu {
  max-height: 280px;
  overflow-y: auto;
}

.category-menu::-webkit-scrollbar {
  width: 5px;
}

.category-menu::-webkit-scrollbar-track {
  background: transparent;
}

.category-menu::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: var(--color-sand);
}

/* =========================
   CATEGORY / GENDER OPTIONS
========================= */

.category-option,
.gender-option {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  color: var(--color-gray);
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.category-option:hover,
.gender-option:hover {
  background-color: var(--color-beige);
  color: var(--color-primary);
}

.category-option.selected,
.gender-option.selected {
  background-color: var(--color-pink-light);
  color: var(--color-primary);
  font-weight: 600;
}

.category-option.all-option {
  font-weight: 500;
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
  font-size: 11px;
}

.menu-divider {
  height: 1px;
  margin: 5px 8px;
  background-color: var(--color-pink-light);
}

/* =========================
   BUTTONS
========================= */

.clear-button {
  height: 44px;
  padding: 0 var(--space-6);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-default);
  background-color: transparent;
  color: var(--color-primary);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.clear-button:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
  transform: translateY(-1px);
}

/* =========================
   DROPDOWN ANIMATION
========================= */

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* =========================
   PRODUCTS
========================= */

.products-section {
  padding: var(--space-4) 0 var(--space-16);
}

.products-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.products-topbar h2 {
  color: var(--color-primary);
  font-size: 26px;
}

.products-topbar p {
  margin-top: var(--space-1);
  color: var(--color-sand);
  font-size: 13px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-6);
}

/* =========================
   EMPTY STATE
========================= */

.empty-state {
  padding: var(--space-16) var(--space-4);
  text-align: center;
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);
  background-color: var(--color-beige);
}

.empty-icon {
  margin-bottom: var(--space-4);
  font-size: 40px;
}

.empty-state h3 {
  margin-bottom: var(--space-2);
  color: var(--color-primary);
  font-size: 22px;
}

.empty-state p {
  margin-bottom: var(--space-6);
  color: var(--color-gray);
  font-size: 14px;
}

.reset-button {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-default);
  background-color: var(--color-primary);
  color: var(--color-white);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.reset-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

/* =========================
   CART TOAST
========================= */

.cart-toast {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 9999;

  width: min(380px, calc(100vw - 32px));
  display: flex;
  align-items: center;
  gap: 14px;

  padding: 15px 16px;

  border: 1px solid var(--color-pink-light);
  border-radius: 14px;

  background-color: var(--color-white);

  box-shadow:
    0 18px 45px rgba(27, 59, 54, 0.16),
    0 5px 15px rgba(27, 59, 54, 0.08);
}

.toast-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
}

.toast-icon svg {
  width: 20px;
  height: 20px;
}

.toast-content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.toast-content strong {
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
}

.toast-content span {
  overflow: hidden;
  color: var(--color-gray);
  font-size: 12px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  padding: 0;
  border: none;
  border-radius: 50%;

  background-color: transparent;
  color: var(--color-sand);

  font-family: inherit;
  font-size: 22px;
  line-height: 1;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.toast-close:hover {
  background-color: var(--color-beige);
  color: var(--color-primary);
}

/* =========================
   CART TOAST ANIMATION
========================= */

.cart-toast-enter-active,
.cart-toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.cart-toast-enter-from,
.cart-toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* =========================
   TABLET
========================= */

@media (max-width: 1200px) {
  .filters-card {
    grid-template-columns: 2fr 1fr 1fr;
  }

  .search-group {
    grid-column: 1 / -1;
  }

  .clear-button {
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .products-header h1 {
    font-size: 36px;
  }

  .filters-card {
    grid-template-columns: 1fr 1fr;
  }

  .search-group {
    grid-column: 1 / -1;
  }

  .clear-button {
    width: 100%;
  }

  .products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* =========================
   MOBILE
========================= */

@media (max-width: 640px) {
  .products-header {
    padding: var(--space-12) 0 var(--space-8);
  }

  .products-header h1 {
    font-size: 30px;
  }

  .header-description {
    font-size: 14px;
  }

  .filters-card {
    grid-template-columns: 1fr;
    padding: var(--space-4);
  }

  .search-group {
    grid-column: auto;
  }

  .category-menu {
    max-height: 250px;
  }

  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4);
  }

  .products-topbar h2 {
    font-size: 22px;
  }

  .cart-toast {
    right: 16px;
    bottom: 16px;
    width: calc(100vw - 32px);
  }
}

@media (max-width: 420px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>