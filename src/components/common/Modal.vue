<script setup>
import { watch, onBeforeUnmount } from 'vue'

/**
 * Modal - shared Modal component (Design System)
 * Usage: <Modal v-model="isOpen" title="...">content</Modal>
 */

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },

  title: {
    type: String,
    default: ''
  },

  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    close()
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.removeEventListener('keydown', handleKeydown)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click.self="handleOverlayClick"
      >
        <div
          class="modal-card"
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Modal dialog'"
        >
          <header
            v-if="title || $slots.header"
            class="modal-card__header"
          >
            <slot name="header">
              <h3 class="modal-card__title">
                {{ title }}
              </h3>
            </slot>

            <button
              class="modal-card__close"
              type="button"
              aria-label="Close"
              @click="close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 2L14 14M14 2L2 14"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </header>

          <div class="modal-card__body">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="modal-card__footer"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(47, 47, 47, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 300;
}

.modal-card {
  width: 100%;
  max-width: 480px;
  max-height: calc(100svh - var(--space-8));
  overflow-y: auto;
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(27, 59, 54, 0.18);
  font-family: var(--font-family-base);
}

.modal-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-6) 0;
}

.modal-card__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gray);
  margin: 0;
}

.modal-card__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-gray);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.modal-card__close:hover {
  background-color: var(--color-pink-light);
}

.modal-card__body {
  padding: var(--space-6);
  font-size: 16px;
  color: var(--color-gray);
}

.modal-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: 0 var(--space-6) var(--space-6);
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal-card {
    max-width: 100%;
    max-height: calc(100svh - var(--space-8));
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}
</style>