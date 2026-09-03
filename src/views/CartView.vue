<template>
    <div class="cart-container">
        <h1>Shopping Cart</h1>

        <div v-if="cartStore.items.length === 0">
        <p>Your cart is currently empty.</p>
        <router-link to="/">Continue Shopping</router-link>
        </div>

        <div v-else>
        <div>
            <div v-for="item in cartStore.items" :key="item.id">
            <img :src="item.image" :alt="item.name" width="70" />
            
            <div>
                <h3>{{ item.name }}</h3>
                <p>${{ item.price.toFixed(2) }}</p>
            </div>

            <div>
                <button 
                @click="cartStore.updateQuantity(item.id, item.quantity - 1)" 
                :disabled="item.quantity <= 1"
                >-</button>
                <span>{{ item.quantity }}</span>
                <button 
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)" 
                >+</button>
            </div>

            <div>
                ${{ (item.price * item.quantity).toFixed(2) }}
            </div>

            <button @click="cartStore.removeFromCart(item.id)">
                &times;
            </button>
            </div>
        </div>

        <div>
            <h2>Order Summary</h2>
            <div>
            <span>Total: </span>
            <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>

            <button>
                Proceed to Checkout
            </button>
        </div>
        </div>
    </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
</script>