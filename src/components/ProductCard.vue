<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseButton from './common/Button.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },

  isFavorite: {
    type: Boolean,
    default: false
  },

  addingToCart: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'toggle-favorite',
  'add-to-cart'
])

const router = useRouter()
const authStore = useAuthStore()

/*
 * The real favorite state comes from Auth Store.
 * The prop is kept for compatibility with existing pages.
 */
const favoriteState = computed(() => {
  return (
    props.isFavorite ||
    authStore.isFavorite(props.product.id)
  )
})

const hasOldPrice = computed(() => {
  return (
    props.product.oldPrice &&
    props.product.oldPrice > props.product.price
  )
})

const discountLabel = computed(() => {
  if (props.product.discount) {
    return `-${props.product.discount}%`
  }

  if (hasOldPrice.value) {
    const percentage = Math.round(
      100 -
        (props.product.price / props.product.oldPrice) * 100
    )

    return `-${percentage}%`
  }

  return null
})

function formatPrice(value, currency = 'USD') {
  if (typeof value !== 'number') {
    return ''
  }

  return `${value.toFixed(2)} ${currency}`
}

function handleFavorite(event) {
  event.preventDefault()
  event.stopPropagation()

  /*
   * User must be logged in before using favorites.
   */
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }

  authStore.toggleFavorite(props.product.id)

  emit('toggle-favorite', props.product)
}

function handleAddToCart() {
  if (props.addingToCart) return

  emit('add-to-cart', props.product)
}

function handleImageError(event) {
  event.target.style.visibility = 'hidden'
}
</script>

<template>
  <article class="product-card">

    <!-- Product Image -->
    <div class="product-card__media">

      <router-link
        :to="`/product/${product.id}`"
        class="product-card__image-link"
      >
        <img
          :src="product.image"
          :alt="product.name"
          class="product-card__image"
          loading="lazy"
          @error="handleImageError"
        />
      </router-link>

      <!-- Discount -->
      <span
        v-if="discountLabel"
        class="product-card__badge"
      >
        {{ discountLabel }}
      </span>

      <!-- Favorite -->
      <button
        type="button"
        class="product-card__favorite"
        :class="{ 'is-active': favoriteState }"
        :aria-label="
          favoriteState
            ? 'Remove from favorites'
            : 'Add to favorites'
        "
        :aria-pressed="favoriteState"
        @click="handleFavorite"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          :fill="favoriteState ? 'currentColor' : 'none'"
          aria-hidden="true"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

    </div>

    <!-- Product Info -->
    <div class="product-card__body">

      <!-- Brand -->
      <p
        v-if="product.brand"
        class="product-card__brand"
      >
        {{ product.brand }}
      </p>

      <!-- Product Name -->
      <router-link
        :to="`/product/${product.id}`"
        class="product-card__name"
      >
        {{ product.name }}
      </router-link>

      <!-- Rating -->
      <div
        v-if="product.rating"
        class="product-card__rating"
        aria-label="Product rating"
      >
        <span class="product-card__star">
          ★
        </span>

        <span>
          {{ Number(product.rating).toFixed(1) }}
        </span>

        <span
          v-if="product.reviewsCount"
          class="product-card__reviews"
        >
          ({{ product.reviewsCount }})
        </span>
      </div>

      <!-- Prices -->
      <div class="product-card__prices">

        <span class="product-card__price">
          {{ formatPrice(product.price, product.currency) }}
        </span>

        <span
          v-if="hasOldPrice"
          class="product-card__old-price"
        >
          {{ formatPrice(product.oldPrice, product.currency) }}
        </span>

      </div>

      <!-- Add to Cart -->
      <BaseButton
        variant="primary"
        size="sm"
        block
        :loading="addingToCart"
        @click="handleAddToCart"
      >
        Add to Cart
      </BaseButton>

    </div>

  </article>
</template>

<style scoped>
.product-card {
  position: relative;
  overflow: hidden;
  background-color: var(--color-white);
  border-radius: var(--radius-default);
  box-shadow: 0 4px 16px rgba(27, 59, 54, 0.06);
  font-family: var(--font-family-base);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(27, 59, 54, 0.1);
  transform: translateY(-2px);
}

.product-card__media {
  position: relative;
  aspect-ratio: 3 / 4;
  background-color: var(--color-pink-light);
  overflow: hidden;
}

.product-card__image-link {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.product-card__image-link:hover .product-card__image {
  transform: scale(1.03);
}

.product-card__badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 5;
  padding: 4px 8px;
  background-color: var(--color-primary);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  pointer-events: none;
}

.product-card__favorite {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  z-index: 20;

  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: 1px solid rgba(27, 59, 54, 0.1);
  border-radius: 50%;

  background-color: var(--color-white);
  color: var(--color-sand);

  cursor: pointer;
  pointer-events: auto;

  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.2s ease;
}

.product-card__favorite svg {
  display: block;
  width: 20px;
  height: 20px;
  pointer-events: none;
  transition:
    fill 0.2s ease,
    transform 0.2s ease;
}

.product-card__favorite:hover {
  color: var(--color-primary);
  background-color: var(--color-beige);
  transform: scale(1.08);
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.12);
}

.product-card__favorite:active {
  transform: scale(0.92);
}

.product-card__favorite.is-active {
  color: #c0435a;
  background-color: #fff5f6;
}

.product-card__favorite.is-active svg {
  transform: scale(1.05);
}

.product-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}

.product-card__brand {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-sand);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.product-card__name {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-gray);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
}

.product-card__name:hover {
  color: var(--color-primary);
}

.product-card__rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-gray);
}

.product-card__star {
  font-size: 14px;
  color: #d89b3d;
}

.product-card__reviews {
  color: var(--color-sand);
}

.product-card__prices {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.product-card__price {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray);
}

.product-card__old-price {
  font-size: 13px;
  color: var(--color-sand);
  text-decoration: line-through;
}
</style>