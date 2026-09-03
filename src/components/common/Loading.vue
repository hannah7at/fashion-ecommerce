<script setup>
/**
 * Loading - shared Loading component (Design System)
 * Modes:
 *  - fullPage: covers the viewport (page-level loading)
 *  - default: inline spinner, useful for cards/sections/product loading
 */

defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },

  text: {
    type: String,
    default: ''
  },

  fullPage: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <!-- Full Page Loading -->
  <div
    v-if="fullPage"
    class="loading loading--full-page"
    role="status"
    aria-live="polite"
  >
    <span
      class="loading__spinner"
      :class="`loading__spinner--${size}`"
      aria-hidden="true"
    ></span>

    <p v-if="text" class="loading__text">
      {{ text }}
    </p>
  </div>

  <!-- Inline Loading -->
  <div
    v-else
    class="loading loading--inline"
    role="status"
    aria-live="polite"
  >
    <span
      class="loading__spinner"
      :class="`loading__spinner--${size}`"
      aria-hidden="true"
    ></span>

    <span v-if="text" class="loading__text">
      {{ text }}
    </span>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.loading--inline {
  padding: var(--space-4);
}

.loading--full-page {
  position: fixed;
  inset: 0;
  flex-direction: column;
  background-color: rgba(253, 249, 247, 0.85);
  z-index: 200;
}

.loading__spinner {
  display: inline-block;
  border-radius: 50%;
  border: 3px solid var(--color-pink-light);
  border-top-color: var(--color-primary);
  animation: loading-spin 0.7s linear infinite;
}

.loading__spinner--sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.loading__spinner--md {
  width: 28px;
  height: 28px;
  border-width: 3px;
}

.loading__spinner--lg {
  width: 44px;
  height: 44px;
  border-width: 4px;
}

.loading__text {
  font-family: var(--font-family-base);
  font-size: 14px;
  color: var(--color-gray);
}

@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>