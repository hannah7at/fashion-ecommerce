<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const router = useRouter()

const cartStore = useCartStore()
const authStore = useAuthStore()

const cartCount = computed(() => {
  return cartStore.totalItemsCount
})

const goTo = (path) => {
  router.push(path)
}

const goToProducts = () => {
  router.push('/products')
}

const goToProfile = () => {
  router.push('/profile')
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="navbar">
    <div class="container navbar-container">

      <!-- Logo -->
      <button
        type="button"
        class="logo"
        @click="goTo('/')"
      >
        Fashion<span>Store</span>
      </button>

      <!-- Navigation -->
      <nav class="nav-links">

        <button
          type="button"
          @click="goTo('/')"
        >
          Home
        </button>

        <button
          type="button"
          @click="goToProducts"
        >
          Products
        </button>

        <button
          type="button"
          @click="goTo('/outfit')"
        >
          Outfit
        </button>

      </nav>

      <!-- Actions -->
      <div class="nav-actions">

        <!-- Guest -->
        <button
          v-if="!authStore.isLoggedIn"
          type="button"
          class="login-button"
          @click="goTo('/login')"
        >
          Login
        </button>

        <!-- Logged User -->
        <button
          v-else
          type="button"
          class="profile-button"
          @click="goToProfile"
        >
          Profile
        </button>

        <!-- Logout -->
        <button
          v-if="authStore.isLoggedIn"
          type="button"
          class="logout-button"
          @click="logout"
        >
          Logout
        </button>

        <!-- Cart -->
        <button
          type="button"
          class="cart-button"
          aria-label="Shopping cart"
          @click="goTo('/cart')"
        >
          🛒

          <span
            v-if="cartCount > 0"
            class="cart-badge"
          >
            {{ cartCount }}
          </span>
        </button>

      </div>

    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;

  top: 0;

  z-index: 100;

  width: 100%;

  background-color: var(--color-white);

  border-bottom: 1px solid rgba(27, 59, 54, 0.08);

  box-shadow: 0 2px 10px rgba(27, 59, 54, 0.04);
}

.navbar-container {
  min-height: 72px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: var(--space-6);
}

.logo {
  padding: 0;

  border: none;

  background: transparent;

  color: var(--color-primary);

  font-size: 22px;

  font-weight: 700;

  font-family: var(--font-family-base);

  cursor: pointer;
}

.logo span {
  color: var(--color-sand);
}

.nav-links {
  display: flex;

  align-items: center;

  gap: var(--space-6);

  margin-left: auto;
}

.nav-links button {
  padding: 8px 0;

  border: none;

  background: transparent;

  color: var(--color-gray);

  font-size: 14px;

  font-weight: 500;

  font-family: var(--font-family-base);

  transition: color 0.2s ease;
}

.nav-links button:hover {
  color: var(--color-primary);
}

.nav-actions {
  display: flex;

  align-items: center;

  gap: var(--space-2);
}

.login-button,
.profile-button,
.logout-button {
  border: none;

  border-radius: var(--radius-default);

  padding: 9px 14px;

  font-size: 13px;

  font-weight: 500;

  font-family: var(--font-family-base);

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.login-button {
  background-color: var(--color-primary);

  color: var(--color-white);
}

.login-button:hover {
  background-color: var(--color-primary-hover);
}

.profile-button {
  background-color: var(--color-pink-light);

  color: var(--color-primary);
}

.profile-button:hover {
  background-color: var(--color-sand);

  color: var(--color-white);
}

.logout-button {
  background-color: transparent;

  color: var(--color-gray);

  border: 1px solid rgba(27, 59, 54, 0.15);
}

.logout-button:hover {
  background-color: var(--color-beige);

  color: var(--color-primary);
}

.cart-button {
  position: relative;

  width: 40px;
  height: 40px;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 0;

  border: none;

  background: transparent;

  border-radius: 50%;

  font-size: 19px;

  cursor: pointer;

  transition: background-color 0.2s ease;
}

.cart-button:hover {
  background-color: var(--color-beige);
}

.cart-badge {
  position: absolute;

  top: 0;
  right: 0;

  min-width: 18px;
  height: 18px;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 0 4px;

  border-radius: 50%;

  background-color: var(--color-primary);

  color: var(--color-white);

  font-size: 10px;

  font-weight: 600;
}

@media (max-width: 768px) {
  .navbar-container {
    gap: var(--space-3);
  }

  .nav-links {
    gap: var(--space-3);
  }

  .nav-links button {
    font-size: 13px;
  }

  .logout-button {
    display: none;
  }
}

@media (max-width: 560px) {
  .navbar-container {
    min-height: 64px;
  }

  .logo {
    font-size: 18px;
  }

  .nav-links {
    gap: 10px;
  }

  .nav-links button {
    font-size: 12px;
  }

  .login-button,
  .profile-button {
    padding: 7px 10px;
  }
}
</style>