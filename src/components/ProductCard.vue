<script setup>
import { computed } from 'vue'
import BaseButton from './Button.vue'

/**
 * ProductCard - shared Product Card component (Design System)
 * Fully reusable via props - takes a "product" object rather than
 * hardcoded data, so it works with any product source.
 *
 * Expected product shape:
 * { id, name, price, image, oldPrice?, discount? }
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

const emit = defineEmits(['toggle-favorite', 'add-to-cart'])

const hasOldPrice = computed(() => props.product.oldPrice && props.product.oldPrice > props.product.price)

const discountLabel = computed(() => {
  if (props.product.discount) return `-${props.product.discount}%`
  if (hasOldPrice.value) {
    const pct = Math.round(100 - (props.product.price / props.product.oldPrice) * 100)
    return `-${pct}%`
  }
  return null
})

function formatPrice(value) {
  return `${value} EGP`
}
</script>

<template>
  <article class="product-card">
    <div class="product-card__media">
      <img :src="product.image" :alt="product.name" class="product-card__image" loading="lazy" />

      <span v-if="discountLabel" class="product-card__badge">{{ discountLabel }}</span>

      <button
        class="product-card__favorite"
        :class="{ 'is-active': isFavorite }"
        type="button"
        :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
        @click="emit('toggle-favorite', product)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'">
          <path
            d="M12 21s-6.7-4.35-9.3-8.28C1 10.1 1.6 6.6 4.7 5.1c2.3-1.1 4.6-.2 5.9 1.5.5.6.9 1.2 1.4 1.9.5-.7.9-1.3 1.4-1.9 1.3-1.7 3.6-2.6 5.9-1.5 3.1 1.5 3.7 5 2 7.62C18.7 16.65 12 21 12 21z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="product-card__body">
      <h4 class="product-card__name">{{ product.name }}</h4>

      <div class="product-card__prices">
        <span class="product-card__price">{{ formatPrice(product.price) }}</span>
        <span v-if="hasOldPrice" class="product-card__old-price">{{ formatPrice(product.oldPrice) }}</span>
      </div>

      <BaseButton
        variant="primary"
        size="sm"
        block
        :loading="addingToCart"
        @click="emit('add-to-cart', product)"
      >
        Add to Cart
      </BaseButton>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(27, 59, 54, 0.06);
  font-family: var(--font-family-base);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(27, 59, 54, 0.12);
  transform: translateY(-2px);
}

.product-card__media {
  position: relative;
  aspect-ratio: 3 / 4;
  background-color: var(--color-pink-light);
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
  background-color: var(--color-primary);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  padding: 4px var(--space-2);
  border-radius: var(--radius-pill);
}

.product-card__favorite {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background-color: var(--color-white);
  color: var(--color-sand);
  cursor: pointer;
  transition: color 0.2s ease, transform 0.15s ease;
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

.product-card__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
}

.product-card__prices {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.product-card__price {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
}

.product-card__old-price {
  font-size: 13px;
  color: var(--color-sand);
  text-decoration: line-through;
}
</style>
