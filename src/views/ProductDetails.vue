<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import OutfitSuggestion from '../components/OutfitSuggestion.vue'
import productsData from '../data/products.json'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const productId = Number(route.params.id)

const product = computed(() => {
  return productsData.products.find(
    (item) => item.id === productId
  )
})

const selectedSize = ref('')
const quantity = ref(1)
const addedMessage = ref(false)

function increaseQuantity() {
  quantity.value++
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function addToCart() {
  if (!product.value) return

  // If the product has sizes, require the user to select one
  if (product.value.sizes?.length && !selectedSize.value) {
    alert('Please select a size first.')
    return
  }

  // Add the selected quantity
  for (let i = 0; i < quantity.value; i++) {
    cartStore.addToCart({
      ...product.value,
      selectedSize: selectedSize.value
    })
  }

  addedMessage.value = true

  setTimeout(() => {
    addedMessage.value = false
  }, 2500)
}

function goBack() {
  router.push('/')
}

function goToCart() {
  router.push('/cart')
}
</script>

<template>
  <main class="product-details-page">
    <div class="container">

      <!-- BACK BUTTON -->
      <button
        class="back-button"
        type="button"
        @click="goBack"
      >
        ← Back to Products
      </button>

      <!-- PRODUCT NOT FOUND -->
      <div
        v-if="!product"
        class="not-found"
      >
        <h2>Product Not Found</h2>

        <p>
          The product you're looking for doesn't exist.
        </p>

        <button
          class="primary-button"
          type="button"
          @click="goBack"
        >
          Back to Products
        </button>
      </div>

      <!-- PRODUCT DETAILS -->
      <template v-else>

        <section class="product-details">

          <!-- PRODUCT IMAGE -->
          <div class="product-image-wrapper">
            <img
              :src="product.image"
              :alt="product.name"
              class="product-image"
            />
          </div>

          <!-- PRODUCT INFO -->
          <div class="product-info">

            <span class="product-category">
              {{ product.category }}
            </span>

            <h1>
              {{ product.name }}
            </h1>

            <!-- RATING -->
            <div class="rating">

              <span class="stars">
                ★
              </span>

              <strong>
                {{ product.rating }}
              </strong>

              <span class="reviews">
                ({{ product.reviewsCount }} reviews)
              </span>

            </div>

            <!-- PRICE -->
            <div class="price">
              {{ Number(product.price).toFixed(2) }}
              {{ product.currency }}
            </div>

            <div class="divider"></div>

            <!-- PRODUCT DETAILS -->
            <div class="details-list">

              <div class="detail-row">
                <span>Brand</span>

                <strong>
                  {{ product.brand || '—' }}
                </strong>
              </div>

              <div class="detail-row">
                <span>Color</span>

                <strong>
                  {{ product.color || '—' }}
                </strong>
              </div>

              <div class="detail-row">
                <span>Style</span>

                <strong>
                  {{ product.style || '—' }}
                </strong>
              </div>

              <div class="detail-row">
                <span>Gender</span>

                <strong>
                  {{ product.gender || '—' }}
                </strong>
              </div>

            </div>

            <!-- SIZE -->
            <div
              v-if="product.sizes?.length"
              class="size-section"
            >

              <div class="section-title">
                <span>
                  Select Size
                </span>

                <span
                  v-if="selectedSize"
                  class="selected-size"
                >
                  {{ selectedSize }}
                </span>
              </div>

              <div class="sizes">

                <button
                  v-for="size in product.sizes"
                  :key="size"
                  type="button"
                  class="size-button"
                  :class="{
                    active: selectedSize === size
                  }"
                  @click="selectedSize = size"
                >
                  {{ size }}
                </button>

              </div>

            </div>

            <!-- QUANTITY -->
            <div class="quantity-section">

              <span class="section-title">
                Quantity
              </span>

              <div class="quantity-control">

                <button
                  type="button"
                  @click="decreaseQuantity"
                >
                  −
                </button>

                <span>
                  {{ quantity }}
                </span>

                <button
                  type="button"
                  @click="increaseQuantity"
                >
                  +
                </button>

              </div>

            </div>

            <!-- ADD TO CART -->
            <button
              class="add-button"
              type="button"
              @click="addToCart"
            >
              Add to Cart
            </button>

            <!-- SUCCESS MESSAGE -->
            <div
              v-if="addedMessage"
              class="success-message"
            >
              ✓ Product added to cart successfully!
            </div>

            <!-- VIEW CART -->
            <button
              class="cart-link"
              type="button"
              @click="goToCart"
            >
              View Cart
            </button>

          </div>

        </section>

        <!-- ================================= -->
        <!-- OUTFIT RECOMMENDATION -->
        <!-- ================================= -->

        <OutfitSuggestion
          :product="product"
          @add-to-cart="cartStore.addToCart"
        />

      </template>

    </div>
  </main>
</template>

<style scoped>
.product-details-page {
  min-height: calc(100vh - 72px);
  background-color: var(--color-beige);
  padding: var(--space-8) 0 var(--space-16);
}

/* BACK BUTTON */

.back-button {
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 15px;
  font-weight: 500;
  padding: 0;
  margin-bottom: var(--space-8);
}

.back-button:hover {
  color: var(--color-primary-hover);
}

/* PRODUCT DETAILS */

.product-details {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr);

  gap: var(--space-12);
  align-items: start;
}

/* IMAGE */

.product-image-wrapper {
  width: 100%;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  overflow: hidden;

  min-height: 550px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 550px;
  object-fit: cover;
}

/* INFO */

.product-info {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: var(--space-8);
}

.product-category {
  display: inline-block;

  color: var(--color-sand);

  font-size: 13px;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.08em;

  margin-bottom: var(--space-3);
}

.product-info h1 {
  color: var(--color-primary);

  font-size: 30px;
  line-height: 1.3;

  margin-bottom: var(--space-4);
}

/* RATING */

.rating {
  display: flex;
  align-items: center;

  gap: var(--space-2);

  margin-bottom: var(--space-6);

  font-size: 14px;
}

.stars {
  color: var(--color-sand);
  font-size: 18px;
}

.reviews {
  color: #777;
}

/* PRICE */

.price {
  color: var(--color-primary);

  font-size: 26px;
  font-weight: 600;

  margin-bottom: var(--space-6);
}

/* DIVIDER */

.divider {
  height: 1px;

  background-color: var(--color-pink-light);

  margin-bottom: var(--space-6);
}

/* DETAILS LIST */

.details-list {
  display: flex;
  flex-direction: column;

  gap: var(--space-3);

  margin-bottom: var(--space-8);
}

.detail-row {
  display: flex;
  justify-content: space-between;

  gap: var(--space-4);

  font-size: 14px;
}

.detail-row span {
  color: #777;
}

.detail-row strong {
  color: var(--color-gray);

  text-transform: capitalize;
}

/* SIZE */

.size-section {
  margin-bottom: var(--space-6);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-size: 15px;
  font-weight: 600;

  margin-bottom: var(--space-3);
}

.selected-size {
  color: var(--color-primary);
  font-weight: 500;
}

.sizes {
  display: flex;
  flex-wrap: wrap;

  gap: var(--space-2);
}

.size-button {
  min-width: 48px;
  height: 42px;

  padding: 0 var(--space-3);

  border: 1px solid var(--color-sand);
  border-radius: var(--radius-default);

  background-color: var(--color-white);
  color: var(--color-gray);

  font-size: 14px;

  transition: all 0.2s ease;
}

.size-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.size-button.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);

  color: var(--color-white);
}

/* QUANTITY */

.quantity-section {
  margin-bottom: var(--space-6);
}

.quantity-control {
  width: fit-content;

  display: flex;
  align-items: center;

  border: 1px solid var(--color-sand);
  border-radius: var(--radius-default);

  overflow: hidden;
}

.quantity-control button {
  width: 42px;
  height: 40px;

  border: none;

  background-color: var(--color-white);
  color: var(--color-primary);

  font-size: 20px;
}

.quantity-control button:hover {
  background-color: var(--color-pink-light);
}

.quantity-control span {
  min-width: 42px;

  text-align: center;

  font-size: 15px;
  font-weight: 500;
}

/* ADD TO CART */

.add-button {
  width: 100%;
  height: 48px;

  border: none;
  border-radius: var(--radius-default);

  background-color: var(--color-primary);
  color: var(--color-white);

  font-size: 15px;
  font-weight: 600;

  transition: background-color 0.2s ease;
}

.add-button:hover {
  background-color: var(--color-primary-hover);
}

/* SUCCESS */

.success-message {
  margin-top: var(--space-3);

  padding: var(--space-3);

  border-radius: var(--radius-default);

  background-color: var(--color-pink-light);
  color: var(--color-primary);

  text-align: center;

  font-size: 14px;
  font-weight: 500;
}

/* CART LINK */

.cart-link {
  width: 100%;

  margin-top: var(--space-3);

  padding: var(--space-3);

  border: none;

  background: transparent;
  color: var(--color-primary);

  font-size: 14px;
  font-weight: 500;
}

.cart-link:hover {
  color: var(--color-primary-hover);
}

/* NOT FOUND */

.not-found {
  background-color: var(--color-white);

  border-radius: var(--radius-card);

  padding: var(--space-12);

  text-align: center;
}

.not-found h2 {
  color: var(--color-primary);

  margin-bottom: var(--space-3);
}

.not-found p {
  color: #777;

  margin-bottom: var(--space-6);
}

.primary-button {
  border: none;

  border-radius: var(--radius-default);

  background-color: var(--color-primary);
  color: var(--color-white);

  padding:
    var(--space-3)
    var(--space-6);

  font-weight: 500;
}

.primary-button:hover {
  background-color: var(--color-primary-hover);
}

/* RESPONSIVE */

@media (max-width: 800px) {

  .product-details {
    grid-template-columns: 1fr;

    gap: var(--space-6);
  }

  .product-image-wrapper {
    min-height: 400px;
  }

  .product-image {
    height: 400px;
  }

  .product-info {
    padding: var(--space-6);
  }
}

@media (max-width: 500px) {

  .product-details-page {
    padding-top: var(--space-6);
  }

  .product-info h1 {
    font-size: 24px;
  }

  .product-image-wrapper,
  .product-image {
    height: 350px;
    min-height: 350px;
  }
}
</style>