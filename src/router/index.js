import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import UserProfile from '../views/UserProfile.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },

  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile
  },

  {
    path: '/products-test',
    name: 'ProductsTest',
    component: () => import('../views/ProductTest.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router