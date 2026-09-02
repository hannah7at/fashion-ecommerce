import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import ProductDetails from '../views/ProductDetails.vue'
import Checkout from '../views/Checkout.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/products/:id',
    name: 'ProductDetails',
    component: ProductDetails
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router