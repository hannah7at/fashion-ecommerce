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

const showSuccessMessage = ref(false)
const successMessage = ref('')

let successTimer = null

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

const getProductText = (product) => {
  return [
    product?.name,
    product?.category,
    product?.description,
    product?.style,
    product?.color,
    product?.brand,
    product?.gender
  ]
    .filter(Boolean)
    .map(value => normalize(value))
    .join(' ')
}

/*
 * Strong gender matching.
 *
 * First we trust the gender field when it exists.
 * If gender is missing, we try to detect the gender
 * from the product text.
 *
 * IMPORTANT:
 * We use word boundaries so "women" does NOT match "men".
 */
const matchesGender = (product) => {
  const gender = normalize(product?.gender)

  // Explicit gender from dataset
  if (gender === 'women' || gender === 'female') {
    return selectedGender.value === 'women'
  }

  if (gender === 'men' || gender === 'male') {
    return selectedGender.value === 'men'
  }

  // Unisex products can be used for both
  if (gender === 'unisex') {
    return true
  }

  /*
   * If gender is missing or unknown,
   * inspect product text.
   */
  const productText = getProductText(product)

  const menPattern =
    /\bmen\b|\bmen's\b|\bmens\b|\bmale\b|\bman\b|\bmenswear\b/i

  const womenPattern =
    /\bwomen\b|\bwomen's\b|\bwomens\b|\bfemale\b|\bwoman\b|\bwomenswear\b/i

  const isMenProduct = menPattern.test(productText)
  const isWomenProduct = womenPattern.test(productText)

  if (selectedGender.value === 'women') {
    return !isMenProduct
  }

  if (selectedGender.value === 'men') {
    return !isWomenProduct
  }

  return false
}

/*
 * Convert the real product category into one of
 * the outfit categories we need.
 *
 * Bags, watches, jewelry and accessories are NEVER
 * considered as TOP, BOTTOM or SHOES.
 */
const getCategoryType = (product) => {
  const category = normalize(product.category)
  const text = getProductText(product)

  // ACCESSORIES / BAGS
  const accessoryWords = [
    'bag',
    'bags',
    'handbag',
    'backpack',
    'purse',
    'wallet',
    'watch',
    'jewelry',
    'jewellery',
    'necklace',
    'bracelet',
    'earring',
    'ring',
    'accessory',
    'accessories',
    'belt',
    'sunglasses',
    'scarf',
    'hat',
    'cap'
  ]

  if (accessoryWords.some(word => category.includes(word))) {
    return 'other'
  }

  // SUIT
  if (
    category.includes('suit') ||
    text.includes('formal suit') ||
    text.includes('business suit') ||
    text.includes('dinner suit') ||
    text.includes('tailored suit')
  ) {
    return 'suit'
  }

  // BLAZER
  if (
    category.includes('blazer') ||
    text.includes('blazer')
  ) {
    return 'blazer'
  }

  // TOP
  if (
    category.includes('shirt') ||
    category.includes('t-shirt') ||
    category.includes('tshirt') ||
    category.includes('blouse') ||
    category.includes('top') ||
    category.includes('camisole') ||
    category.includes('cami') ||
    category.includes('tank') ||
    category.includes('polo') ||
    category.includes('sweater') ||
    category.includes('cardigan')
  ) {
    return 'top'
  }

  // BOTTOM
  if (
    category.includes('jean') ||
    category.includes('pant') ||
    category.includes('trouser') ||
    category.includes('skirt') ||
    category.includes('short') ||
    category.includes('legging') ||
    category.includes('jogger') ||
    category.includes('track-pant')
  ) {
    return 'bottom'
  }

  // SHOES
  if (
    category.includes('shoe') ||
    category.includes('sneaker') ||
    category.includes('slipper') ||
    category.includes('heel') ||
    category.includes('sandal') ||
    category.includes('boot') ||
    category.includes('loafer') ||
    category.includes('flat')
  ) {
    return 'shoes'
  }

  // DRESS
  if (category.includes('dress')) {
    return 'dress'
  }

  // OUTERWEAR
  if (
    category.includes('jacket') ||
    category.includes('coat')
  ) {
    return 'outerwear'
  }

  return 'other'
}

const getAllowedStyles = () => {
  if (selectedStyle.value === 'formal') {
    return ['formal', 'elegant', 'classic']
  }

  if (selectedStyle.value === 'sporty') {
    return ['sporty', 'sports']
  }

  return ['casual']
}

const matchesStyle = (product) => {
  const style = normalize(product.style)

  return getAllowedStyles().includes(style)
}

const matchingProducts = computed(() => {
  return products.filter(product => {
    return (
      matchesGender(product) &&
      matchesStyle(product)
    )
  })
})

/*
 * Give priority to products that make more sense
 * for the selected style.
 */
const getProductPriority = (product, type) => {
  const text = getProductText(product)

  if (selectedStyle.value === 'formal') {
    if (selectedGender.value === 'men') {
      if (
        type === 'suit' ||
        text.includes('formal suit') ||
        text.includes('business suit')
      ) {
        return 1
      }

      if (
        type === 'blazer' ||
        text.includes('blazer') ||
        text.includes('formal jacket')
      ) {
        return 2
      }

      if (
        type === 'bottom' &&
        (
          text.includes('trouser') ||
          text.includes('formal pant') ||
          text.includes('dress pant')
        )
      ) {
        return 3
      }

      if (
        type === 'shoes' &&
        (
          text.includes('formal shoe') ||
          text.includes('dress shoe') ||
          text.includes('loafer') ||
          text.includes('oxford')
        )
      ) {
        return 4
      }
    }

    if (selectedGender.value === 'women') {
      if (
        type === 'blazer' ||
        text.includes('blazer')
      ) {
        return 1
      }

      if (
        type === 'top' &&
        (
          text.includes('blouse') ||
          text.includes('formal') ||
          text.includes('dressy')
        )
      ) {
        return 2
      }

      if (type === 'bottom') {
        if (
          text.includes('leather') ||
          text.includes('faux leather') ||
          text.includes('vegan leather')
        ) {
          return 3
        }

        if (
          text.includes('jean') ||
          text.includes('denim')
        ) {
          return 4
        }

        if (
          text.includes('trouser') ||
          text.includes('pant')
        ) {
          return 5
        }
      }

      if (
        type === 'shoes' &&
        (
          text.includes('heel') ||
          text.includes('formal shoe') ||
          text.includes('dress shoe') ||
          text.includes('loafer') ||
          text.includes('flat')
        )
      ) {
        return 6
      }
    }
  }

  if (selectedStyle.value === 'sporty') {
    if (type === 'top') {
      if (
        text.includes('sport') ||
        text.includes('active') ||
        text.includes('athletic') ||
        text.includes('tank')
      ) {
        return 1
      }

      return 5
    }

    if (type === 'bottom') {
      if (
        text.includes('jogger') ||
        text.includes('legging') ||
        text.includes('track')
      ) {
        return 1
      }

      return 5
    }

    if (type === 'shoes') {
      if (
        text.includes('sneaker') ||
        text.includes('sport')
      ) {
        return 1
      }

      return 5
    }
  }

  if (selectedStyle.value === 'casual') {
    if (type === 'top') {
      if (
        text.includes('casual') ||
        text.includes('t-shirt') ||
        text.includes('shirt')
      ) {
        return 1
      }
    }

    if (type === 'bottom') {
      if (
        text.includes('jean') ||
        text.includes('denim') ||
        text.includes('casual')
      ) {
        return 1
      }
    }

    if (type === 'shoes') {
      if (
        text.includes('sneaker') ||
        text.includes('casual')
      ) {
        return 1
      }
    }
  }

  return 50
}

/*
 * Find ONLY the requested outfit type.
 */
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

  const sortedProducts = [...available].sort((a, b) => {
    const priorityA = getProductPriority(a, type)
    const priorityB = getProductPriority(b, type)

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    return Number(a.id || 0) - Number(b.id || 0)
  })

  const exactStyleProducts = sortedProducts.filter(product => {
    return normalize(product.style) === selectedStyle.value
  })

  const candidates =
    exactStyleProducts.length > 0
      ? exactStyleProducts
      : sortedProducts

  const index =
    outfitVersion.value % candidates.length

  return candidates[index]
}

/*
 * SPECIAL CASE:
 * Women + Formal
 *
 * We want the bottom to look stylish and modern:
 * 1. Leather / Faux Leather
 * 2. Jeans / Denim
 * 3. Stylish pants
 * 4. Normal formal bottom as fallback
 */
const findWomenFormalBottom = (usedIds) => {
  const womenProducts = products.filter(product => {
    return (
      matchesGender(product) &&
      !usedIds.includes(product.id) &&
      getCategoryType(product) === 'bottom'
    )
  })

  if (!womenProducts.length) {
    return null
  }

  const leatherPants = womenProducts.filter(product => {
    const text = getProductText(product)

    return (
      text.includes('leather') ||
      text.includes('faux leather') ||
      text.includes('vegan leather')
    )
  })

  if (leatherPants.length) {
    return leatherPants[
      outfitVersion.value % leatherPants.length
    ]
  }

  const jeans = womenProducts.filter(product => {
    const text = getProductText(product)

    return (
      text.includes('jean') ||
      text.includes('denim')
    )
  })

  if (jeans.length) {
    return jeans[
      outfitVersion.value % jeans.length
    ]
  }

  const stylishPants = womenProducts.filter(product => {
    const text = getProductText(product)

    return (
      text.includes('pant') ||
      text.includes('trouser') ||
      text.includes('wide leg') ||
      text.includes('straight leg') ||
      text.includes('tailored')
    )
  })

  if (stylishPants.length) {
    return stylishPants[
      outfitVersion.value % stylishPants.length
    ]
  }

  return findProduct('bottom', usedIds)
}

/*
 * Build the outfit.
 *
 * Men Formal:
 *   SUIT + SHOES
 *
 * Women Formal:
 *   BLAZER + BOTTOM + SHOES
 *
 * Casual / Sporty:
 *   TOP + BOTTOM + SHOES
 */
const outfitItems = computed(() => {
  const usedIds = []

  /*
   * MEN FORMAL
   */
  if (
    selectedGender.value === 'men' &&
    selectedStyle.value === 'formal'
  ) {
    const suit = findProduct('suit', usedIds)

    if (suit) {
      usedIds.push(suit.id)
    }

    const shoes = findProduct('shoes', usedIds)

    if (shoes) {
      usedIds.push(shoes.id)
    }

    return [
      {
        type: 'suit',
        label: 'SUIT',
        product: suit
      },
      {
        type: 'shoes',
        label: 'SHOES',
        product: shoes
      }
    ]
  }

  /*
   * WOMEN FORMAL
   */
  if (
    selectedGender.value === 'women' &&
    selectedStyle.value === 'formal'
  ) {
    const blazer = findProduct('blazer', usedIds)

    if (blazer) {
      usedIds.push(blazer.id)
    }

    const bottom = findWomenFormalBottom(usedIds)

    if (bottom) {
      usedIds.push(bottom.id)
    }

    const shoes = findProduct('shoes', usedIds)

    if (shoes) {
      usedIds.push(shoes.id)
    }

    return [
      {
        type: 'blazer',
        label: 'BLAZER',
        product: blazer
      },
      {
        type: 'bottom',
        label: 'BOTTOM',
        product: bottom
      },
      {
        type: 'shoes',
        label: 'SHOES',
        product: shoes
      }
    ]
  }

  /*
   * CASUAL / SPORTY
   */
  const top = findProduct('top', usedIds)

  if (top) {
    usedIds.push(top.id)
  }

  const bottom = findProduct('bottom', usedIds)

  if (bottom) {
    usedIds.push(bottom.id)
  }

  const shoes = findProduct('shoes', usedIds)

  if (shoes) {
    usedIds.push(shoes.id)
  }

  return [
    {
      type: 'top',
      label: 'TOP',
      product: top
    },
    {
      type: 'bottom',
      label: 'BOTTOM',
      product: bottom
    },
    {
      type: 'shoes',
      label: 'SHOES',
      product: shoes
    }
  ]
})

const outfitProducts = computed(() => {
  return outfitItems.value
    .filter(item => item.product)
    .map(item => item.product)
})

const hasCompleteOutfit = computed(() => {
  return outfitItems.value.every(item => item.product)
})

const totalPrice = computed(() => {
  return outfitProducts.value.reduce((total, product) => {
    return total + Number(product.price || 0)
  }, 0)
})

const showSuccess = (message) => {
  successMessage.value = message
  showSuccessMessage.value = true

  if (successTimer) {
    clearTimeout(successTimer)
  }

  successTimer = setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

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

const handleCardAddToCart = (product) => {
  showSuccess(
    `${product?.name || 'Product'} added to your cart.`
  )
}

const addFullOutfit = () => {
  if (!hasCompleteOutfit.value) {
    showSuccess(
      'A complete outfit is not available for this selection.'
    )

    return
  }

  outfitProducts.value.forEach(product => {
    cartStore.addToCart(product)
  })

  showSuccess(
    'Complete outfit added to your cart.'
  )
}

const openProduct = (product) => {
  if (!product?.id) {
    return
  }

  router.push(`/product/${product.id}`)
}
</script>

<template>
  <div class="outfit-page">

    <!-- Success Message -->
    <Transition name="toast">
      <div
        v-if="showSuccessMessage"
        class="success-toast"
        role="status"
      >
        <span class="toast-icon">✓</span>

        <span class="toast-text">
          {{ successMessage }}
        </span>
      </div>
    </Transition>

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
            <span class="result-label">
              YOUR SUGGESTION
            </span>

            <h2>
              {{
                selectedStyle.charAt(0).toUpperCase() +
                selectedStyle.slice(1)
              }}
              Look
            </h2>

            <p>
              Here's a complete outfit selected for you.
            </p>
          </div>

          <button
            v-if="hasCompleteOutfit"
            type="button"
            class="change-button"
            @click="changeOutfit"
          >
            ↻ Change Outfit
          </button>

        </div>

        <!-- Complete Outfit -->
        <div
          v-if="hasCompleteOutfit"
          class="outfit-content"
        >

          <div class="products-grid">

            <div
              v-for="item in outfitItems"
              :key="item.type"
              class="outfit-item"
            >

              <div class="item-label">
                {{ item.label }}
              </div>

              <ProductCard
                :product="item.product"
                @view-product="openProduct"
                @add-to-cart="handleCardAddToCart"
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

        <!-- No Complete Outfit -->
        <div
          v-else
          class="empty-result"
        >

          <div class="empty-icon">✦</div>

          <h3>
            No complete outfit available
          </h3>

          <p>
            We couldn't find a complete
            TOP + BOTTOM + SHOES combination
            for this collection and style.
            Try another style or collection.
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

/* =========================
   SUCCESS TOAST
   ========================= */

.success-toast {
  position: fixed;
  top: 90px;
  right: 28px;
  z-index: 9999;

  min-width: 300px;
  max-width: 420px;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 15px 18px;

  background-color: var(--color-white);
  border: 1px solid var(--color-pink-light);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-card);

  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);

  color: var(--color-primary);
}

.toast-icon {
  width: 27px;
  height: 27px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);

  font-size: 14px;
  font-weight: 700;
}

.toast-text {
  font-size: 13px;
  line-height: 1.5;
  font-weight: 500;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* =========================
   HEADER
   ========================= */

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

/* =========================
   SELECTION
   ========================= */

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

/* =========================
   GENDER
   ========================= */

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

/* =========================
   STYLE
   ========================= */

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

/* =========================
   RESULT
   ========================= */

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

/* =========================
   PRODUCTS
   ========================= */

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

/* =========================
   FOOTER
   ========================= */

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

/* =========================
   EMPTY
   ========================= */

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
  max-width: 500px;

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

/* =========================
   RESPONSIVE
   ========================= */

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

  .success-toast {
    top: 75px;
    right: 15px;
    left: 15px;
    min-width: 0;
    max-width: none;
  }
}
</style>
