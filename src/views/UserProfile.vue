<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import products from '../data/products.json'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const showEditModal = ref(false)
const isSaving = ref(false)

const fullName = ref('')
const email = ref('')
const phone = ref('')

const selectedAvatarFile = ref(null)
const avatarPreview = ref('')
const fileInput = ref(null)

const showCartToast = ref(false)
const toastProduct = ref(null)

let temporaryAvatarUrl = null
let toastTimer = null

const productList = computed(() => {
  if (Array.isArray(products)) {
    return products
  }

  if (Array.isArray(products?.products)) {
    return products.products
  }

  return []
})

const user = computed(() => ({
  fullName: authStore.user?.fullName || 'User',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  avatar: authStore.user?.avatar || ''
}))

const favoriteProducts = computed(() => {
  return productList.value.filter(product =>
    authStore.favorites.includes(product.id)
  )
})

const orders = computed(() => {
  return Array.isArray(authStore.orders)
    ? authStore.orders
    : []
})

function openEditModal() {
  fullName.value =
    user.value.fullName === 'User'
      ? ''
      : user.value.fullName

  email.value = user.value.email
  phone.value = user.value.phone

  selectedAvatarFile.value = null
  avatarPreview.value = user.value.avatar

  clearTemporaryAvatarUrl()

  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false

  selectedAvatarFile.value = null
  avatarPreview.value = ''

  clearTemporaryAvatarUrl()

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function clearTemporaryAvatarUrl() {
  if (temporaryAvatarUrl) {
    URL.revokeObjectURL(temporaryAvatarUrl)
    temporaryAvatarUrl = null
  }
}

function handleAvatarChange(event) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image.')
    return
  }

  selectedAvatarFile.value = file

  clearTemporaryAvatarUrl()

  temporaryAvatarUrl = URL.createObjectURL(file)
  avatarPreview.value = temporaryAvatarUrl
}

function removeAvatar() {
  selectedAvatarFile.value = null
  avatarPreview.value = ''

  clearTemporaryAvatarUrl()

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = event => {
      const image = new Image()

      image.onload = () => {
        const maxSize = 500

        let width = image.width
        let height = image.height

        if (width > height && width > maxSize) {
          height = Math.round(
            (height * maxSize) / width
          )

          width = maxSize
        } else if (height > maxSize) {
          width = Math.round(
            (width * maxSize) / height
          )

          height = maxSize
        }

        const canvas = document.createElement('canvas')

        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')

        if (!context) {
          reject(new Error('Unable to create image canvas.'))
          return
        }

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        )

        resolve(
          canvas.toDataURL('image/jpeg', 0.8)
        )
      }

      image.onerror = () => {
        reject(new Error('Unable to load image.'))
      }

      image.src = event.target.result
    }

    reader.onerror = () => {
      reject(new Error('Unable to read image.'))
    }

    reader.readAsDataURL(file)
  })
}

async function saveProfile() {
  if (!fullName.value.trim()) {
    alert('Please enter your full name.')
    return
  }

  if (!email.value.trim()) {
    alert('Please enter your email.')
    return
  }

  isSaving.value = true

  try {
    let avatar = user.value.avatar

    if (selectedAvatarFile.value) {
      avatar = await resizeImage(
        selectedAvatarFile.value
      )
    }

    if (!avatarPreview.value) {
      avatar = ''
    }

    authStore.updateUser({
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      avatar
    })

    closeEditModal()
  } catch (error) {
    console.error(error)
    alert('Something went wrong while saving your profile.')
  } finally {
    isSaving.value = false
  }
}

function addFavoriteToCart(product) {
  cartStore.addToCart(product)

  toastProduct.value = product
  showCartToast.value = true

  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  toastTimer = setTimeout(() => {
    showCartToast.value = false
  }, 2500)
}

function closeCartToast() {
  showCartToast.value = false

  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
}

function removeFavorite(productId) {
  authStore.toggleFavorite(productId)
}

function openProduct(productId) {
  router.push(`/product/${productId}`)
}

function continueShopping() {
  router.push('/products')
}

function logout() {
  authStore.logout()
  router.push('/')
}

function formatDate(date) {
  if (!date) {
    return ''
  }

  return new Date(date).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  )
}

function formatPaymentMethod(method) {
  if (method === 'cash') {
    return 'Cash on Delivery'
  }

  if (method === 'card') {
    return 'Credit / Debit Card'
  }

  return method || 'Not specified'
}

onBeforeUnmount(() => {
  clearTemporaryAvatarUrl()

  if (toastTimer) {
    clearTimeout(toastTimer)
  }
})
</script>

<template>
  <div class="profile-page">

    <div class="container">

      <!-- Profile Header -->
      <section class="profile-header">

        <div class="profile-main">

          <!-- Avatar -->
          <div class="profile-avatar">

            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.fullName"
            />

            <div
              v-else
              class="empty-avatar"
              aria-label="No profile photo"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                />

                <path
                  d="M5 20c.8-3.5 3.1-5.5 7-5.5s6.2 2 7 5.5"
                />
              </svg>
            </div>

          </div>

          <!-- User Info -->
          <div class="profile-info">

            <h1>
              {{ user.fullName }}
            </h1>

            <p>
              {{ user.email }}
            </p>

            <p v-if="user.phone">
              {{ user.phone }}
            </p>

          </div>

        </div>

        <div class="profile-actions">

          <button
            type="button"
            class="edit-button"
            @click="openEditModal"
          >
            Edit Profile
          </button>

          <button
            type="button"
            class="logout-button"
            @click="logout"
          >
            Logout
          </button>

        </div>

      </section>


      <!-- Favorites -->
      <section class="profile-section">

        <div class="section-header">

          <div>
            <h2>
              Favorites
            </h2>

            <p>
              Products you saved for later.
            </p>
          </div>

          <span class="section-count">
            {{ favoriteProducts.length }}
          </span>

        </div>


        <!-- Favorites Empty -->
        <div
          v-if="favoriteProducts.length === 0"
          class="empty-section"
        >

          <div class="empty-section-icon">
            ♡
          </div>

          <h3>
            No favorites yet
          </h3>

          <p>
            Start exploring products and save your favorites.
          </p>

          <button
            type="button"
            class="primary-button"
            @click="continueShopping"
          >
            Browse Products
          </button>

        </div>


        <!-- Favorite Products -->
        <div
          v-else
          class="favorites-grid"
        >

          <article
            v-for="product in favoriteProducts"
            :key="product.id"
            class="favorite-card"
          >

            <div
              class="favorite-image-wrapper"
              @click="openProduct(product.id)"
            >

              <img
                :src="product.image"
                :alt="product.name"
                class="favorite-image"
              />

              <button
                type="button"
                class="remove-favorite"
                aria-label="Remove from favorites"
                @click.stop="removeFavorite(product.id)"
              >
                ♥
              </button>

            </div>

            <div class="favorite-content">

              <h3>
                {{ product.name }}
              </h3>

              <p class="favorite-category">
                {{ product.category }}
              </p>

              <div class="favorite-bottom">

                <strong>
                  ${{ Number(product.price).toFixed(2) }}
                </strong>

                <button
                  type="button"
                  class="add-cart-button"
                  @click="addFavoriteToCart(product)"
                >
                  Add to Cart
                </button>

              </div>

            </div>

          </article>

        </div>

      </section>


      <!-- Real Order History -->
      <section class="profile-section orders-section">

        <div class="section-header">

          <div>
            <h2>
              Order History
            </h2>

            <p>
              Your previous orders.
            </p>
          </div>

          <span class="section-count">
            {{ orders.length }}
          </span>

        </div>


        <!-- No Orders -->
        <div
          v-if="orders.length === 0"
          class="empty-section"
        >

          <div class="empty-section-icon">
            📦
          </div>

          <h3>
            No orders yet
          </h3>

          <p>
            Your completed orders will appear here.
          </p>

          <button
            type="button"
            class="primary-button"
            @click="continueShopping"
          >
            Start Shopping
          </button>

        </div>


        <!-- Orders -->
        <div
          v-else
          class="orders-list"
        >

          <article
            v-for="order in orders"
            :key="order.id"
            class="order-card"
          >

            <!-- Order Header -->
            <div class="order-header">

              <div>
                <p class="order-label">
                  Order Number
                </p>

                <h3>
                  {{ order.orderNumber }}
                </h3>
              </div>

              <div class="order-date">
                {{ formatDate(order.date) }}
              </div>

              <span class="order-status">
                {{ order.status || 'Placed' }}
              </span>

            </div>


            <!-- Order Products -->
            <div class="order-products">

              <div
                v-for="(item, index) in order.items"
                :key="`${order.id}-${item.id}-${item.selectedSize || ''}-${index}`"
                class="order-product"
              >

                <img
                  :src="item.image"
                  :alt="item.name"
                />

                <div class="order-product-info">

                  <h4>
                    {{ item.name }}
                  </h4>

                  <p>
                    Quantity: {{ item.quantity }}
                  </p>

                  <p v-if="item.selectedSize">
                    Size: {{ item.selectedSize }}
                  </p>

                </div>

                <strong>
                  ${{ (Number(item.price) * Number(item.quantity)).toFixed(2) }}
                </strong>

              </div>

            </div>


            <!-- Order Footer -->
            <div class="order-footer">

              <div class="order-shipping">

                <p>
                  <strong>
                    Shipping Address:
                  </strong>

                  {{ order.shipping?.address || 'Not specified' }},
                  {{ order.shipping?.city || '' }},
                  {{ order.shipping?.country || '' }}
                </p>

                <p>
                  <strong>
                    Payment:
                  </strong>

                  {{ formatPaymentMethod(order.paymentMethod) }}
                </p>

              </div>

              <div class="order-total">

                <span>
                  Total
                </span>

                <strong>
                  ${{ Number(order.total || 0).toFixed(2) }}
                </strong>

              </div>

            </div>

          </article>

        </div>

      </section>

    </div>


    <!-- Cart Toast -->
    <Transition name="cart-toast">

      <div
        v-if="showCartToast"
        class="cart-toast"
        role="status"
        aria-live="polite"
      >

        <div class="toast-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M20 6 9 17l-5-5"
            />
          </svg>
        </div>

        <div class="toast-content">

          <strong>
            Added to cart
          </strong>

          <span>
            {{ toastProduct?.name }}
          </span>

        </div>

        <button
          type="button"
          class="toast-close"
          aria-label="Close notification"
          @click="closeCartToast"
        >
          ×
        </button>

      </div>

    </Transition>


    <!-- Edit Profile Modal -->
    <div
      v-if="showEditModal"
      class="modal-overlay"
      @click.self="closeEditModal"
    >

      <div class="edit-modal">

        <div class="modal-header">

          <div>
            <h2>
              Edit Profile
            </h2>

            <p>
              Update your personal information.
            </p>
          </div>

          <button
            type="button"
            class="close-button"
            @click="closeEditModal"
          >
            ×
          </button>

        </div>


        <!-- Avatar Edit -->
        <div class="avatar-editor">

          <div class="avatar-preview">

            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="Profile preview"
            />

            <div
              v-else
              class="empty-avatar"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                />

                <path
                  d="M5 20c.8-3.5 3.1-5.5 7-5.5s6.2 2 7 5.5"
                />
              </svg>
            </div>

          </div>

          <div class="avatar-actions">

            <label
              for="profileImage"
              class="upload-button"
            >
              {{ avatarPreview ? 'Change Photo' : 'Upload Photo' }}
            </label>

            <input
              id="profileImage"
              ref="fileInput"
              type="file"
              accept="image/*"
              class="file-input"
              @change="handleAvatarChange"
            />

            <button
              v-if="avatarPreview"
              type="button"
              class="remove-photo-button"
              @click="removeAvatar"
            >
              Remove Photo
            </button>

            <span>
              Optional
            </span>

          </div>

        </div>


        <!-- Form -->
        <form
          class="edit-form"
          @submit.prevent="saveProfile"
        >

          <div class="form-group">

            <label for="profileName">
              Full Name
            </label>

            <input
              id="profileName"
              v-model="fullName"
              type="text"
              required
            />

          </div>

          <div class="form-group">

            <label for="profileEmail">
              Email
            </label>

            <input
              id="profileEmail"
              v-model="email"
              type="email"
              required
            />

          </div>

          <div class="form-group">

            <label for="profilePhone">
              Phone
            </label>

            <input
              id="profilePhone"
              v-model="phone"
              type="tel"
            />

          </div>


          <div class="modal-actions">

            <button
              type="button"
              class="cancel-button"
              @click="closeEditModal"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="save-button"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>

          </div>

        </form>

      </div>

    </div>

  </div>
</template>

<style scoped>
.profile-page {
  min-height: calc(100vh - 72px);
  background-color: var(--color-beige);
  padding: var(--space-12) 0;
}

/* Profile Header */

.profile-header {
  background-color: var(--color-white);
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);
  padding: var(--space-6);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);

  margin-bottom: var(--space-8);
}

.profile-main {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.profile-avatar,
.avatar-preview {
  width: 100px;
  height: 100px;
  flex-shrink: 0;

  border-radius: 50%;
  overflow: hidden;

  background-color: var(--color-beige);
  border: 2px solid var(--color-pink-light);
}

.profile-avatar img,
.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-avatar {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-sand);
}

.empty-avatar svg {
  width: 48px;
  height: 48px;
}

.profile-info h1 {
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.profile-info p {
  color: var(--color-sand);
  font-size: 14px;
  margin-bottom: 4px;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.edit-button,
.logout-button {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-default);
  font-weight: 500;
}

.edit-button {
  border: 1px solid var(--color-primary);
  background-color: var(--color-white);
  color: var(--color-primary);
}

.edit-button:hover {
  background-color: var(--color-pink-light);
}

.logout-button {
  border: none;
  background-color: var(--color-primary);
  color: var(--color-white);
}

.logout-button:hover {
  background-color: var(--color-primary-hover);
}

/* Sections */

.profile-section {
  margin-bottom: var(--space-12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.section-header h2 {
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.section-header p {
  color: var(--color-sand);
  font-size: 14px;
}

.section-count {
  min-width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background-color: var(--color-pink-light);
  color: var(--color-primary);

  font-size: 14px;
  font-weight: 600;
}

/* Favorites */

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}

.favorite-card {
  background-color: var(--color-white);
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);

  overflow: hidden;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.favorite-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

.favorite-image-wrapper {
  height: 280px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.favorite-image {
  width: 100%;
  height: 100%;
  object-fit: cover;

  transition: transform 0.3s ease;
}

.favorite-card:hover .favorite-image {
  transform: scale(1.03);
}

.remove-favorite {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);

  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;

  background-color: var(--color-white);
  color: #c0435a;

  font-size: 18px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.favorite-content {
  padding: var(--space-4);
}

.favorite-content h3 {
  font-size: 15px;
  line-height: 1.4;
  margin-bottom: var(--space-2);
  color: var(--color-gray);
  overflow-wrap: anywhere;
}

.favorite-category {
  color: var(--color-sand);
  font-size: 12px;
  margin-bottom: var(--space-4);
  text-transform: capitalize;
}

.favorite-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.favorite-bottom strong {
  color: var(--color-primary);
  font-size: 15px;
}

.add-cart-button {
  border: none;
  border-radius: var(--radius-default);

  background-color: var(--color-primary);
  color: var(--color-white);

  padding: 8px 10px;

  font-size: 11px;
  font-weight: 500;
}

.add-cart-button:hover {
  background-color: var(--color-primary-hover);
}

/* Cart Toast */

.cart-toast {
  position: fixed;
  right: 24px;
  bottom: 24px;

  z-index: 2000;

  width: min(380px, calc(100vw - 32px));

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 14px 14px 14px 16px;

  background-color: var(--color-white);
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);

  box-shadow: 0 18px 45px rgba(27, 59, 54, 0.18);
}

.toast-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background-color: var(--color-primary);
  color: var(--color-white);
}

.toast-icon svg {
  width: 19px;
  height: 19px;
}

.toast-content {
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 3px;

  flex: 1;
}

.toast-content strong {
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
}

.toast-content span {
  color: var(--color-sand);
  font-size: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-close {
  width: 30px;
  height: 30px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;

  background-color: var(--color-beige);
  color: var(--color-primary);

  font-size: 20px;
  line-height: 1;
}

.toast-close:hover {
  background-color: var(--color-pink-light);
}

/* Toast Animation */

.cart-toast-enter-active,
.cart-toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.cart-toast-enter-from,
.cart-toast-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

/* Empty Section */

.empty-section {
  background-color: var(--color-white);
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);

  padding: var(--space-12) var(--space-6);

  text-align: center;
}

.empty-section-icon {
  font-size: 42px;
  margin-bottom: var(--space-4);
}

.empty-section h3 {
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.empty-section p {
  color: var(--color-sand);
  font-size: 14px;
  margin-bottom: var(--space-6);
}

.primary-button {
  border: none;
  border-radius: var(--radius-default);

  padding: var(--space-3) var(--space-6);

  background-color: var(--color-primary);
  color: var(--color-white);

  font-weight: 600;
}

.primary-button:hover {
  background-color: var(--color-primary-hover);
}

/* Orders */

.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.order-card {
  background-color: var(--color-white);
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);

  padding: var(--space-6);
}

.order-header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: var(--space-6);

  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-pink-light);
}

.order-label {
  color: var(--color-sand);
  font-size: 12px;
  margin-bottom: 4px;
}

.order-header h3 {
  color: var(--color-primary);
  font-size: 17px;
}

.order-date {
  color: var(--color-sand);
  font-size: 13px;
}

.order-status {
  padding: 7px 12px;

  border-radius: var(--radius-pill);

  background-color: #edf5f2;
  color: var(--color-primary);

  font-size: 12px;
  font-weight: 600;
}

/* Order Products */

.order-products {
  padding: var(--space-4) 0;

  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.order-product {
  display: grid;
  grid-template-columns: 70px 1fr auto;

  gap: var(--space-4);
  align-items: center;
}

.order-product img {
  width: 70px;
  height: 85px;

  object-fit: cover;
  border-radius: var(--radius-default);
}

.order-product-info h4 {
  color: var(--color-gray);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 6px;
}

.order-product-info p {
  color: var(--color-sand);
  font-size: 12px;
  margin-bottom: 3px;
}

.order-product > strong {
  color: var(--color-primary);
  font-size: 14px;
}

/* Order Footer */

.order-footer {
  display: flex;
  justify-content: space-between;
  gap: var(--space-6);

  padding-top: var(--space-4);

  border-top: 1px solid var(--color-pink-light);
}

.order-shipping {
  max-width: 70%;
}

.order-shipping p {
  color: var(--color-sand);
  font-size: 12px;
  line-height: 1.6;
  margin-bottom: 5px;
}

.order-shipping strong {
  color: var(--color-gray);
}

.order-total {
  text-align: right;
}

.order-total span {
  display: block;
  color: var(--color-sand);
  font-size: 12px;
  margin-bottom: 4px;
}

.order-total strong {
  color: var(--color-primary);
  font-size: 20px;
}

/* Modal */

.modal-overlay {
  position: fixed;
  inset: 0;

  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: var(--space-4);

  background-color: rgba(27, 59, 54, 0.45);
}

.edit-modal {
  width: 100%;
  max-width: 560px;
  max-height: 90vh;

  overflow-y: auto;

  background-color: var(--color-white);
  border-radius: var(--radius-lg);

  padding: var(--space-6);

  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  margin-bottom: var(--space-6);
}

.modal-header h2 {
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.modal-header p {
  color: var(--color-sand);
  font-size: 13px;
}

.close-button {
  width: 34px;
  height: 34px;

  border: none;
  border-radius: 50%;

  background-color: var(--color-beige);
  color: var(--color-primary);

  font-size: 24px;
  line-height: 1;
}

.close-button:hover {
  background-color: var(--color-pink-light);
}

/* Avatar Editor */

.avatar-editor {
  display: flex;
  align-items: center;
  gap: var(--space-6);

  padding: var(--space-4);

  margin-bottom: var(--space-6);

  background-color: var(--color-beige);
  border-radius: var(--radius-card);
}

.avatar-preview {
  width: 84px;
  height: 84px;
}

.avatar-preview .empty-avatar svg {
  width: 40px;
  height: 40px;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}

.upload-button {
  display: inline-block;

  padding: 9px 14px;

  border-radius: var(--radius-default);

  background-color: var(--color-primary);
  color: var(--color-white);

  font-size: 13px;
  font-weight: 500;

  cursor: pointer;
}

.upload-button:hover {
  background-color: var(--color-primary-hover);
}

.file-input {
  display: none;
}

.remove-photo-button {
  border: none;
  background: none;

  padding: 0;

  color: #c0435a;

  font-size: 12px;
}

.avatar-actions span {
  color: var(--color-sand);
  font-size: 11px;
}

/* Form */

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  color: var(--color-gray);
  font-size: 13px;
  font-weight: 500;
}

.form-group input {
  width: 100%;

  padding: var(--space-3);

  border: 1px solid var(--color-sand);
  border-radius: var(--radius-default);

  outline: none;

  color: var(--color-gray);
  background-color: var(--color-white);
}

.form-group input:focus {
  border-color: var(--color-primary);
}

/* Modal Actions */

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);

  margin-top: var(--space-4);
}

.cancel-button,
.save-button {
  padding: var(--space-3) var(--space-6);

  border-radius: var(--radius-default);

  font-weight: 500;
}

.cancel-button {
  border: 1px solid var(--color-primary);
  background-color: var(--color-white);
  color: var(--color-primary);
}

.cancel-button:hover {
  background-color: var(--color-pink-light);
}

.save-button {
  border: none;
  background-color: var(--color-primary);
  color: var(--color-white);
}

.save-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */

@media (max-width: 1000px) {
  .favorites-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .profile-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-actions {
    width: 100%;
  }

  .edit-button,
  .logout-button {
    flex: 1;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .order-header {
    grid-template-columns: 1fr auto;
  }

  .order-status {
    grid-column: 1 / -1;
    width: fit-content;
  }
}

@media (max-width: 560px) {
  .profile-page {
    padding: var(--space-8) 0;
  }

  .profile-header {
    padding: var(--space-4);
  }

  .profile-main {
    gap: var(--space-4);
  }

  .profile-avatar {
    width: 76px;
    height: 76px;
  }

  .profile-info h1 {
    font-size: 22px;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .favorite-image-wrapper {
    height: 320px;
  }

  .order-card {
    padding: var(--space-4);
  }

  .order-header {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .order-status {
    grid-column: auto;
  }

  .order-product {
    grid-template-columns: 60px 1fr;
  }

  .order-product img {
    width: 60px;
    height: 75px;
  }

  .order-product > strong {
    grid-column: 2;
  }

  .order-footer {
    flex-direction: column;
  }

  .order-shipping {
    max-width: 100%;
  }

  .order-total {
    text-align: left;
  }

  .avatar-editor {
    align-items: flex-start;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .save-button {
    width: 100%;
  }

  .cart-toast {
    right: 16px;
    bottom: 16px;
    width: calc(100vw - 32px);
  }
}</style>