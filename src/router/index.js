import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/Home.vue'
import Products from '../views/Products.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import UserProfile from '../views/UserProfile.vue'
import CartView from '../views/CartView.vue'
import ProductDetails from '../views/ProductDetails.vue'
import Checkout from '../views/Checkout.vue'
import Outfit from '../views/Outfit.vue'

import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },

  {
    path: '/products',
    name: 'products',
    component: Products
  },

  {
    path: '/product/:id',
    name: 'product-details',
    component: ProductDetails
  },

  {
    path: '/outfit',
    name: 'outfit',
    component: Outfit
  },

  {
    path: '/login',
    name: 'login',
    component: Login
  },

  {
    path: '/register',
    name: 'register',
    component: Register
  },

  {
    path: '/profile',
    name: 'profile',
    component: UserProfile,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/cart',
    name: 'cart',
    component: CartView
  },

  {
    path: '/checkout',
    name: 'checkout',
    component: Checkout,
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  return true
})

export default router