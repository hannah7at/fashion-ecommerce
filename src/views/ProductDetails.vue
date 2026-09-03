<script setup>
import {
  computed,
  ref,
  onBeforeUnmount
} from 'vue'

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

/* =========================
   SIZE ERROR
========================= */

const sizeError = ref(false)

/* =========================
   CART TOAST
========================= */

const showCartToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
let toastTimer = null

function showToast(title, message) {
  toastTitle.value = title
  toastMessage.value = message
  showCartToast.value = true

  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  toastTimer = setTimeout(() => {
    showCartToast.value = false
  }, 3000)
}

function closeToast() {
  showCartToast.value = false

  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
}

/* =========================
   QUANTITY
========================= */

function increaseQuantity() {
  quantity.value++
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

/* =========================
   SIZE
========================= */

function selectSize(size) {
  selectedSize.value = size
  sizeError.value = false
}

/* =========================
   ADD TO CART
========================= */

function addToCart() {
  if (!product.value) {
    return
  }

  /*
   * Require size only when
   * the product actually has sizes.
   */
  if (
    product.value.sizes?.length &&
    !selectedSize.value
  ) {
    sizeError.value = true

    showToast(
      'Size required',
      'Please select a size before adding this product.'
    )

    return
  }

  /*
   * Add selected quantity.
   */
  for (
    let i = 0;
    i < quantity.value;
    i++
  ) {
    cartStore.addToCart({
      ...product.value,
      selectedSize: selectedSize.value
    })
  }

  showToast(
    'Added to cart',
    `${product.value.name} has been added to your cart.`
  )
}

/* =========================
   OUTFIT ADD TO CART
========================= */

function handleOutfitAddToCart(productToAdd) {
  if (!productToAdd) {
    return
  }

  cartStore.addToCart(productToAdd)

  showToast(
    'Added to cart',
    `${productToAdd.name} has been added to your cart.`
  )
}

/* =========================
   COMPLETE LOOK
========================= */

function handleCompleteLookAdded(lookData) {
  if (!lookData) {
    return
  }

  /*
   * Add the base product.
   */
  if (lookData.baseProduct) {
    cartStore.addToCart(
      lookData.baseProduct
    )
  }

  /*
   * Add all recommended pieces.
   */
  if (Array.isArray(lookData.products)) {
    lookData.products.forEach(
      (recommendedProduct) => {
        cartStore.addToCart(
          recommendedProduct
        )
      }
    )
  }

  const totalPieces =
    1 +
    (Array.isArray(lookData.products)
      ? lookData.products.length
      : 0)

  showToast(
    'Complete look added',
    `${totalPieces} pieces have been added to your cart.`
  )
}

/* =========================
   NAVIGATION
========================= */

function goBack() {
  router.push('/')
}

function goToCart() {
  router.push('/cart')
}

/* =========================
   CLEANUP
========================= */

onBeforeUnmount(() => {
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
})
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
        <h2>
          Product Not Found
        </h2>

        <p>
          The product you're looking for
          doesn't exist.
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
                ({{ product.reviewsCount }}
                reviews)
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
                <span>
                  Brand
                </span>

                <strong>
                  {{ product.brand || '—' }}
                </strong>
              </div>

              <div class="detail-row">
                <span>
                  Color
                </span>

                <strong>
                  {{ product.color || '—' }}
                </strong>
              </div>

              <div class="detail-row">
                <span>
                  Style
                </span>

                <strong>
                  {{ product.style || '—' }}
                </strong>
              </div>

              <div class="detail-row">
                <span>
                  Gender
                </span>

                <strong>
                  {{ product.gender || '—' }}
                </strong>
              </div>

            </div>

            <!-- SIZE -->
            <div
              v-if="product.sizes?.length"
              class="size-section"
              :class="{
                'has-error': sizeError
              }"
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
                    active:
                      selectedSize === size
                  }"
                  @click="selectSize(size)"
                >
                  {{ size }}
                </button>

              </div>

              <!-- SIZE ERROR -->
              <Transition name="size-error">
                <div
                  v-if="sizeError"
                  class="size-error-message"
                >
                  <span class="error-icon">
                    !
                  </span>

                  <span>
                    Please select a size first.
                  </span>
                </div>
              </Transition>

            </div>

            <!-- QUANTITY -->
            <div class="quantity-section">

              <span class="section-title">
                Quantity
              </span>

              <div class="quantity-control">

                <button
                  type="button"
                  aria-label="Decrease quantity"
                  @click="decreaseQuantity"
                >
                  −
                </button>

                <span>
                  {{ quantity }}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
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
          @add-to-cart="handleOutfitAddToCart"
          @complete-look-added="
            handleCompleteLookAdded
          "
        />

      </template>

    </div>

    <!-- ================================= -->
    <!-- CART TOAST -->
    <!-- ================================= -->

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
            {{ toastTitle }}
          </strong>

          <span>
            {{ toastMessage }}
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

  </main>
</template>

<style scoped>
.product-details-page {
  position: relative;
  min-height: calc(100vh - 72px);
  background-color: var(--color-beige);
  padding: var(--space-8) 0 var(--space-16);
}

/* =========================
   BACK BUTTON
========================= */

.back-button {
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 15px;
  font-weight: 500;
  padding: 0;
  margin-bottom: var(--space-8);
  cursor: pointer;
}

.back-button:hover {
  color: var(--color-primary-hover);
}

/* =========================
   PRODUCT DETAILS
========================= */

.product-details {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr);

  gap: var(--space-12);
  align-items: start;
}

/* =========================
   IMAGE
========================= */

.product-image-wrapper {
  width: 100%;
  min-height: 550px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background-color: var(--color-white);

  border-radius: var(--radius-card);
}

.product-image {
  width: 100%;
  height: 550px;

  object-fit: cover;
}

/* =========================
   INFO
========================= */

.product-info {
  padding: var(--space-8);

  background-color: var(--color-white);

  border-radius: var(--radius-card);
}

.product-category {
  display: inline-block;

  margin-bottom: var(--space-3);

  color: var(--color-sand);

  font-size: 13px;
  font-weight: 600;

  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-info h1 {
  margin-bottom: var(--space-4);

  color: var(--color-primary);

  font-size: 30px;
  line-height: 1.3;
}

/* =========================
   RATING
========================= */

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

/* =========================
   PRICE
========================= */

.price {
  margin-bottom: var(--space-6);

  color: var(--color-primary);

  font-size: 26px;
  font-weight: 600;
}

/* =========================
   DIVIDER
========================= */

.divider {
  height: 1px;

  margin-bottom: var(--space-6);

  background-color: var(--color-pink-light);
}

/* =========================
   DETAILS LIST
========================= */

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

/* =========================
   SIZE
========================= */

.size-section {
  margin-bottom: var(--space-6);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: var(--space-3);

  font-size: 15px;
  font-weight: 600;
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

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.size-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.size-button.active {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: var(--color-white);
}

/* =========================
   SIZE ERROR
========================= */

.size-error-message {
  display: flex;
  align-items: center;

  gap: 9px;

  margin-top: 10px;
  padding: 10px 12px;

  border: 1px solid rgba(183, 156, 140, 0.45);
  border-radius: var(--radius-default);

  background-color: var(--color-beige);
  color: var(--color-primary);

  font-size: 12px;
  font-weight: 500;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;

  flex-shrink: 0;

  border-radius: 50%;

  background-color: var(--color-sand);
  color: var(--color-white);

  font-size: 12px;
  font-weight: 700;
}

/* =========================
   SIZE ERROR ANIMATION
========================= */

.size-error-enter-active,
.size-error-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.size-error-enter-from,
.size-error-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* =========================
   QUANTITY
========================= */

.quantity-section {
  margin-bottom: var(--space-6);
}

.quantity-control {
  width: fit-content;

  display: flex;
  align-items: center;

  overflow: hidden;

  border: 1px solid var(--color-sand);
  border-radius: var(--radius-default);
}

.quantity-control button {
  width: 42px;
  height: 40px;

  border: none;

  background-color: var(--color-white);
  color: var(--color-primary);

  font-size: 20px;

  cursor: pointer;

  transition:
    background-color 0.2s ease;
}

.quantity-control button:hover {
  background-color: var(--color-pink-light);
}

.quantity-control span {
  min-width: 42px;

  text-align: center;

  color: var(--color-gray);

  font-size: 15px;
  font-weight: 500;
}

/* =========================
   ADD TO CART
========================= */

.add-button {
  width: 100%;
  height: 48px;

  border: none;
  border-radius: var(--radius-default);

  background-color: var(--color-primary);
  color: var(--color-white);

  font-family: var(--font-family-base);
  font-size: 15px;
  font-weight: 600;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.add-button:hover {
  background-color: var(--color-primary-hover);

  transform: translateY(-1px);

  box-shadow:
    0 8px 20px rgba(
      27,
      59,
      54,
      0.14
    );
}

/* =========================
   CART LINK
========================= */

.cart-link {
  width: 100%;

  margin-top: var(--space-3);
  padding: var(--space-3);

  border: none;

  background: transparent;
  color: var(--color-primary);

  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 500;

  cursor: pointer;

  transition:
    color 0.2s ease;
}

.cart-link:hover {
  color: var(--color-primary-hover);
}

/* =========================
   NOT FOUND
========================= */

.not-found {
  padding: var(--space-12);

  text-align: center;

  background-color: var(--color-white);

  border-radius: var(--radius-card);
}

.not-found h2 {
  margin-bottom: var(--space-3);

  color: var(--color-primary);
}

.not-found p {
  margin-bottom: var(--space-6);

  color: #777;
}

.primary-button {
  padding:
    var(--space-3)
    var(--space-6);

  border: none;
  border-radius: var(--radius-default);

  background-color: var(--color-primary);
  color: var(--color-white);

  font-family: var(--font-family-base);
  font-weight: 500;

  cursor: pointer;
}

.primary-button:hover {
  background-color: var(--color-primary-hover);
}

/* =========================
   CART TOAST
========================= */

.cart-toast {
  position: fixed;

  right: 28px;
  bottom: 28px;

  z-index: 99999;

  width: min(
    390px,
    calc(100vw - 32px)
  );

  display: flex;
  align-items: center;

  gap: 14px;

  padding: 15px 16px;

  border: 1px solid var(--color-pink-light);
  border-radius: 14px;

  background-color: var(--color-white);

  box-shadow:
    0 18px 45px rgba(
      27,
      59,
      54,
      0.16
    ),
    0 5px 15px rgba(
      27,
      59,
      54,
      0.08
    );
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
   TOAST ANIMATION
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
   RESPONSIVE
========================= */

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

  .cart-toast {
    right: 16px;
    bottom: 16px;

    width: calc(100vw - 32px);
  }
}
</style>