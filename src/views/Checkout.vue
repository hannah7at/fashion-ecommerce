<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const fullName = ref(authStore.user?.fullName || '')
const email = ref(authStore.user?.email || '')
const phone = ref(authStore.user?.phone || '')
const address = ref('')
const city = ref('')
const country = ref('Egypt')

const paymentMethod = ref('cash')

const fullNameError = ref('')
const emailError = ref('')
const phoneError = ref('')
const addressError = ref('')
const cityError = ref('')
const formError = ref('')

const isPlacingOrder = ref(false)

const orderPlaced = ref(false)
const orderNumber = ref('')
const placedOrderTotal = ref(0)

const total = computed(() => cartStore.totalPrice)

/* ================================
   VALIDATION PATTERNS
================================ */

const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const egyptianPhonePattern =
  /^(?:\+20|0020)?[\s-]?01[0125][\s-]?\d{4}[\s-]?\d{4}$/

/* ================================
   VALIDATION
================================ */

function validateFullName() {
  fullNameError.value = ''

  const value = fullName.value.trim()

  if (!value) {
    fullNameError.value =
      'Please enter your full name.'
    return false
  }

  if (value.length < 3) {
    fullNameError.value =
      'Name must be at least 3 characters.'
    return false
  }

  if (value.length > 60) {
    fullNameError.value =
      'Name must be less than 60 characters.'
    return false
  }

  const namePattern =
    /^[A-Za-z\u0600-\u06FF\s.'-]+$/

  if (!namePattern.test(value)) {
    fullNameError.value =
      'Name can only contain letters and spaces.'
    return false
  }

  return true
}

function validateEmail() {
  emailError.value = ''

  const value =
    email.value.trim().toLowerCase()

  if (!value) {
    emailError.value =
      'Please enter your email address.'
    return false
  }

  if (!emailPattern.test(value)) {
    emailError.value =
      'Please enter a valid email address.'
    return false
  }

  if (value.length > 100) {
    emailError.value =
      'Email address is too long.'
    return false
  }

  return true
}

function normalizePhone(value) {
  return value
    .replace(/[\s-]/g, '')
    .trim()
}

function validatePhone() {
  phoneError.value = ''

  const value = phone.value.trim()

  if (!value) {
    phoneError.value =
      'Please enter your phone number.'
    return false
  }

  if (!egyptianPhonePattern.test(value)) {
    phoneError.value =
      'Please enter a valid Egyptian mobile number.'
    return false
  }

  let finalPhone =
    normalizePhone(value)

  if (finalPhone.startsWith('+20')) {
    finalPhone =
      '0' + finalPhone.slice(3)
  } else if (
    finalPhone.startsWith('0020')
  ) {
    finalPhone =
      '0' + finalPhone.slice(4)
  }

  phone.value = finalPhone

  return true
}

function validateAddress() {
  addressError.value = ''

  const value = address.value.trim()

  if (!value) {
    addressError.value =
      'Please enter your shipping address.'
    return false
  }

  if (value.length < 5) {
    addressError.value =
      'Please enter a more complete address.'
    return false
  }

  if (value.length > 200) {
    addressError.value =
      'Address is too long.'
    return false
  }

  return true
}

function validateCity() {
  cityError.value = ''

  const value = city.value.trim()

  if (!value) {
    cityError.value =
      'Please enter your city.'
    return false
  }

  if (value.length < 2) {
    cityError.value =
      'Please enter a valid city.'
    return false
  }

  if (value.length > 50) {
    cityError.value =
      'City name is too long.'
    return false
  }

  const cityPattern =
    /^[A-Za-z\u0600-\u06FF\s.'-]+$/

  if (!cityPattern.test(value)) {
    cityError.value =
      'City can only contain letters and spaces.'
    return false
  }

  return true
}

function validateForm() {
  formError.value = ''

  const validName =
    validateFullName()

  const validEmail =
    validateEmail()

  const validPhone =
    validatePhone()

  const validAddress =
    validateAddress()

  const validCity =
    validateCity()

  return (
    validName &&
    validEmail &&
    validPhone &&
    validAddress &&
    validCity
  )
}

/* ================================
   CLEAR ERRORS
================================ */

function clearFullNameError() {
  fullNameError.value = ''
  formError.value = ''
}

function clearEmailError() {
  emailError.value = ''
  formError.value = ''
}

function clearPhoneError() {
  phoneError.value = ''
  formError.value = ''
}

function clearAddressError() {
  addressError.value = ''
  formError.value = ''
}

function clearCityError() {
  cityError.value = ''
  formError.value = ''
}

/* ================================
   ORDER NUMBER
================================ */

function generateOrderNumber() {
  return (
    'ORD-' +
    Math.floor(
      100000 +
      Math.random() * 900000
    )
  )
}

/* ================================
   PLACE ORDER
================================ */

async function placeOrder() {
  formError.value = ''

  if (!authStore.isLoggedIn) {
    await router.push({
      path: '/login',
      query: {
        redirect: '/checkout'
      }
    })

    return
  }

  if (cartStore.items.length === 0) {
    formError.value =
      'Your cart is empty. Please add products before checkout.'

    return
  }

  if (!validateForm()) {
    formError.value =
      'Please check the highlighted fields and try again.'

    return
  }

  isPlacingOrder.value = true

  try {
    const newOrderNumber =
      generateOrderNumber()

    const order = {
      id: Date.now(),

      orderNumber:
        newOrderNumber,

      date:
        new Date().toISOString(),

      customer: {
        fullName:
          fullName.value.trim(),

        email:
          email.value.trim().toLowerCase(),

        phone:
          normalizePhone(
            phone.value
          )
      },

      shipping: {
        address:
          address.value.trim(),

        city:
          city.value.trim(),

        country:
          country.value.trim()
      },

      paymentMethod:
        paymentMethod.value,

      items:
        cartStore.items.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          image: item.image,
          selectedSize:
            item.selectedSize || ''
        })),

      subtotal:
        Number(cartStore.totalPrice),

      shipping: 0,

      total:
        Number(cartStore.totalPrice),

      status: 'Placed'
    }

    const saved =
      authStore.addOrder(order)

    if (!saved) {
      formError.value =
        'Your session has expired. Please login again.'

      await router.push({
        path: '/login',
        query: {
          redirect: '/checkout'
        }
      })

      return
    }

    orderNumber.value =
      newOrderNumber

    placedOrderTotal.value =
      Number(order.total)

    orderPlaced.value = true

    cartStore.items = []
  } catch (error) {
    console.error(error)

    formError.value =
      'Something went wrong while placing your order. Please try again.'
  } finally {
    isPlacingOrder.value = false
  }
}

/* ================================
   NAVIGATION
================================ */

function continueShopping() {
  router.push('/')
}

function backToCart() {
  router.push('/cart')
}
</script>

<template>
  <div class="checkout-page">

    <div class="container">

      <!-- ================================
           SUCCESS
      ================================= -->
      <div
        v-if="orderPlaced"
        class="success-card"
      >

        <div class="success-icon">
          ✓
        </div>

        <span class="success-label">
          ORDER CONFIRMED
        </span>

        <h1>
          Order Placed Successfully!
        </h1>

        <p>
          Thank you for your order,
          {{ fullName }}.
        </p>

        <div class="success-details">

          <div class="success-detail">
            <span>
              Order Number
            </span>

            <strong>
              {{ orderNumber }}
            </strong>
          </div>

          <div class="success-detail">
            <span>
              Total
            </span>

            <strong>
              ${{ placedOrderTotal.toFixed(2) }}
            </strong>
          </div>

        </div>

        <div class="success-actions">

          <button
            type="button"
            class="primary-button"
            @click="router.push('/profile')"
          >
            View My Orders
          </button>

          <button
            type="button"
            class="secondary-button"
            @click="continueShopping"
          >
            Continue Shopping
          </button>

        </div>

      </div>


      <!-- ================================
           CHECKOUT
      ================================= -->
      <div v-else>

        <div class="checkout-header">

          <span class="page-label">
            LUMORA CHECKOUT
          </span>

          <h1>
            Checkout
          </h1>

          <p>
            Complete your information to place your order.
          </p>

        </div>


        <!-- ================================
             EMPTY CART
        ================================= -->
        <div
          v-if="cartStore.items.length === 0"
          class="empty-checkout"
        >

          <div class="empty-icon">
            🛒
          </div>

          <h2>
            Your cart is empty
          </h2>

          <p>
            Add some products before checking out.
          </p>

          <button
            type="button"
            class="primary-button empty-button"
            @click="continueShopping"
          >
            Continue Shopping
          </button>

        </div>


        <!-- ================================
             CHECKOUT CONTENT
        ================================= -->
        <div
          v-else
          class="checkout-layout"
        >

          <!-- ================================
               FORM
          ================================= -->
          <section class="checkout-form">

            <!-- GENERAL ERROR -->
            <div
              v-if="formError"
              class="form-error"
            >

              <div class="form-error-icon">
                !
              </div>

              <div>
                <strong>
                  Please check your information
                </strong>

                <p>
                  {{ formError }}
                </p>
              </div>

            </div>


            <!-- CUSTOMER -->
            <div class="form-section">

              <div class="section-title">

                <div class="section-number">
                  01
                </div>

                <div>
                  <h2>
                    Customer Information
                  </h2>

                  <p>
                    Your contact details
                  </p>
                </div>

              </div>


              <!-- NAME -->
              <div class="form-group">

                <label
                  for="fullName"
                >
                  Full Name
                  <span>*</span>
                </label>

                <input
                  id="fullName"
                  v-model="fullName"
                  type="text"
                  class="form-input"
                  :class="{
                    'input-error':
                      fullNameError
                  }"
                  placeholder="Enter your full name"
                  autocomplete="name"
                  maxlength="60"
                  @input="clearFullNameError"
                  @blur="validateFullName"
                />

                <div
                  v-if="fullNameError"
                  class="field-error"
                >
                  <span>!</span>
                  {{ fullNameError }}
                </div>

              </div>


              <!-- EMAIL -->
              <div class="form-group">

                <label
                  for="email"
                >
                  Email Address
                  <span>*</span>
                </label>

                <input
                  id="email"
                  v-model="email"
                  type="email"
                  class="form-input"
                  :class="{
                    'input-error':
                      emailError
                  }"
                  placeholder="Enter your email"
                  autocomplete="email"
                  maxlength="100"
                  @input="clearEmailError"
                  @blur="validateEmail"
                />

                <div
                  v-if="emailError"
                  class="field-error"
                >
                  <span>!</span>
                  {{ emailError }}
                </div>

              </div>


              <!-- PHONE -->
              <div class="form-group">

                <label
                  for="phone"
                >
                  Phone Number
                  <span>*</span>
                </label>

                <input
                  id="phone"
                  v-model="phone"
                  type="tel"
                  inputmode="numeric"
                  class="form-input"
                  :class="{
                    'input-error':
                      phoneError
                  }"
                  placeholder="e.g. 01012345678"
                  autocomplete="tel"
                  maxlength="17"
                  @input="clearPhoneError"
                  @blur="validatePhone"
                />

                <div
                  v-if="phoneError"
                  class="field-error"
                >
                  <span>!</span>
                  {{ phoneError }}
                </div>

                <div
                  v-else
                  class="input-hint"
                >
                  Egyptian mobile number
                </div>

              </div>

            </div>


            <!-- SHIPPING -->
            <div class="form-section">

              <div class="section-title">

                <div class="section-number">
                  02
                </div>

                <div>
                  <h2>
                    Shipping Address
                  </h2>

                  <p>
                    Where should we deliver your order?
                  </p>
                </div>

              </div>


              <!-- ADDRESS -->
              <div class="form-group">

                <label
                  for="address"
                >
                  Address
                  <span>*</span>
                </label>

                <input
                  id="address"
                  v-model="address"
                  type="text"
                  class="form-input"
                  :class="{
                    'input-error':
                      addressError
                  }"
                  placeholder="Street address, building number..."
                  autocomplete="street-address"
                  maxlength="200"
                  @input="clearAddressError"
                  @blur="validateAddress"
                />

                <div
                  v-if="addressError"
                  class="field-error"
                >
                  <span>!</span>
                  {{ addressError }}
                </div>

              </div>


              <!-- CITY / COUNTRY -->
              <div class="form-row">

                <div class="form-group">

                  <label
                    for="city"
                  >
                    City
                    <span>*</span>
                  </label>

                  <input
                    id="city"
                    v-model="city"
                    type="text"
                    class="form-input"
                    :class="{
                      'input-error':
                        cityError
                    }"
                    placeholder="City"
                    autocomplete="address-level2"
                    maxlength="50"
                    @input="clearCityError"
                    @blur="validateCity"
                  />

                  <div
                    v-if="cityError"
                    class="field-error"
                  >
                    <span>!</span>
                    {{ cityError }}
                  </div>

                </div>


                <div class="form-group">

                  <label
                    for="country"
                  >
                    Country
                  </label>

                  <input
                    id="country"
                    v-model="country"
                    type="text"
                    class="form-input"
                    autocomplete="country-name"
                  />

                </div>

              </div>

            </div>


            <!-- PAYMENT -->
            <div class="form-section">

              <div class="section-title">

                <div class="section-number">
                  03
                </div>

                <div>
                  <h2>
                    Payment Method
                  </h2>

                  <p>
                    Choose how you want to pay
                  </p>
                </div>

              </div>


              <!-- CASH -->
              <label
                class="payment-option"
                :class="{
                  selected:
                    paymentMethod === 'cash'
                }"
              >

                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="cash"
                />

                <div class="payment-radio"></div>

                <div class="payment-content">

                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order arrives
                  </span>

                </div>

              </label>


              <!-- CARD -->
              <label
                class="payment-option"
                :class="{
                  selected:
                    paymentMethod === 'card'
                }"
              >

                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="card"
                />

                <div class="payment-radio"></div>

                <div class="payment-content">

                  <strong>
                    Credit / Debit Card
                  </strong>

                  <span>
                    Card payment
                  </span>

                </div>

              </label>


              <div
                v-if="paymentMethod === 'card'"
                class="payment-note"
              >
                <span>i</span>

                Card payment is currently a UI option.
                A real payment gateway can be connected later.
              </div>

            </div>

          </section>


          <!-- ================================
               SUMMARY
          ================================= -->
          <aside class="checkout-summary">

            <div class="summary-header">

              <span>
                YOUR ORDER
              </span>

              <h2>
                Order Summary
              </h2>

            </div>


            <!-- PRODUCTS -->
            <div class="summary-products">

              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="summary-product"
              >

                <div class="product-image-wrapper">

                  <img
                    :src="item.image"
                    :alt="item.name"
                  />

                  <span class="quantity-badge">
                    {{ item.quantity }}
                  </span>

                </div>


                <div class="summary-product-info">

                  <h3>
                    {{ item.name }}
                  </h3>

                  <p v-if="item.selectedSize">
                    Size: {{ item.selectedSize }}
                  </p>

                  <p>
                    Qty: {{ item.quantity }}
                  </p>

                  <strong>
                    ${{ (
                      item.price *
                      item.quantity
                    ).toFixed(2) }}
                  </strong>

                </div>

              </div>

            </div>


            <div class="summary-divider"></div>


            <!-- SUBTOTAL -->
            <div class="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ${{ Number(
                  cartStore.totalPrice
                ).toFixed(2) }}
              </span>

            </div>


            <!-- SHIPPING -->
            <div class="summary-row">

              <span>
                Shipping
              </span>

              <span class="free">
                Free
              </span>

            </div>


            <div class="summary-divider"></div>


            <!-- TOTAL -->
            <div class="summary-total">

              <span>
                Total
              </span>

              <strong>
                ${{ Number(
                  total
                ).toFixed(2) }}
              </strong>

            </div>


            <!-- PLACE ORDER -->
            <button
              type="button"
              class="place-order-button"
              :disabled="isPlacingOrder"
              @click="placeOrder"
            >

              <span
                v-if="isPlacingOrder"
                class="loading-spinner"
              ></span>

              <span>
                {{
                  isPlacingOrder
                    ? 'Placing Order...'
                    : 'Place Order'
                }}
              </span>

            </button>


            <!-- BACK -->
            <button
              type="button"
              class="back-button"
              :disabled="isPlacingOrder"
              @click="backToCart"
            >
              ← Back to Cart
            </button>


            <div class="secure-note">
              <span>✓</span>
              Secure checkout experience
            </div>

          </aside>

        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.checkout-page {
  min-height: calc(100vh - 72px);

  padding:
    var(--space-12, 48px) 0;

  background-color:
    var(--color-beige);
}

/* ================================
   HEADER
================================ */

.checkout-header {
  margin-bottom:
    var(--space-8, 32px);
}

.page-label {
  display: inline-block;

  margin-bottom: 8px;

  color:
    var(--color-sand);

  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
}

.checkout-header h1 {
  margin-bottom: 8px;

  color:
    var(--color-primary);

  font-size: 36px;
  font-weight: 600;
}

.checkout-header p {
  margin: 0;

  color: #777777;

  font-size: 14px;
}

/* ================================
   LAYOUT
================================ */

.checkout-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr) 380px;

  gap:
    var(--space-8, 32px);

  align-items: start;
}

/* ================================
   FORM CARD
================================ */

.checkout-form {
  padding:
    var(--space-6, 24px);

  border:
    1px solid
    rgba(235, 214, 207, 0.8);

  border-radius:
    var(--radius-card, 16px);

  background-color:
    var(--color-white);

  box-shadow:
    0 8px 25px
    rgba(27, 59, 54, 0.03);
}

.form-section {
  padding-bottom:
    var(--space-8, 32px);

  margin-bottom:
    var(--space-8, 32px);

  border-bottom:
    1px solid
    var(--color-pink-light);
}

.form-section:last-child {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: none;
}

/* ================================
   SECTION TITLE
================================ */

.section-title {
  display: flex;
  align-items: center;
  gap: 14px;

  margin-bottom:
    var(--space-6, 24px);
}

.section-number {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 50%;

  background-color:
    var(--color-pink-light);

  color:
    var(--color-primary);

  font-size: 11px;
  font-weight: 700;
}

.section-title h2 {
  margin: 0 0 3px;

  color:
    var(--color-primary);

  font-size: 20px;
  font-weight: 600;
}

.section-title p {
  margin: 0;

  color: #999999;

  font-size: 12px;
}

/* ================================
   FORM GROUP
================================ */

.form-group {
  display: flex;
  flex-direction: column;

  margin-bottom:
    var(--space-5, 20px);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  margin-bottom: 8px;

  color:
    var(--color-gray);

  font-size: 13px;
  font-weight: 600;
}

.form-group label span {
  color: #b33a4a;
}

.form-input {
  width: 100%;

  min-height: 47px;

  padding: 11px 14px;

  border:
    1px solid
    var(--color-pink-light);

  border-radius:
    var(--radius-default, 8px);

  outline: none;

  color:
    var(--color-gray);

  background-color:
    var(--color-white);

  font-size: 14px;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.form-input::placeholder {
  color: #aaaaaa;
}

.form-input:hover {
  border-color:
    var(--color-sand);
}

.form-input:focus {
  border-color:
    var(--color-sand);

  box-shadow:
    0 0 0 4px
    rgba(235, 214, 207, 0.35);
}

.form-input.input-error {
  border-color: #c85b68;

  background-color:
    #fffafa;
}

.form-input.input-error:focus {
  border-color: #c85b68;

  box-shadow:
    0 0 0 4px
    rgba(200, 91, 104, 0.1);
}

/* ================================
   FORM ROW
================================ */

.form-row {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap:
    var(--space-4, 16px);
}

/* ================================
   FIELD ERROR
================================ */

.field-error {
  display: flex;
  align-items: center;
  gap: 6px;

  margin-top: 7px;

  color: #b33a4a;

  font-size: 12px;
  line-height: 1.4;
}

.field-error span {
  width: 16px;
  height: 16px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 50%;

  background-color: #b33a4a;

  color: #ffffff;

  font-size: 10px;
  font-weight: 700;
}

.input-hint {
  margin-top: 6px;

  color: #999999;

  font-size: 11px;
}

/* ================================
   GENERAL ERROR
================================ */

.form-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin-bottom: 24px;
  padding: 13px 14px;

  border:
    1px solid
    #f0c8cd;

  border-radius: 10px;

  background-color:
    #fff5f6;

  color: #b33a4a;
}

.form-error-icon {
  width: 22px;
  height: 22px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 50%;

  background-color:
    #b33a4a;

  color: #ffffff;

  font-size: 12px;
  font-weight: 700;
}

.form-error strong {
  display: block;

  margin-bottom: 3px;

  font-size: 12px;
}

.form-error p {
  margin: 0;

  color: #8f4a54;

  font-size: 12px;
  line-height: 1.5;
}

/* ================================
   PAYMENT
================================ */

.payment-option {
  position: relative;

  display: flex;
  align-items: center;
  gap: 13px;

  padding: 14px 16px;

  margin-bottom: 10px;

  border:
    1px solid
    var(--color-pink-light);

  border-radius:
    var(--radius-default, 8px);

  background-color:
    var(--color-white);

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.payment-option:hover {
  border-color:
    var(--color-sand);

  background-color:
    var(--color-beige);
}

.payment-option.selected {
  border-color:
    var(--color-primary);

  background-color:
    rgba(235, 214, 207, 0.2);
}

.payment-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.payment-radio {
  width: 19px;
  height: 19px;

  flex-shrink: 0;

  border:
    1.5px solid
    var(--color-sand);

  border-radius: 50%;

  position: relative;
}

.payment-option.selected
.payment-radio {
  border-color:
    var(--color-primary);
}

.payment-option.selected
.payment-radio::after {
  content: '';

  position: absolute;

  width: 9px;
  height: 9px;

  top: 50%;
  left: 50%;

  transform:
    translate(-50%, -50%);

  border-radius: 50%;

  background-color:
    var(--color-primary);
}

.payment-content {
  display: flex;
  flex-direction: column;

  gap: 3px;
}

.payment-content strong {
  color:
    var(--color-gray);

  font-size: 13px;
}

.payment-content span {
  color: #999999;

  font-size: 11px;
}

.payment-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  padding: 11px 12px;

  margin-top: 12px;

  border-radius: 8px;

  background-color:
    var(--color-beige);

  color:
    var(--color-sand);

  font-size: 11px;

  line-height: 1.5;
}

.payment-note > span {
  width: 17px;
  height: 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 50%;

  background-color:
    var(--color-sand);

  color: #ffffff;

  font-size: 10px;
}

/* ================================
   SUMMARY
================================ */

.checkout-summary {
  position: sticky;
  top: 96px;

  padding:
    var(--space-6, 24px);

  border:
    1px solid
    rgba(235, 214, 207, 0.8);

  border-radius:
    var(--radius-card, 16px);

  background-color:
    var(--color-white);

  box-shadow:
    0 8px 25px
    rgba(27, 59, 54, 0.04);
}

.summary-header {
  margin-bottom: 22px;
}

.summary-header > span {
  color:
    var(--color-sand);

  font-size: 9px;
  font-weight: 600;

  letter-spacing: 2px;
}

.summary-header h2 {
  margin: 5px 0 0;

  color:
    var(--color-primary);

  font-size: 21px;
  font-weight: 600;
}

/* ================================
   PRODUCTS
================================ */

.summary-products {
  max-height: 390px;

  overflow-y: auto;

  padding-right: 4px;
}

.summary-product {
  display: flex;

  gap: 12px;

  margin-bottom: 16px;
}

.summary-product:last-child {
  margin-bottom: 0;
}

.product-image-wrapper {
  position: relative;

  width: 65px;
  height: 78px;

  flex-shrink: 0;
}

.product-image-wrapper img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  border-radius:
    var(--radius-default, 8px);

  background-color:
    var(--color-beige);
}

.quantity-badge {
  position: absolute;

  top: -6px;
  right: -6px;

  min-width: 20px;
  height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 5px;

  border-radius: 50%;

  background-color:
    var(--color-primary);

  color:
    var(--color-white);

  font-size: 10px;
  font-weight: 600;
}

.summary-product-info {
  min-width: 0;

  flex: 1;
}

.summary-product-info h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 5px;
  color: var(--color-gray);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.summary-product-info p {
  margin: 2px 0;

  color:
    var(--color-sand);

  font-size: 10px;
}

.summary-product-info strong {
  display: block;

  margin-top: 5px;

  color:
    var(--color-primary);

  font-size: 13px;
}

/* ================================
   SUMMARY TOTAL
================================ */

.summary-divider {
  height: 1px;

  margin:
    var(--space-4, 16px) 0;

  background-color:
    var(--color-pink-light);
}

.summary-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 10px;

  color:
    var(--color-gray);

  font-size: 13px;
}

.summary-row .free {
  color:
    var(--color-primary);

  font-weight: 600;
}

.summary-total {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 22px;

  color:
    var(--color-primary);
}

.summary-total span {
  font-size: 15px;
  font-weight: 600;
}

.summary-total strong {
  font-size: 22px;
  font-weight: 600;
}

/* ================================
   BUTTONS
================================ */

.place-order-button,
.primary-button {
  width: 100%;

  min-height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  padding: 12px 16px;

  border: 1px solid
    var(--color-primary);

  border-radius:
    var(--radius-default, 8px);

  background-color:
    var(--color-primary);

  color:
    var(--color-white);

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.place-order-button:hover:not(:disabled),
.primary-button:hover {
  background-color:
    var(--color-primary-hover);

  transform:
    translateY(-1px);
}

.place-order-button:disabled {
  opacity: 0.7;

  cursor: not-allowed;

  transform: none;
}

.back-button,
.secondary-button {
  width: 100%;

  min-height: 46px;

  margin-top: 10px;

  padding: 11px 16px;

  border:
    1px solid
    var(--color-primary);

  border-radius:
    var(--radius-default, 8px);

  background-color:
    var(--color-white);

  color:
    var(--color-primary);

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition:
    background-color 0.2s ease;
}

.back-button:hover:not(:disabled),
.secondary-button:hover {
  background-color:
    var(--color-pink-light);
}

.back-button:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}

/* ================================
   LOADING
================================ */

.loading-spinner {
  width: 16px;
  height: 16px;

  border:
    2px solid
    rgba(255, 255, 255, 0.35);

  border-top-color:
    var(--color-white);

  border-radius: 50%;

  animation:
    spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================================
   SECURE NOTE
================================ */

.secure-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  margin-top: 16px;

  color: #999999;

  font-size: 10px;
}

.secure-note span {
  color:
    var(--color-primary);

  font-weight: 700;
}

/* ================================
   EMPTY
================================ */

.empty-checkout {
  max-width: 500px;

  margin:
    var(--space-16, 64px) auto;

  padding:
    var(--space-12, 48px)
    var(--space-6, 24px);

  border:
    1px solid
    var(--color-pink-light);

  border-radius:
    var(--radius-card, 16px);

  background-color:
    var(--color-white);

  text-align: center;
}

.empty-checkout .empty-icon {
  margin-bottom: 18px;

  font-size: 45px;
}

.empty-checkout h2 {
  margin-bottom: 8px;

  color:
    var(--color-primary);

  font-size: 22px;
}

.empty-checkout p {
  margin-bottom: 24px;

  color:
    var(--color-sand);

  font-size: 13px;
}

.empty-button {
  max-width: 260px;

  margin: 0 auto;
}

/* ================================
   SUCCESS
================================ */

.success-card {
  max-width: 600px;

  margin:
    var(--space-16, 64px) auto;

  padding:
    var(--space-12, 48px)
    var(--space-6, 24px);

  border:
    1px solid
    var(--color-pink-light);

  border-radius:
    var(--radius-card, 16px);

  background-color:
    var(--color-white);

  text-align: center;

  box-shadow:
    0 10px 35px
    rgba(27, 59, 54, 0.05);
}

.success-icon {
  width: 66px;
  height: 66px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin:
    0 auto 16px;

  border-radius: 50%;

  background-color:
    var(--color-primary);

  color:
    var(--color-white);

  font-size: 30px;
  font-weight: 600;
}

.success-label {
  display: block;

  margin-bottom: 7px;

  color:
    var(--color-sand);

  font-size: 9px;
  font-weight: 600;

  letter-spacing: 2px;
}

.success-card h1 {
  margin-bottom: 10px;

  color:
    var(--color-primary);

  font-size: 27px;
  font-weight: 600;
}

.success-card > p {
  margin-bottom: 24px;

  color:
    var(--color-gray);

  font-size: 14px;
}

.success-details {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 10px;

  max-width: 390px;

  margin: 0 auto;
}

.success-detail {
  padding: 14px;

  border:
    1px solid
    var(--color-pink-light);

  border-radius: 10px;

  background-color:
    var(--color-beige);
}

.success-detail span {
  display: block;

  margin-bottom: 5px;

  color: #999999;

  font-size: 10px;
}

.success-detail strong {
  color:
    var(--color-primary);

  font-size: 14px;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0;

  max-width: 260px;

  margin:
    28px auto 0;
}

.success-actions .secondary-button {
  margin-top: 10px;
}

/* ================================
   RESPONSIVE
================================ */

@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .checkout-summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .checkout-page {
    padding:
      var(--space-8, 32px) 0;
  }

  .checkout-header h1 {
    font-size: 30px;
  }

  .checkout-form,
  .checkout-summary {
    padding:
      var(--space-4, 16px);
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .success-card {
    margin:
      var(--space-8, 32px) auto;

    padding:
      var(--space-8, 32px)
      var(--space-4, 16px);
  }

  .success-details {
    grid-template-columns: 1fr;
  }

  .success-card h1 {
    font-size: 23px;
  }
}
</style>