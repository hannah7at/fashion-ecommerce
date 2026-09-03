<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import productsData from '../data/products.json'
import ProductCard from '../components/ProductCard.vue'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const products = Array.isArray(productsData)
  ? productsData
  : productsData.products || []

const selectedGender = ref('women')
const selectedStyle = ref('casual')
const outfitVersion = ref(0)

const styles = [
  {
    name: 'Casual',
    value: 'casual',
    description: 'Relaxed and effortless for everyday looks.'
  },
  {
    name: 'Formal',
    value: 'formal',
    description: 'Elegant pieces for a polished appearance.'
  },
  {
    name: 'Sporty',
    value: 'sporty',
    description: 'Comfortable pieces for an active lifestyle.'
  }
]

const normalize = (value) => {
  return String(value || '').toLowerCase().trim()
}

const getCategoryType = (product) => {
  const category = normalize(product.category)

  if (
    category.includes('shirt') ||
    category.includes('t-shirt') ||
    category.includes('tshirt') ||
    category.includes('top')
  ) {
    return 'top'
  }

  if (
    category.includes('jean') ||
    category.includes('pant') ||
    category.includes('trouser') ||
    category.includes('skirt')
  ) {
    return 'bottom'
  }

  if (
    category.includes('shoe') ||
    category.includes('sneaker') ||
    category.includes('slipper')
  ) {
    return 'shoes'
  }

  if (category.includes('dress')) {
    return 'dress'
  }

  if (
    category.includes('jacket') ||
    category.includes('coat')
  ) {
    return 'outerwear'
  }

  return 'other'
}

const matchesGender = (product) => {
  const gender = normalize(product.gender)

  return gender === selectedGender.value || gender === 'unisex'
}

const matchesStyle = (product) => {
  const style = normalize(product.style)

  return style === selectedStyle.value
}

const matchingProducts = computed(() => {
  return products.filter(product => {
    return matchesGender(product) && matchesStyle(product)
  })
})

const findProduct = (type, usedIds) => {
  const available = matchingProducts.value.filter(product => {
    return (
      getCategoryType(product) === type &&
      !usedIds.includes(product.id)
    )
  })

  if (!available.length) {
    return null
  }

  const index = outfitVersion.value % available.length

  return available[index]
}

const outfitProducts = computed(() => {
  const usedIds = []
  const result = []

  const addProduct = (type) => {
    const product = findProduct(type, usedIds)

    if (product) {
      result.push(product)
      usedIds.push(product.id)
    }
  }

  /*
   * Build a complete outfit:
   * Top + Bottom + Shoes
   */
  addProduct('top')
  addProduct('bottom')
  addProduct('shoes')

  /*
   * If one of the main categories is missing,
   * complete the outfit with another suitable item.
   */
  if (result.length < 3) {
    const extraProducts = matchingProducts.value.filter(product => {
      return !usedIds.includes(product.id)
    })

    for (const product of extraProducts) {
      if (result.length >= 3) {
        break
      }

      result.push(product)
      usedIds.push(product.id)
    }
  }

  return result
})

const totalPrice = computed(() => {
  return outfitProducts.value.reduce((total, product) => {
    return total + Number(product.price || 0)
  }, 0)
})

const changeOutfit = () => {
  outfitVersion.value += 1
}

const selectGender = (gender) => {
  selectedGender.value = gender
  outfitVersion.value = 0
}

const selectStyle = (style) => {
  selectedStyle.value = style
  outfitVersion.value = 0
}

const addFullOutfit = () => {
  outfitProducts.value.forEach(product => {
    cartStore.addToCart(product)
  })

  router.push('/cart')
}

const openProduct = (product) => {
  router.push(`/product/${product.id}`)
}
</script>

<template>
  <div class="outfit-page">

    <!-- Header -->
    <section class="outfit-header">
      <div class="container">
        <div class="header-content">
          <span class="eyebrow">LUMORA STYLE</span>

          <h1>Outfit Suggest</h1>

          <p>
            Build a complete look in seconds.
            Choose your collection and style, and we'll
            suggest an outfit for you.
          </p>
        </div>
      </div>
    </section>

    <main class="container">

      <!-- Step 1 -->
      <section class="selection-section">

        <div class="step-title">
          <span class="step-number">01</span>

          <div>
            <h2>Choose Collection</h2>
            <p>Who are you shopping for?</p>
          </div>
        </div>

        <div class="gender-selector">

          <button
            type="button"
            class="gender-option"
            :class="{ active: selectedGender === 'women' }"
            @click="selectGender('women')"
          >
            <span>Women</span>
            <small>Women's collection</small>
          </button>

          <button
            type="button"
            class="gender-option"
            :class="{ active: selectedGender === 'men' }"
            @click="selectGender('men')"
          >
            <span>Men</span>
            <small>Men's collection</small>
          </button>

        </div>

      </section>

      <!-- Step 2 -->
      <section class="selection-section">

        <div class="step-title">
          <span class="step-number">02</span>

          <div>
            <h2>Choose Your Style</h2>
            <p>Select the vibe you're looking for.</p>
          </div>
        </div>

        <div class="style-selector">

          <button
            v-for="style in styles"
            :key="style.value"
            type="button"
            class="style-option"
            :class="{ active: selectedStyle === style.value }"
            @click="selectStyle(style.value)"
          >
            <strong>{{ style.name }}</strong>

            <span>
              {{ style.description }}
            </span>
          </button>

        </div>

      </section>

      <!-- Suggested Outfit -->
      <section class="outfit-result">

        <div class="result-header">

          <div>
            <span class="result-label">YOUR SUGGESTION</span>

            <h2>
              {{ selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1) }}
              Look
            </h2>

            <p>
              Here's a complete outfit selected for you.
            </p>
          </div>

          <button
            v-if="outfitProducts.length > 0"
            type="button"
            class="change-button"
            @click="changeOutfit"
          >
            ↻ Change Outfit
          </button>

        </div>

        <!-- Outfit -->
        <div
          v-if="outfitProducts.length > 0"
          class="outfit-content"
        >

          <div class="products-grid">

            <div
              v-for="(product, index) in outfitProducts"
              :key="product.id"
              class="outfit-item"
            >

              <div class="item-label">
                {{ index === 0 ? 'TOP' : index === 1 ? 'BOTTOM' : 'SHOES' }}
              </div>

              <ProductCard
                :product="product"
                @click="openProduct(product)"
              />

            </div>

          </div>

          <div class="outfit-footer">

            <div class="price-area">
              <span>Complete Outfit</span>

              <strong>
                ${{ totalPrice.toFixed(2) }}
              </strong>
            </div>

            <button
              type="button"
              class="add-outfit-button"
              @click="addFullOutfit"
            >
              Add Full Outfit to Cart
            </button>

          </div>

        </div>

        <!-- No products -->
        <div
          v-else
          class="empty-result"
        >
          <div class="empty-icon">✦</div>

          <h3>
            No complete outfit available
          </h3>

          <p>
            We couldn't find enough products for this
            combination. Try another style or collection.
          </p>

          <button
            type="button"
            class="browse-button"
            @click="router.push('/products')"
          >
            Browse Products
          </button>
        </div>

      </section>

    </main>
  </div>
</template>

<style scoped>
.outfit-page {
  min-height: 100vh;
  background-color: var(--color-beige);
  padding-bottom: 80px;
}

/* Header */

.outfit-header {
  background-color: var(--color-primary);
  padding: 65px 0;
  margin-bottom: 55px;
}

.header-content {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.eyebrow {
  display: inline-block;
  color: var(--color-sand);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.header-content h1 {
  color: var(--color-white);
  font-size: 44px;
  margin-bottom: 14px;
}

.header-content p {
  max-width: 600px;
  margin: 0 auto;
  color: #e8e8e8;
  font-size: 15px;
  line-height: 1.7;
}

/* Selection */

.selection-section {
  margin-bottom: 48px;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.step-number {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step-title h2 {
  color: var(--color-primary);
  font-size: 22px;
  margin-bottom: 3px;
}

.step-title p {
  color: #777777;
  font-size: 13px;
}

/* Gender */

.gender-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 650px;
}

.gender-option {
  min-height: 82px;
  padding: 18px 22px;
  text-align: left;
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: all 0.2s ease;
}

.gender-option span {
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 600;
}

.gender-option small {
  color: #888888;
  font-size: 12px;
}

.gender-option:hover {
  border-color: var(--color-sand);
}

.gender-option.active {
  border: 2px solid var(--color-primary);
  background-color: #faf6f3;
}

/* Style */

.style-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.style-option {
  min-height: 115px;
  padding: 20px;
  text-align: left;
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  transition: all 0.2s ease;
}

.style-option strong {
  display: block;
  color: var(--color-primary);
  font-size: 16px;
  margin-bottom: 8px;
}

.style-option span {
  display: block;
  color: #777777;
  font-size: 12px;
  line-height: 1.6;
}

.style-option:hover {
  border-color: var(--color-sand);
  transform: translateY(-2px);
}

.style-option.active {
  border: 2px solid var(--color-primary);
  background-color: #faf6f3;
}

/* Result */

.outfit-result {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  padding: 36px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 32px;
}

.result-label {
  display: inline-block;
  color: var(--color-sand);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 7px;
}

.result-header h2 {
  color: var(--color-primary);
  font-size: 28px;
  margin-bottom: 5px;
}

.result-header p {
  color: #777777;
  font-size: 13px;
}

.change-button {
  padding: 10px 16px;
  border: 1px solid var(--color-pink-light);
  border-radius: var(--radius-default);
  background-color: var(--color-white);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.change-button:hover {
  background-color: var(--color-beige);
  border-color: var(--color-sand);
}

/* Products */

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.outfit-item {
  position: relative;
}

.item-label {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 5px 10px;
  border-radius: var(--radius-pill);
  background-color: var(--color-beige);
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
}

/* Footer */

.outfit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 32px;
  padding-top: 25px;
  border-top: 1px solid #eeeeee;
}

.price-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-area span {
  color: #777777;
  font-size: 12px;
}

.price-area strong {
  color: var(--color-primary);
  font-size: 25px;
}

.add-outfit-button {
  border: none;
  border-radius: var(--radius-default);
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: 13px 24px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.add-outfit-button:hover {
  background-color: var(--color-primary-hover);
}

/* Empty */

.empty-result {
  text-align: center;
  padding: 55px 20px;
  border: 1px dashed var(--color-pink-light);
  border-radius: var(--radius-card);
  background-color: var(--color-beige);
}

.empty-icon {
  color: var(--color-primary);
  font-size: 35px;
  margin-bottom: 12px;
}

.empty-result h3 {
  color: var(--color-primary);
  font-size: 20px;
  margin-bottom: 8px;
}

.empty-result p {
  max-width: 450px;
  margin: 0 auto 20px;
  color: #777777;
  font-size: 13px;
  line-height: 1.6;
}

.browse-button {
  border: none;
  border-radius: var(--radius-default);
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: 12px 22px;
  font-weight: 500;
}

.browse-button:hover {
  background-color: var(--color-primary-hover);
}

/* Responsive */

@media (max-width: 850px) {
  .style-selector {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .outfit-page {
    padding-bottom: 50px;
  }

  .outfit-header {
    padding: 50px 0;
    margin-bottom: 40px;
  }

  .header-content h1 {
    font-size: 34px;
  }

  .gender-selector {
    grid-template-columns: 1fr;
  }

  .outfit-result {
    padding: 22px 16px;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .outfit-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .add-outfit-button {
    width: 100%;
  }
}
</style>