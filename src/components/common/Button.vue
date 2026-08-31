<script setup>
/**
 * BaseButton - shared Button component (Design System)
 * Variants: primary | secondary | outline
 * Supports disabled state, loading state, and 3 sizes.
 */
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

function handleClick(event) {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    class="base-button"
    :class="[`base-button--${variant}`, `base-button--${size}`, { 'is-block': block, 'is-loading': loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span class="base-button__spinner" v-if="loading" aria-hidden="true"></span>
    <span class="base-button__content" :class="{ 'is-hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-family-base);
  font-weight: 600;
  border: 1.5px solid transparent;
  border-radius: var(--radius-default);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.base-button.is-block {
  width: 100%;
}

/* Sizes */
.base-button--sm {
  padding: var(--space-2) var(--space-3);
  font-size: 14px;
}
.base-button--md {
  padding: var(--space-3) var(--space-4);
  font-size: 15px;
}
.base-button--lg {
  padding: var(--space-4) var(--space-6);
  font-size: 16px;
}

/* Variants */
.base-button--primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  border-color: var(--color-primary);
}
.base-button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.base-button--secondary {
  background-color: var(--color-sand);
  color: var(--color-white);
  border-color: var(--color-sand);
}
.base-button--secondary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.base-button--outline {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.base-button--outline:hover:not(:disabled) {
  background-color: var(--color-pink-light);
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Loading state */
.base-button__content.is-hidden {
  visibility: hidden;
}

.base-button__spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: currentColor;
  animation: base-button-spin 0.7s linear infinite;
}

.base-button--outline .base-button__spinner {
  border: 2px solid rgba(27, 59, 54, 0.25);
  border-top-color: var(--color-primary);
}

@keyframes base-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
