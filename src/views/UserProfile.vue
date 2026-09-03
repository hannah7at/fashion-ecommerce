<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import BaseButton from '../components/common/Button.vue'
import Loading from '../components/common/Loading.vue'
import Modal from '../components/common/Modal.vue'
import ProductCard from '../components/ProductCard.vue'
import productsData from '../data/products.json'

// Stores
const authStore = useAuthStore()
const cartStore = useCartStore()

const isPageLoading = ref(false)
const isSaving = ref(false)
const isEditModalOpen = ref(false)

// استدعاء بيانات المستخدم مباشرة من الـ Auth Store
const user = computed(() => {
  if (authStore.user) {
    return {
      fullName: authStore.user.fullName || 'User',
      email: authStore.user.email || '',
      avatar: 'https://i.pravatar.cc/160?img=47'
    }
  }
  return {
    fullName: 'Guest User',
    email: 'guest@example.com',
    avatar: 'https://i.pravatar.cc/160?img=47'
  }
})

const editForm = reactive({
  fullName: user.value.fullName,
  email: user.value.email
})

function openEditModal() {
  editForm.fullName = user.value.fullName
  editForm.email = user.value.email
  isEditModalOpen.value = true
}

function saveProfile() {
  if (!editForm.fullName.trim() || !editForm.email.trim()) {
    return
  }

  isSaving.value = true

  // تحديث بيانات المستخدم في الـ Auth Store مباشرة
  setTimeout(() => {
    if (authStore.user) {
      authStore.user.fullName = editForm.fullName.trim()
      authStore.user.email = editForm.email.trim()
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }

    isSaving.value = false
    isEditModalOpen.value = false
  }, 600)
}

// Mock order history
const orders = ref([
  {
    id: 'ORD-1042',
    date: '2026-08-12',
    status: 'Delivered',
    total: 620,
    itemsCount: 2
  },
  {
    id: 'ORD-1038',
    date: '2026-07-29',
    status: 'Delivered',
    total: 350,
    itemsCount: 1
  },
  {
    id: 'ORD-1021',
    date: '2026-06-15',
    status: 'Cancelled',
    total: 480,
    itemsCount: 1
  }
])

function statusClass(status) {
  return `order-status order-status--${status.toLowerCase()}`
}

// Mock favorites, pulled from shared products
const favoriteIds = ref([2, 7, 13])

const favoriteProducts = computed(() =>
  productsData.products.filter((product) =>
    favoriteIds.value.includes(product.id)
  )
)

function toggleFavorite(product) {
  const index = favoriteIds.value.indexOf(product.id)

  if (index === -1) {
    favoriteIds.value.push(product.id)
  } else {
    favoriteIds.value.splice(index, 1)
  }
}

// ربط حقيقي بـ Cart Store
function addToCart(product) {
  cartStore.addToCart(product)
}
</script>

<template>
  <Loading
    v-if="isPageLoading"
    full-page
    text="Loading profile..."
  />

  <div v-else class="profile-page">
    <!-- Profile header -->
    <section class="profile-header">
      <img
        :src="user.avatar"
        :alt="user.fullName"
        class="profile-header__avatar"
      />

      <div class="profile-header__info">
        <h1 class="profile-header__name">
          {{ user.fullName }}
        </h1>

        <p class="profile-header__email">
          {{ user.email }}
        </p>
      </div>

      <BaseButton
        variant="outline"
        size="md"
        @click="openEditModal"
      >
        Edit Profile
      </BaseButton>
    </section>

    <!-- Order history -->
    <section class="profile-section">
      <h2 class="profile-section__title">
        Order History
      </h2>

      <div v-if="orders.length" class="orders-list">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-row"
        >
          <div class="order-row__main">
            <span class="order-row__id">
              {{ order.id }}
            </span>

            <span class="order-row__date">
              {{ order.date }}
            </span>
          </div>

          <span class="order-row__items">
            {{ order.itemsCount }} item(s)
          </span>

          <span :class="statusClass(order.status)">
            {{ order.status }}
          </span>

          <span class="order-row__total">
            {{ order.total }} USD
          </span>
        </div>
      </div>

      <p
        v-else
        class="profile-section__empty"
      >
        No orders yet.
      </p>
    </section>

    <!-- Favorites / wishlist -->
    <section class="profile-section">
      <h2 class="profile-section__title">
        Favorites
      </h2>

      <div
        v-if="favoriteProducts.length"
        class="favorites-grid"
      >
        <ProductCard
          v-for="product in favoriteProducts"
          :key="product.id"
          :product="product"
          :is-favorite="favoriteIds.includes(product.id)"
          @toggle-favorite="toggleFavorite"
          @add-to-cart="addToCart"
        />
      </div>

      <p
        v-else
        class="profile-section__empty"
      >
        You haven't added any favorites yet.
      </p>
    </section>

    <!-- Edit profile modal -->
    <Modal
      v-model="isEditModalOpen"
      title="Edit Profile"
    >
      <form
        class="edit-form"
        @submit.prevent="saveProfile"
      >
        <label class="edit-form__field">
          <span>Full name</span>

          <input
            v-model="editForm.fullName"
            type="text"
            required
            autocomplete="name"
          />
        </label>

        <label class="edit-form__field">
          <span>Email</span>

          <input
            v-model="editForm.email"
            type="email"
            required
            autocomplete="email"
          />
        </label>

        <div class="edit-form__actions">
          <BaseButton
            variant="outline"
            size="md"
            type="button"
            :disabled="isSaving"
            @click="isEditModalOpen = false"
          >
            Cancel
          </BaseButton>

          <BaseButton
            variant="primary"
            size="md"
            type="submit"
            :loading="isSaving"
          >
            Save Changes
          </BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.profile-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) var(--space-16);
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  background-color: var(--color-beige);
  font-family: var(--font-family-base);
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: 0 4px 16px rgba(27, 59, 54, 0.06);
}

.profile-header__avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 3px solid var(--color-pink-light);
}

.profile-header__info {
  flex: 1;
  min-width: 0;
}

.profile-header__name {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gray);
  margin: 0 0 var(--space-1);
}

.profile-header__email {
  font-size: 14px;
  color: var(--color-sand);
  margin: 0;
  overflow-wrap: anywhere;
}

/* Sections */
.profile-section__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gray);
  margin: 0 0 var(--space-4);
}

.profile-section__empty {
  font-size: 14px;
  color: var(--color-sand);
}

/* Orders */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.order-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: var(--space-4);
  background-color: var(--color-white);
  border-radius: var(--radius-default);
  padding: var(--space-4);
  box-shadow: 0 2px 8px rgba(27, 59, 54, 0.05);
}

.order-row__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-row__id {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray);
}

.order-row__date {
  font-size: 12px;
  color: var(--color-sand);
}

.order-row__items {
  font-size: 14px;
  color: var(--color-gray);
}

.order-row__total {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.order-status {
  font-size: 12px;
  font-weight: 500;
  padding: 4px var(--space-3);
  border-radius: var(--radius-pill);
  text-align: center;
  width: fit-content;
}

.order-status--delivered {
  background-color: #e3f0e8;
  color: #1f7a45;
}

.order-status--cancelled {
  background-color: #fbe6e6;
  color: #c0435a;
}

.order-status--pending {
  background-color: var(--color-pink-light);
  color: var(--color-primary);
}

/* Favorites grid */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

/* Edit form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.edit-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: 14px;
  color: var(--color-gray);
}

.edit-form__field input {
  font-family: var(--font-family-base);
  font-size: 15px;
  padding: var(--space-3);
  border: 1.5px solid var(--color-pink-light);
  border-radius: var(--radius-default);
  color: var(--color-gray);
  outline: none;
  transition: border-color 0.2s ease;
}

.edit-form__field input:focus {
  border-color: var(--color-primary);
}

.edit-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

/* Responsive */
@media (max-width: 1024px) {
  .favorites-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .order-row {
    grid-template-columns: 1fr auto;
    row-gap: var(--space-2);
  }

  .order-row__total {
    text-align: right;
  }
}

@media (max-width: 560px) {
  .profile-header {
    flex-wrap: wrap;
    text-align: center;
    justify-content: center;
  }

  .profile-header__info {
    width: 100%;
    order: 1;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }

  .edit-form__actions {
    flex-direction: column;
  }
}
</style>