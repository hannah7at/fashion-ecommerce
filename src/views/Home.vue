<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import productsData from '../data/products.json'
import { useCartStore } from '../stores/cart'


const router = useRouter()
const cartStore = useCartStore()

const products = productsData.products

const featuredProducts = computed(() => {
  return products.slice(0, 4)
})

/* =========================
   TOAST
========================= */

const showToast = ref(false)
const toastProduct = ref(null)
let toastTimer = null

const handleAddToCart = (product) => {
  cartStore.addToCart(product)

  toastProduct.value = product
  showToast.value = true

  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  toastTimer = setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const closeToast = () => {
  showToast.value = false

  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
}

onBeforeUnmount(() => {
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
})

/* =========================
   CATEGORIES
========================= */

const categoryOptions = [
  {
    name: 'Women',
    type: 'gender',
    value: 'women',
    featured: true
  },
  {
    name: 'Men',
    type: 'gender',
    value: 'men',
    featured: true
  },
  {
    name: 'Dresses',
    type: 'category',
    value: 'dress'
  },
  {
    name: 'Shirts',
    type: 'category',
    value: 'shirt'
  },
  {
    name: 'Shoes',
    type: 'category',
    value: 'shoes'
  },
  {
    name: 'Bags',
    type: 'category',
    value: 'bags'
  },
  {
    name: 'Accessories',
    type: 'category',
    value: 'accessories'
  },
  {
    name: 'Jackets',
    type: 'category',
    value: 'jacket'
  }
]

const getCategoryProducts = (category) => {
  const value = category.value.toLowerCase()

  if (category.type === 'gender') {
    return products.filter(product =>
      String(product.gender || '').toLowerCase() === value
    )
  }

  if (value === 'dress') {
    return products.filter(product => {
      const productCategory = String(
        product.category || ''
      ).toLowerCase()

      return (
        productCategory === 'dress' ||
        productCategory === 'dresses'
      )
    })
  }

  if (value === 'shirt') {
    return products.filter(product => {
      const productCategory = String(
        product.category || ''
      ).toLowerCase()

      return (
        productCategory === 'shirt' ||
        productCategory === 'shirts' ||
        productCategory === 't-shirt' ||
        productCategory === 't-shirts' ||
        productCategory === 'tshirt'
      )
    })
  }

  if (value === 'shoes') {
    return products.filter(product => {
      const productCategory = String(
        product.category || ''
      ).toLowerCase()

      return (
        productCategory === 'shoes' ||
        productCategory === 'shoe' ||
        productCategory === 'slippers' ||
        productCategory === "women's-shoes" ||
        productCategory === "men's-shoes"
      )
    })
  }

  if (value === 'bags') {
    return products.filter(product => {
      const productCategory = String(
        product.category || ''
      ).toLowerCase()

      return (
        productCategory === 'bag' ||
        productCategory === 'bags' ||
        productCategory === 'handbag' ||
        productCategory === 'handbags' ||
        productCategory === "women's-bags"
      )
    })
  }

  if (value === 'accessories') {
    return products.filter(product => {
      const productCategory = String(
        product.category || ''
      ).toLowerCase()

      return (
        productCategory === 'accessories' ||
        productCategory === 'accessory' ||
        productCategory === 'watch' ||
        productCategory === "women's-watches" ||
        productCategory === 'jewelry' ||
        productCategory === 'jewellery' ||
        productCategory === "women's-jewellery"
      )
    })
  }

  if (value === 'jacket') {
    return products.filter(product => {
      const productCategory = String(
        product.category || ''
      ).toLowerCase()

      return (
        productCategory === 'jacket' ||
        productCategory === 'jackets' ||
        productCategory === 'coat' ||
        productCategory === 'coats'
      )
    })
  }

  return products.filter(product => {
    return String(
      product.category || ''
    ).toLowerCase() === value
  })
}

const categoryData = computed(() => {
  return categoryOptions.map(category => {
    const categoryProducts = getCategoryProducts(category)

    return {
      ...category,
      image: categoryProducts[0]?.image || ''
    }
  })
})

const featuredCategories = computed(() => {
  return categoryData.value.filter(
    category => category.featured
  )
})

const regularCategories = computed(() => {
  return categoryData.value.filter(
    category => !category.featured
  )
})

/* =========================
   NAVIGATION
========================= */

const goToProducts = () => {
  router.push('/products')
}

const goToCategory = (category) => {
  if (category.type === 'gender') {
    router.push({
      path: '/products',
      query: {
        gender: category.value
      }
    })

    return
  }

  router.push({
    path: '/products',
    query: {
      category: category.value
    }
  })
}
</script>

<template>
  <div class="home-page">

    <!-- HERO -->
    <section class="hero">
      <div class="container hero-container">

        <div class="hero-content">

          <p class="hero-label">
            NEW COLLECTION 2026
          </p>

          <h1>
            Define Your
            <span>Style.</span>
          </h1>

          <p class="hero-description">
            Discover timeless fashion pieces designed to
            make every look feel uniquely yours.
          </p>

          <div class="hero-actions">

            <button
              type="button"
              class="primary-button"
              @click="goToProducts"
            >
              Shop Now
            </button>

            <button
              type="button"
              class="secondary-button"
              @click="goToProducts"
            >
              Explore Collection
            </button>

          </div>

        </div>

        <div class="hero-image-wrapper">

          <div class="hero-image-bg"></div>

          <img
            v-if="products[1]?.image"
            :src="products[1].image"
            alt="Fashion collection"
            class="hero-image"
          />

          <div class="hero-badge">
            <span>NEW</span>
            <strong>Collection</strong>
          </div>

        </div>

      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="categories-section">

      <div class="container">

        <div class="section-heading">

          <div>

            <p class="section-label">
              EXPLORE
            </p>

            <h2>
              Shop by Category
            </h2>

            <p class="category-intro">
              Explore our collections and find pieces
              that match your style.
            </p>

          </div>

          <button
            type="button"
            class="text-button"
            @click="goToProducts"
          >
            View All
            <span>→</span>
          </button>

        </div>

        <!-- Featured Categories -->
        <div class="featured-categories">

          <button
            v-for="category in featuredCategories"
            :key="`${category.type}-${category.value}`"
            type="button"
            class="category-card category-card-large"
            @click="goToCategory(category)"
          >

            <img
              v-if="category.image"
              :src="category.image"
              :alt="category.name"
            />

            <div
              v-else
              class="category-placeholder"
            ></div>

            <div class="category-overlay"></div>

            <div class="category-content">

              <span>
                SHOP COLLECTION
              </span>

              <h3>
                {{ category.name }}
              </h3>

              <div class="category-link">
                Explore
                <span>→</span>
              </div>

            </div>

          </button>

        </div>

        <!-- Regular Categories -->
        <div class="regular-categories">

          <button
            v-for="category in regularCategories"
            :key="`${category.type}-${category.value}`"
            type="button"
            class="category-card category-card-small"
            @click="goToCategory(category)"
          >

            <img
              v-if="category.image"
              :src="category.image"
              :alt="category.name"
            />

            <div
              v-else
              class="category-placeholder"
            ></div>

            <div class="category-overlay"></div>

            <div class="category-content">

              <span>
                COLLECTION
              </span>

              <h3>
                {{ category.name }}
              </h3>

              <div class="category-arrow">
                →
              </div>

            </div>

          </button>

        </div>

      </div>

    </section>

    <!-- FEATURED PRODUCTS -->
    <section
      id="featured"
      class="featured-section"
    >

      <div class="container">

        <div class="section-heading featured-heading">

          <div>

            <p class="section-label">
              OUR PICKS
            </p>

            <h2>
              Featured Collection
            </h2>

            <p class="section-description">
              Handpicked pieces to elevate your everyday style.
            </p>

          </div>

          <button
            type="button"
            class="text-button"
            @click="goToProducts"
          >
            View All Products
            <span>→</span>
          </button>

        </div>

        <div class="products-grid">

          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="product-wrapper"
          >

            <ProductCard
              :product="product"
              @add-to-cart="handleAddToCart"
            />

          </div>

        </div>

      </div>

    </section>

    <!-- BENEFITS -->
    <section class="benefits-section">

      <div class="container">

        <div class="benefits-grid">

          <div class="benefit">

            <div class="benefit-icon">
              ✦
            </div>

            <div>

              <h3>
                Quality First
              </h3>

              <p>
                Carefully selected pieces made for everyday style.
              </p>

            </div>

          </div>

          <div class="benefit">

            <div class="benefit-icon">
              ♡
            </div>

            <div>

              <h3>
                Easy Shopping
              </h3>

              <p>
                Find your favorite pieces with a simple experience.
              </p>

            </div>

          </div>

          <div class="benefit">

            <div class="benefit-icon">
              ✓
            </div>

            <div>

              <h3>
                Fast & Simple
              </h3>

              <p>
                From browsing to checkout, everything stays easy.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>

    <!-- CTA -->
    <section class="cta-section">

      <div class="container">

        <div class="cta-content">

          <p class="section-label">
            YOUR STYLE, YOUR WAY
          </p>

          <h2>
            Find Something
            <span>You'll Love.</span>
          </h2>

          <p>
            Explore our collection and discover pieces
            that match your personality.
          </p>

          <button
            type="button"
            class="cta-button"
            @click="goToProducts"
          >
            Start Shopping
            <span>→</span>
          </button>

        </div>

      </div>

    </section>

    <!-- TOAST -->
    <Transition name="toast">

      <div
        v-if="showToast"
        class="cart-toast"
        role="status"
        aria-live="polite"
      >

        <div class="toast-icon">
          ✓
        </div>

        <div class="toast-content">

          <strong>
            Added to cart
          </strong>

          <span v-if="toastProduct">
            {{ toastProduct.name }}
          </span>

        </div>

        <button
          type="button"
          class="toast-close"
          aria-label="Close notification"
          @click="closeToast"
        >
          ×
        </button>

      </div>

    </Transition>

  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  font-family: var(--font-family-base);
  background-color: var(--color-white);
}

/* =========================
   HERO
========================= */

.hero {
  position: relative;
  min-height: 620px;
  background-color: var(--color-beige);
  overflow: hidden;
}

.hero-container {
  min-height: 620px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: var(--space-12);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: var(--space-8) 0;
}

.hero-label,
.section-label {
  margin-bottom: var(--space-4);
  color: var(--color-sand);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
}

.hero h1 {
  max-width: 600px;
  color: var(--color-primary);
  font-size: clamp(52px, 6vw, 78px);
  line-height: 1.05;
  font-weight: 600;
  letter-spacing: -2px;
}

.hero h1 span {
  display: block;
  color: var(--color-sand);
  font-style: italic;
}

.hero-description {
  max-width: 470px;
  margin-top: var(--space-6);
  color: #666;
  font-size: 16px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

.primary-button,
.secondary-button,
.cta-button {
  min-height: 48px;
  padding: 0 var(--space-8);
  border-radius: var(--radius-default);
  font-size: 14px;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.primary-button {
  border: 1px solid var(--color-primary);
  background-color: var(--color-primary);
  color: var(--color-white);
  cursor: pointer;
}

.primary-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
}

.secondary-button {
  border: 1px solid var(--color-primary);
  background-color: transparent;
  color: var(--color-primary);
  cursor: pointer;
}

.secondary-button:hover {
  background-color: var(--color-pink-light);
  transform: translateY(-2px);
}

.hero-image-wrapper {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image-bg {
  position: absolute;
  width: 390px;
  height: 470px;
  border-radius: 200px 200px 20px 20px;
  background-color: var(--color-pink-light);
  transform: rotate(5deg);
}

.hero-image {
  position: relative;
  z-index: 1;
  width: 350px;
  height: 450px;
  object-fit: cover;
  border-radius: 200px 200px 20px 20px;
}

.hero-badge {
  position: absolute;
  right: 20px;
  bottom: 40px;
  z-index: 3;
  width: 105px;
  height: 105px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
  transform: rotate(-8deg);
  box-shadow: 0 12px 30px rgba(27, 59, 54, 0.18);
}

.hero-badge span {
  font-size: 11px;
  letter-spacing: 2px;
}

.hero-badge strong {
  margin-top: 3px;
  font-size: 15px;
}

/* =========================
   GENERAL SECTIONS
========================= */

.categories-section,
.featured-section {
  padding: var(--space-16) 0;
}

.categories-section {
  background-color: var(--color-white);
}

.featured-section {
  background-color: var(--color-beige);
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.section-heading h2 {
  color: var(--color-primary);
}

.section-description {
  margin-top: var(--space-3);
  color: #777;
  font-size: 14px;
}

.category-intro {
  max-width: 470px;
  margin-top: var(--space-3);
  color: #777;
  font-size: 14px;
  line-height: 1.7;
}

.text-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: gap 0.2s ease;
}

.text-button:hover {
  gap: var(--space-3);
}

.text-button span {
  font-size: 18px;
}

/* =========================
   CATEGORIES
========================= */

.featured-categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
  margin-bottom: var(--space-5);
}

.regular-categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.category-card {
  position: relative;
  display: block;
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: var(--radius-card);
  background-color: var(--color-pink-light);
  cursor: pointer;
  text-align: left;
}

.category-card-large {
  height: 390px;
}

.category-card-small {
  height: 260px;
}

.category-card img,
.category-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-placeholder {
  background-color: var(--color-pink-light);
}

.category-card img {
  display: block;
  transition:
    transform 0.6s ease,
    filter 0.4s ease;
}

.category-card:hover img {
  transform: scale(1.07);
  filter: brightness(0.9);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to top,
      rgba(0, 0, 0, 0.72),
      rgba(0, 0, 0, 0.08) 70%
    );
  transition: background 0.3s ease;
}

.category-card:hover .category-overlay {
  background:
    linear-gradient(
      to top,
      rgba(27, 59, 54, 0.78),
      rgba(0, 0, 0, 0.08) 75%
    );
}

.category-content {
  position: absolute;
  left: 26px;
  right: 26px;
  bottom: 24px;
  z-index: 2;
  color: var(--color-white);
}

.category-card-small .category-content {
  left: 18px;
  right: 18px;
  bottom: 18px;
}

.category-content > span {
  display: block;
  margin-bottom: var(--space-2);
  color: rgba(255, 255, 255, 0.78);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.8px;
}

.category-content h3 {
  color: var(--color-white);
  font-size: 30px;
  font-weight: 500;
  line-height: 1.1;
  text-transform: capitalize;
}

.category-card-small .category-content h3 {
  font-size: 20px;
}

.category-link {
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-top: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.7);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.category-card-large:hover .category-link {
  opacity: 1;
  transform: translateY(0);
}

.category-link span {
  font-size: 16px;
}

.category-arrow {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  color: var(--color-white);
  font-size: 17px;
  opacity: 0;
  transform: translateX(-8px);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    background-color 0.3s ease;
}

.category-card-small:hover .category-arrow {
  opacity: 1;
  transform: translateX(0);
  background-color: var(--color-primary);
}

/* =========================
   PRODUCTS
========================= */

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}

/* =========================
   BENEFITS
========================= */

.benefits-section {
  padding: var(--space-12) 0;
  background-color: var(--color-white);
  border-top: 1px solid var(--color-pink-light);
  border-bottom: 1px solid var(--color-pink-light);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

.benefit {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.benefit-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-pink-light);
  color: var(--color-primary);
  font-size: 20px;
}

.benefit h3 {
  margin-bottom: var(--space-2);
  color: var(--color-primary);
  font-size: 17px;
}

.benefit p {
  color: #777;
  font-size: 13px;
  line-height: 1.6;
}

/* =========================
   CTA
========================= */

.cta-section {
  padding: 90px 0;
  background-color: var(--color-primary);
  text-align: center;
}

.cta-content {
  max-width: 650px;
  margin: 0 auto;
}

.cta-content .section-label {
  color: var(--color-pink-light);
}

.cta-content h2 {
  color: var(--color-white);
  font-size: clamp(34px, 5vw, 52px);
  line-height: 1.2;
}

.cta-content h2 span {
  color: var(--color-pink-light);
  font-style: italic;
}

.cta-content > p:not(.section-label) {
  max-width: 500px;
  margin: var(--space-4) auto 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 15px;
  line-height: 1.7;
}

.cta-button {
  margin-top: var(--space-8);
  border: none;
  background-color: var(--color-white);
  color: var(--color-primary);
  cursor: pointer;
}

.cta-button:hover {
  background-color: var(--color-pink-light);
  transform: translateY(-2px);
}

.cta-button span {
  margin-left: var(--space-2);
  font-size: 17px;
}

/* =========================
   CART TOAST
========================= */

.cart-toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;

  width: min(380px, calc(100vw - 32px));

  display: flex;
  align-items: center;
  gap: 13px;

  padding: 14px 15px;

  background-color: var(--color-white);
  border: 1px solid rgba(27, 59, 54, 0.12);
  border-radius: 14px;

  box-shadow:
    0 14px 40px rgba(27, 59, 54, 0.16),
    0 4px 12px rgba(0, 0, 0, 0.06);
}

.toast-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background-color: var(--color-primary);
  color: var(--color-white);

  font-size: 18px;
  font-weight: 700;
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

  color: var(--color-sand);
  font-size: 12px;
  line-height: 1.4;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.toast-close {
  width: 28px;
  height: 28px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;
  border-radius: 50%;

  background-color: transparent;
  color: var(--color-sand);

  font-size: 21px;
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

/* Toast Animation */

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

/* =========================
   TABLET
========================= */

@media (max-width: 1024px) {

  .hero {
    min-height: 560px;
  }

  .hero-container {
    min-height: 560px;
    gap: var(--space-8);
  }

  .hero-image-wrapper {
    height: 430px;
  }

  .hero-image-bg {
    width: 320px;
    height: 400px;
  }

  .hero-image {
    width: 290px;
    height: 380px;
  }

  .regular-categories {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-card-small {
    height: 280px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* =========================
   MOBILE
========================= */

@media (max-width: 768px) {

  .hero {
    min-height: auto;
  }

  .hero-container {
    min-height: auto;
    grid-template-columns: 1fr;
    padding-top: var(--space-12);
    padding-bottom: var(--space-12);
  }

  .hero-content {
    text-align: center;
  }

  .hero h1 {
    font-size: 52px;
  }

  .hero-description {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-image-wrapper {
    height: 420px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .featured-heading {
    flex-direction: column;
  }

  .featured-categories {
    grid-template-columns: 1fr;
  }

  .category-card-large {
    height: 350px;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

/* =========================
   SMALL MOBILE
========================= */

@media (max-width: 560px) {

  .hero h1 {
    font-size: 44px;
  }

  .hero-description {
    font-size: 14px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }

  .hero-image-wrapper {
    height: 360px;
  }

  .hero-image-bg {
    width: 260px;
    height: 330px;
  }

  .hero-image {
    width: 235px;
    height: 315px;
  }

  .hero-badge {
    right: 10px;
    bottom: 20px;
    width: 85px;
    height: 85px;
  }

  .hero-badge strong {
    font-size: 13px;
  }

  .featured-categories {
    gap: var(--space-3);
  }

  .category-card-large {
    height: 280px;
  }

  .category-content {
    left: 18px;
    right: 18px;
    bottom: 18px;
  }

  .category-content h3 {
    font-size: 24px;
  }

  .category-card-small {
    height: 210px;
  }

  .category-card-small .category-content h3 {
    font-size: 17px;
  }

  .category-arrow {
    width: 30px;
    height: 30px;
    font-size: 15px;
  }

  .regular-categories {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .categories-section,
  .featured-section {
    padding: var(--space-12) 0;
  }

  .cta-section {
    padding: 70px 0;
  }

  .cart-toast {
    right: 16px;
    bottom: 16px;
    width: calc(100vw - 32px);
  }
}
</style>