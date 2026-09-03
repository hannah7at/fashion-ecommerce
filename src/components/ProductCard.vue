<script setup>
import { computed } from 'vue'
import BaseButton from './common/Button.vue'

/**
 * ProductCard - shared Product Card component
 * Supports favorites, discounts, ratings and add-to-cart.
 */

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

function handleFavorite() {
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
      <img
        :src="product.image"
        :alt="product.name"
        class="product-card__image"
        loading="lazy"
        @error="handleImageError"
      />

      <!-- Discount -->
      <span
        v-if="discountLabel"
        class="product-card__badge"
      >
        {{ discountLabel }}
      </span>

      <!-- Favorite -->
      <button
        class="product-card__favorite"
        :class="{ 'is-active': isFavorite }"
        type="button"
        :aria-label="
          isFavorite
            ? 'Remove from favorites'
            : 'Add to favorites'
        "
        :aria-pressed="isFavorite"
        @click="handleFavorite"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          :fill="isFavorite ? 'currentColor' : 'none'"
          aria-hidden="true"
        >
          <path
            d="M12 21s-6.7-4.35-9.3-8.28C1 10.1 1.6 6.6 4.7 5.1c2.3-1.1 4.6-.2 5.9 1.5.5.6.9 1.2 1.4 1.9.5-.7.9-1.3-1.4-1.9 1.3-1.7 3.6-2.6 5.9-1.5 3.1 1.5 3.7 5 2 7.62C18.7 16.65 12 21 12 21z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- Product Info -->
    <div class="product-card__body">
      <p
        v-if="product.brand"
        class="product-card__brand"
      >
        {{ product.brand }}
      </p>

      <h4 class="product-card__name">
        {{ product.name }}
      </h4>

      <!-- Rating -->
      <div
        v-if="product.rating"
        class="product-card__rating"
        aria-label="Product rating"
      >
        <span class="product-card__star">★</span>

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
  border-radius: var(--radius-md);
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

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-card__badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: 4px 8px;
  background-color: var(--color-primary);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-pill);
}

.product-card__favorite {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background-color: var(--color-white);
  color: var(--color-sand);
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.15s ease;
}

.product-card__favorite:hover {
  transform: scale(1.08);
}

.product-card__favorite.is-active {
  color: #c0435a;
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

