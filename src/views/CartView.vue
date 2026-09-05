<script setup>
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

function goToCheckout() {
  if (cartStore.items.length === 0) {
    return
  }

  router.push('/checkout')
}

function continueShopping() {
  router.push({
    path: '/',
    hash: '#featured'
  })
}
</script>

<template>
  <div class="cart-page">
    <div class="container">

      <!-- Header -->
      <div class="cart-header">
        <h1>Shopping Cart</h1>

        <p v-if="cartStore.items.length > 0">
          {{ cartStore.totalItemsCount }} items in your cart
        </p>
      </div>


      <!-- Empty Cart -->
      <div
        v-if="cartStore.items.length === 0"
        class="empty-cart"
      >
        <div class="empty-icon">🛒</div>

        <h2>Your cart is empty</h2>

        <p>
          Looks like you haven't added anything to your cart yet.
        </p>

        <button
          type="button"
          class="continue-button"
          @click="continueShopping"
        >
          Continue Shopping
        </button>
      </div>


      <!-- Cart -->
      <div
        v-else
        class="cart-layout"
      >

        <!-- Products -->
        <section class="cart-items">

          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="cart-item"
          >

            <img
              :src="item.image"
              :alt="item.name"
              class="product-image"
            />

            <div class="product-info">
              <h3>{{ item.name }}</h3>

              <p class="product-price">
                ${{ Number(item.price).toFixed(2) }}
              </p>

              <p
                v-if="item.selectedSize"
                class="product-size"
              >
                Size: {{ item.selectedSize }}
              </p>

              <div class="quantity-control">

                <button
                  type="button"
                  @click="
                    cartStore.updateQuantity(
                      item.id,
                      item.quantity - 1
                    )
                  "
                  :disabled="item.quantity <= 1"
                >
                  −
                </button>

                <span>{{ item.quantity }}</span>

                <button
                  type="button"
                  @click="
                    cartStore.updateQuantity(
                      item.id,
                      item.quantity + 1
                    )
                  "
                >
                  +
                </button>

              </div>
            </div>


            <div class="item-total">
              <strong>
                ${{ (item.price * item.quantity).toFixed(2) }}
              </strong>

              <button
                type="button"
                class="remove-button"
                @click="cartStore.removeFromCart(item.id)"
              >
                Remove
              </button>
            </div>

          </div>

        </section>


        <!-- Order Summary -->
        <aside class="order-summary">

          <h2>Order Summary</h2>

          <div class="summary-row">
            <span>Subtotal</span>

            <span>
              ${{ cartStore.totalPrice.toFixed(2) }}
            </span>
          </div>

          <div class="summary-row">
            <span>Shipping</span>

            <span>Free</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-total">
            <span>Total</span>

            <strong>
              ${{ cartStore.totalPrice.toFixed(2) }}
            </strong>
          </div>

          <button
            type="button"
            class="checkout-button"
            @click="goToCheckout"
          >
            Proceed to Checkout
          </button>

          <button
            type="button"
            class="continue-shopping"
            @click="continueShopping"
          >
            ← Continue Shopping
          </button>

        </aside>

      </div>

    </div>
  </div>
</template>


<style scoped>
.cart-page {
  min-height: calc(100vh - 72px);
  background-color: var(--color-beige);
  padding: var(--space-12) 0;
}


/* Header */

.cart-header {
  margin-bottom: var(--space-8);
}

.cart-header h1 {
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.cart-header p {
  color: var(--color-sand);
  font-size: 14px;
}


/* Layout */

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-8);
  align-items: start;
}


/* Items */

.cart-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cart-item {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: var(--space-4);

  display: grid;
  grid-template-columns: 110px 1fr auto;
  gap: var(--space-6);
  align-items: center;

  border: 1px solid var(--color-pink-light);
}


/* Product */

.product-image {
  width: 110px;
  height: 130px;
  object-fit: cover;
  border-radius: var(--radius-default);
}

.product-info h3 {
  font-size: 17px;
  color: var(--color-gray);
  margin-bottom: var(--space-2);
}

.product-price {
  color: var(--color-primary);
  font-size: 15px;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.product-size {
  color: var(--color-sand);
  font-size: 13px;
  margin-bottom: var(--space-3);
}


/* Quantity */

.quantity-control {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.quantity-control button {
  width: 30px;
  height: 30px;

  border: 1px solid var(--color-sand);
  border-radius: var(--radius-sm);

  background-color: var(--color-white);
  color: var(--color-primary);

  font-size: 17px;
}

.quantity-control button:hover:not(:disabled) {
  background-color: var(--color-pink-light);
}

.quantity-control button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-control span {
  min-width: 20px;
  text-align: center;
  font-weight: 500;
}


/* Total */

.item-total {
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;

  gap: var(--space-4);
}

.item-total strong {
  color: var(--color-primary);
  font-size: 17px;
}

.remove-button {
  border: none;
  background: none;

  color: var(--color-sand);

  font-size: 13px;
}

.remove-button:hover {
  color: var(--color-primary-hover);
}


/* Summary */

.order-summary {
  background-color: var(--color-white);

  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);

  padding: var(--space-6);

  position: sticky;
  top: 96px;
}

.order-summary h2 {
  font-size: 22px;
  color: var(--color-primary);

  margin-bottom: var(--space-6);
}

.summary-row,
.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row {
  margin-bottom: var(--space-3);
  font-size: 14px;
}

.summary-divider {
  height: 1px;

  background-color: var(--color-pink-light);

  margin: var(--space-4) 0;
}

.summary-total {
  margin-bottom: var(--space-6);

  color: var(--color-primary);
}

.summary-total strong {
  font-size: 20px;
}


/* Checkout */

.checkout-button {
  width: 100%;

  padding: var(--space-3);

  border: none;
  border-radius: var(--radius-default);

  background-color: var(--color-primary);
  color: var(--color-white);

  font-weight: 600;

  transition: background-color 0.2s ease;
}

.checkout-button:hover {
  background-color: var(--color-primary-hover);
}


/* Continue Shopping */

.continue-shopping {
  width: 100%;

  display: block;

  margin-top: var(--space-4);

  padding: var(--space-2);

  border: none;
  background: transparent;

  color: var(--color-primary);

  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 500;

  text-align: center;

  cursor: pointer;

  transition: color 0.2s ease;
}

.continue-shopping:hover {
  color: var(--color-sand);
}


/* Empty */

.empty-cart {
  max-width: 500px;

  margin: var(--space-16) auto;

  padding: var(--space-12) var(--space-6);

  background-color: var(--color-white);

  border-radius: var(--radius-card);

  text-align: center;
}

.empty-icon {
  font-size: 45px;

  margin-bottom: var(--space-4);
}

.empty-cart h2 {
  color: var(--color-primary);

  margin-bottom: var(--space-3);
}

.empty-cart p {
  color: var(--color-sand);

  margin-bottom: var(--space-6);
}

.continue-button {
  display: inline-block;

  padding: var(--space-3) var(--space-6);

  border: none;
  border-radius: var(--radius-default);

  background-color: var(--color-primary);
  color: var(--color-white);

  font-family: var(--font-family-base);
  font-weight: 500;

  cursor: pointer;

  transition: background-color 0.2s ease;
}

.continue-button:hover {
  background-color: var(--color-primary-hover);
}


/* Responsive */

@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .cart-page {
    padding: var(--space-8) 0;
  }

  .cart-item {
    grid-template-columns: 80px 1fr;

    gap: var(--space-4);
  }

  .product-image {
    width: 80px;
    height: 100px;
  }

  .item-total {
    grid-column: 2;

    align-items: flex-start;

    height: auto;
  }
}
</style>
