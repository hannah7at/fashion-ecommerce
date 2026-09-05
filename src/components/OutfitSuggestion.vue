<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import ProductCard from './ProductCard.vue'
import useOutfitEngine from './useOutfitEngine.js'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'add-to-cart',
  'toggle-favorite'
])

/* ================================
   STATE
================================ */

const showDetails = ref(true)

const favorites = ref([])

const addingProductId =
  ref(null)

const lookNumber = ref(0)

const excludedIds = ref([])

/*
 * Products that the user wants
 * to keep when generating another look.
 */
const lockedIds = ref([])

/* ================================
   RECOMMENDATIONS
================================ */

const recommendations =
  computed(() => {
    if (!props.product) {
      return []
    }

    const result =
      useOutfitEngine(
        props.product,
        excludedIds.value,
        lookNumber.value,
        lockedIds.value
      )

    return Object.values(
      result.outfit
    )
  })

/* ================================
   COUNT
================================ */

const recommendationCount =
  computed(() => {
    return recommendations.value.length
  })

/* ================================
   LOCKED COUNT
================================ */

const lockedCount =
  computed(() => {
    return recommendations.value.filter(
      (product) =>
        lockedIds.value.includes(
          product.id
        )
    ).length
  })

/* ================================
   ALL LOCKED
================================ */

const allRecommendationsLocked =
  computed(() => {
    return (
      recommendationCount.value >
        0 &&
      lockedCount.value ===
        recommendationCount.value
    )
  })

/* ================================
   FAVORITE
================================ */

const isFavorite = (
  product
) => {
  return favorites.value.includes(
    product.id
  )
}

function toggleFavorite(
  product
) {
  if (
    favorites.value.includes(
      product.id
    )
  ) {
    favorites.value =
      favorites.value.filter(
        (id) =>
          id !== product.id
      )
  } else {
    favorites.value.push(
      product.id
    )
  }

  emit(
    'toggle-favorite',
    product
  )
}

/* ================================
   ADD TO CART
================================ */

function addToCart(
  product
) {
  addingProductId.value =
    product.id

  emit(
    'add-to-cart',
    product
  )

  setTimeout(() => {
    addingProductId.value =
      null
  }, 700)
}

/* ================================
   LOCK / UNLOCK
================================ */

const isLocked = (
  product
) => {
  return lockedIds.value.includes(
    product.id
  )
}

function toggleLock(
  product
) {
  if (
    lockedIds.value.includes(
      product.id
    )
  ) {
    lockedIds.value =
      lockedIds.value.filter(
        (id) =>
          id !== product.id
      )

    return
  }

  lockedIds.value.push(
    product.id
  )
}

/* ================================
   ADD COMPLETE LOOK
================================ */

function addCompleteLook() {
  if (!props.product) {
    return
  }

  /*
   * Add the selected base product.
   */
  emit(
    'add-to-cart',
    props.product
  )

  /*
   * Add every recommended
   * piece in the current look.
   */
  recommendations.value.forEach(
    (product) => {
      emit(
        'add-to-cart',
        product
      )
    }
  )
}

/* ================================
   ANOTHER LOOK
================================ */

function showAnotherLook() {
  /*
   * Don't generate another look
   * when everything is locked.
   */
  if (
    allRecommendationsLocked.value
  ) {
    return
  }

  /*
   * Exclude ONLY unlocked products.
   *
   * Locked products stay available
   * and the engine will keep them.
   */
  recommendations.value.forEach(
    (product) => {
      if (
        !lockedIds.value.includes(
          product.id
        ) &&
        !excludedIds.value.includes(
          product.id
        )
      ) {
        excludedIds.value.push(
          product.id
        )
      }
    }
  )

  /*
   * Increase variation.
   */
  lookNumber.value++

  /*
   * If there are no more products,
   * start over.
   *
   * Keep locked products.
   */
  if (lookNumber.value > 10) {
    lookNumber.value = 0

    /*
     * Keep only locked IDs
     * in the exclusion list.
     */
    excludedIds.value =
      excludedIds.value.filter(
        (id) =>
          lockedIds.value.includes(
            id
          )
      )
  }
}

/* ================================
   RESET WHEN BASE PRODUCT CHANGES
================================ */

watch(
  () => props.product?.id,
  () => {
    lookNumber.value = 0
    excludedIds.value = []
    lockedIds.value = []
  }
)
</script>

<template>
  <section
    v-if="props.product"
    class="stylist-section"
  >
    <div class="stylist-container">

      <!-- HEADER -->
      <header class="stylist-heading">
        <div class="heading-decoration">
          <span></span>
          <i>✦</i>
          <span></span>
        </div>

        <span class="eyebrow">
          PERSONAL STYLIST
        </span>

        <h2>
          Complete
          <em>the Look</em>
        </h2>

        <p>
          Discover carefully selected pieces
          that complement your style and
          complete your outfit.
        </p>
      </header>

      <!-- SELECTED PRODUCT -->
      <section class="selected-look">

        <div class="selected-image">
          <img
            :src="props.product.image"
            :alt="props.product.name"
          />

          <div class="image-gradient"></div>

          <span class="pick-badge">
            YOUR PICK
          </span>

          <span class="look-number">
            01
          </span>

          <div class="image-caption">
            <span>
              SELECTED PIECE
            </span>

            <strong>
              {{ props.product.name }}
            </strong>
          </div>
        </div>

        <div class="selected-info">

          <div class="info-top">
            <div>
              <span class="mini-label">
                YOUR STYLE PROFILE
              </span>

              <div class="stars">
                <span>✦</span>
                <span>✦</span>
                <span>✦</span>
                <span>✦</span>
                <span>✧</span>
              </div>
            </div>

            <button
              class="details-button"
              type="button"
              @click="
                showDetails =
                  !showDetails
              "
            >
              {{
                showDetails
                  ? 'Hide Details'
                  : 'View Details'
              }}

              <span>
                {{
                  showDetails
                    ? '−'
                    : '+'
                }}
              </span>
            </button>
          </div>

          <h3>
            {{ props.product.name }}
          </h3>

          <p class="selected-description">
            A versatile piece chosen as
            the foundation of your
            personalized look.
          </p>

          <div
            v-if="showDetails"
            class="product-details"
          >
            <div class="detail-item">
              <span>
                STYLE
              </span>

              <strong>
                {{
                  props.product.style ||
                  '—'
                }}
              </strong>
            </div>

            <div class="detail-item">
              <span>
                CATEGORY
              </span>

              <strong>
                {{
                  props.product.category ||
                  '—'
                }}
              </strong>
            </div>

            <div class="detail-item">
              <span>
                COLOR
              </span>

              <strong>
                {{
                  props.product.color ||
                  '—'
                }}
              </strong>
            </div>
          </div>

          <div class="selected-price">
            <span>
              PRICE
            </span>

            <strong>
              {{ props.product.price }}

              <small>
                {{
                  props.product.currency ||
                  'USD'
                }}
              </small>
            </strong>
          </div>

          <div class="stylist-message">
            <div class="message-icon">
              ✦
            </div>

            <div>
              <span>
                OUR STYLIST SAYS
              </span>

              <p>
                This piece creates the
                perfect base for building
                a polished outfit.
              </p>
            </div>
          </div>

        </div>
      </section>

      <!-- CONNECTION -->
      <div class="connection">
        <span
          class="connection-line"
        ></span>

        <div
          class="connection-circle"
        >
          +
        </div>

        <span
          class="connection-line"
        ></span>
      </div>

      <!-- RECOMMENDATION HEADER -->
      <section
        class="recommendation-header"
      >

        <div>
          <span class="eyebrow">
            CURATED FOR YOU
          </span>

          <h3>
            Pieces that
            <em>complete</em>
            your outfit
          </h3>

          <p>
            Handpicked based on your
            selected piece, style,
            color and pattern.
          </p>
        </div>

        <div
          class="recommendation-actions"
        >

          <div
            class="recommendation-count"
          >
            <strong>
              {{ recommendationCount }}
            </strong>

            <span>
              MATCHED
              <br />
              PIECES
            </span>
          </div>

          <button
            class="another-look-button"
            type="button"
            :disabled="
              allRecommendationsLocked
            "
            @click="
              showAnotherLook
            "
          >
            <span>
              ✦
            </span>

            {{
              allRecommendationsLocked
                ? 'All Items Kept'
                : 'Show Me Another Look'
            }}
          </button>

        </div>
      </section>

      <!-- RECOMMENDATIONS -->
      <div
        v-if="
          recommendations.length
        "
        class="recommendations"
      >

        <article
          v-for="(
            recommendedProduct,
            index
          ) in recommendations"
          :key="
            recommendedProduct.id
          "
          class="recommendation-item"
        >

          <div class="item-label">
            <span>
              {{
                String(
                  index + 2
                ).padStart(
                  2,
                  '0'
                )
              }}
            </span>

            <div></div>

            <small>
              STYLE MATCH
            </small>
          </div>

          <!-- KEEP BUTTON -->
          <button
            type="button"
            class="keep-item-button"
            :class="{
              locked: isLocked(
                recommendedProduct
              )
            }"
            @click="
              toggleLock(
                recommendedProduct
              )
            "
          >
            <span>
              {{
                isLocked(
                  recommendedProduct
                )
                  ? '✓'
                  : '🔒'
              }}
            </span>

            {{
              isLocked(
                recommendedProduct
              )
                ? 'Kept'
                : 'Keep this item'
            }}
          </button>

          <!-- LOCKED BADGE -->
          <div
            v-if="
              isLocked(
                recommendedProduct
              )
            "
            class="locked-badge"
          >
            <span>🔒</span>
            KEEPING THIS PIECE
          </div>

          <ProductCard
            :product="
              recommendedProduct
            "
            :is-favorite="
              isFavorite(
                recommendedProduct
              )
            "
            :adding-to-cart="
              addingProductId ===
              recommendedProduct.id
            "
            @toggle-favorite="
              toggleFavorite
            "
            @add-to-cart="
              addToCart
            "
          />

        </article>

      </div>

      <!-- EMPTY -->
      <div
        v-else
        class="empty-state"
      >
        <div class="empty-icon">
          ✦
        </div>

        <h3>
          Your next look is still
          being styled
        </h3>

        <p>
          We couldn't find matching
          pieces for this selection yet.
        </p>
      </div>

      <!-- COMPLETE LOOK ACTION -->
      <section
        v-if="
          recommendations.length
        "
        class="complete-look-section"
      >

        <div class="complete-look-content">

          <div>
            <span class="eyebrow">
              LOVE THE WHOLE LOOK?
            </span>

            <h3>
              Add the
              <em>complete outfit</em>
              to your cart
            </h3>

            <p>
              Your selected piece plus all
              {{ recommendationCount }}
              curated pieces.
            </p>
          </div>

          <button
            type="button"
            class="complete-look-button"
            @click="
              addCompleteLook
            "
          >
            <span>✦</span>
            Add Complete Look
          </button>

        </div>

      </section>

      <!-- STYLE SUMMARY -->
      <section
        class="style-summary"
      >

        <div
          class="summary-header"
        >
          <div>
            <span class="eyebrow">
              STYLE SUMMARY
            </span>

            <h3>
              Your look,
              <em>curated.</em>
            </h3>
          </div>

          <span
            class="summary-icon"
          >
            ✦
          </span>
        </div>

        <div class="summary-grid">

          <div
            class="summary-item"
          >
            <span>
              BASE PIECE
            </span>

            <strong>
              {{
                props.product.name
              }}
            </strong>
          </div>

          <div
            class="summary-item"
          >
            <span>
              STYLE
            </span>

            <strong>
              {{
                props.product.style ||
                'Modern'
              }}
            </strong>
          </div>

          <div
            class="summary-item"
          >
            <span>
              COLOR PALETTE
            </span>

            <strong>
              {{
                props.product.color ||
                'Neutral'
              }}
            </strong>
          </div>

          <div
            class="summary-item"
          >
            <span>
              CURATED PIECES
            </span>

            <strong>
              {{ recommendationCount }}
            </strong>
          </div>

        </div>
      </section>

      <!-- FOOTER -->
      <footer
        class="stylist-footer"
      >
        <span>
          PERSONALIZED STYLE
        </span>

        <div></div>

        <span>
          CURATED WITH YOUR LOOK
          IN MIND
        </span>

        <div></div>

        <span>
          ✦ MADE FOR YOU
        </span>
      </footer>

    </div>
  </section>
</template>

<style scoped>
.stylist-section {
  width: 100%;
  padding: 80px 24px;
  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(
        235,
        214,
        207,
        0.35
      ),
      transparent 28%
    ),
    var(--color-beige);
}

.stylist-container {
  width: 100%;
  max-width: 1126px;
  margin: 0 auto;
}

.stylist-heading {
  max-width: 720px;
  margin: 0 auto 48px;
  text-align: center;
}

.heading-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 18px;
}

.heading-decoration span {
  width: 42px;
  height: 1px;
  background: var(--color-sand);
}

.heading-decoration i {
  color: var(--color-sand);
  font-style: normal;
  font-size: 14px;
}

.eyebrow {
  display: inline-block;
  color: var(--color-sand);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

.stylist-heading h2 {
  margin: 12px 0 14px;
  color: var(--color-gray);
  font-size: 42px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -1px;
}

.stylist-heading h2 em,
.recommendation-header h3 em,
.style-summary h3 em,
.complete-look-content h3 em {
  color: var(--color-primary);
  font-family: Georgia, serif;
  font-weight: 400;
}

.stylist-heading p {
  max-width: 560px;
  margin: 0 auto;
  color: #666;
  font-size: 15px;
  line-height: 1.7;
}

.selected-look {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  min-height: 500px;
  overflow: hidden;
  background: var(--color-white);
  border: 1px solid rgba(
    183,
    156,
    140,
    0.2
  );
  border-radius: var(--radius-lg);
  box-shadow: 0 18px 45px rgba(
    27,
    59,
    54,
    0.09
  );
}

.selected-image {
  position: relative;
  min-height: 500px;
  overflow: hidden;
  background: var(--color-pink-light);
}

.selected-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.selected-look:hover
.selected-image img {
  transform: scale(1.025);
}

.image-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(27, 59, 54, 0.55),
    transparent 45%
  );
}

.pick-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 7px 12px;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
}

.look-number {
  position: absolute;
  top: 20px;
  right: 20px;
  color: var(--color-white);
  font-family: Georgia, serif;
  font-size: 22px;
}

.image-caption {
  position: absolute;
  right: 24px;
  bottom: 24px;
  left: 24px;
  color: var(--color-white);
}

.image-caption span {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  letter-spacing: 2px;
}

.image-caption strong {
  font-size: 18px;
  font-weight: 500;
}

.selected-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
}

.info-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.mini-label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-sand);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.8px;
}

.stars {
  display: flex;
  gap: 3px;
  color: var(--color-sand);
  font-size: 13px;
}

.details-button {
  border: 1px solid rgba(
    183,
    156,
    140,
    0.4
  );
  border-radius: var(--radius-pill);
  padding: 7px 12px;
  background: transparent;
  color: var(--color-primary);
  font-size: 11px;
  cursor: pointer;
}

.details-button span {
  margin-left: 5px;
  font-size: 14px;
}

.selected-info h3 {
  margin-bottom: 12px;
  color: var(--color-gray);
  font-size: 28px;
  font-weight: 600;
}

.selected-description {
  max-width: 480px;
  margin-bottom: 28px;
  color: #666;
  font-size: 14px;
  line-height: 1.7;
}

.product-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 26px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.detail-item {
  padding: 16px 10px;
  border-right: 1px solid #eee;
}

.detail-item:last-child {
  border-right: none;
}

.detail-item span,
.summary-item span {
  display: block;
  margin-bottom: 5px;
  color: var(--color-sand);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
}

.detail-item strong,
.summary-item strong {
  color: var(--color-gray);
  font-size: 12px;
  font-weight: 500;
}

.selected-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
}

.selected-price > span {
  color: #888;
  font-size: 10px;
  letter-spacing: 1.5px;
}

.selected-price strong {
  color: var(--color-primary);
  font-size: 25px;
}

.selected-price small {
  font-size: 12px;
  font-weight: 500;
}

.stylist-message {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-default);
  background: var(--color-beige);
}

.message-icon {
  flex-shrink: 0;
  color: var(--color-sand);
  font-size: 18px;
}

.stylist-message span {
  display: block;
  margin-bottom: 5px;
  color: var(--color-primary);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
}

.stylist-message p {
  color: #666;
  font-size: 12px;
  line-height: 1.5;
}

.connection {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin: 42px 0;
}

.connection-line {
  width: 80px;
  height: 1px;
  background: rgba(
    183,
    156,
    140,
    0.5
  );
}

.connection-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--color-sand);
  border-radius: 50%;
  color: var(--color-primary);
  font-family: Georgia, serif;
  font-size: 20px;
}

.recommendation-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 30px;
}

.recommendation-header h3 {
  margin: 8px 0;
  color: var(--color-gray);
  font-size: 27px;
  font-weight: 600;
}

.recommendation-header p {
  color: #777;
  font-size: 13px;
}

.recommendation-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.recommendation-count {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 100px;
  padding: 12px 16px;
  border-left: 1px solid var(--color-sand);
}

.recommendation-count strong {
  color: var(--color-primary);
  font-family: Georgia, serif;
  font-size: 28px;
  font-weight: 400;
}

.recommendation-count span {
  color: #777;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 1.5;
}

.another-look-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 16px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-pill);
  background: var(--color-white);
  color: var(--color-primary);
  font-family: var(--font-family-base);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.another-look-button span {
  color: var(--color-sand);
  font-size: 15px;
}

.another-look-button:hover:not(
  :disabled
) {
  background: var(--color-primary);
  color: var(--color-white);
  transform: translateY(-1px);
}

.another-look-button:hover:not(
  :disabled
) span {
  color: var(--color-pink-light);
}

.another-look-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #f5f2f0;
}

/* ================================= */
/* RECOMMENDATIONS                    */
/* ================================= */

.recommendations {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.recommendation-item {
  position: relative;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.item-label span {
  color: var(--color-primary);
  font-family: Georgia, serif;
  font-size: 16px;
}

.item-label div {
  flex: 1;
  height: 1px;
  background: rgba(
    183,
    156,
    140,
    0.3
  );
}

.item-label small {
  color: var(--color-sand);
  font-size: 8px;
  letter-spacing: 1px;
}

/* ================================= */
/* KEEP ITEM                          */
/* ================================= */

.keep-item-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  min-height: 38px;
  margin-bottom: 10px;
  padding: 8px 14px;
  border: 1px solid rgba(
    183,
    156,
    140,
    0.45
  );
  border-radius: var(--radius-pill);
  background: var(--color-white);
  color: var(--color-primary);
  font-family: var(--font-family-base);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.keep-item-button:hover {
  transform: translateY(-1px);
  border-color: var(--color-primary);
}

.keep-item-button.locked {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-white);
}

.keep-item-button span {
  font-size: 13px;
}

.locked-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
  color: var(--color-sand);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1.3px;
}

.locked-badge span {
  font-size: 11px;
}

/* ================================= */
/* EMPTY                              */
/* ================================= */

.empty-state {
  padding: 70px 20px;
  text-align: center;
  border: 1px dashed rgba(
    183,
    156,
    140,
    0.5
  );
  border-radius: var(--radius-lg);
}

.empty-icon {
  margin-bottom: 12px;
  color: var(--color-sand);
  font-size: 28px;
}

.empty-state h3 {
  margin-bottom: 8px;
  color: var(--color-gray);
  font-size: 20px;
}

.empty-state p {
  color: #777;
  font-size: 13px;
}

/* ================================= */
/* COMPLETE LOOK                      */
/* ================================= */

.complete-look-section {
  margin-top: 42px;
  padding: 28px 30px;
  border: 1px solid rgba(
    183,
    156,
    140,
    0.28
  );
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      135deg,
      var(--color-white),
      var(--color-beige)
    );
}

.complete-look-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.complete-look-content h3 {
  margin: 7px 0;
  color: var(--color-gray);
  font-size: 23px;
  font-weight: 600;
}

.complete-look-content p {
  color: #777;
  font-size: 12px;
}

.complete-look-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-width: 205px;
  min-height: 46px;
  padding: 11px 20px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-white);
  font-family: var(--font-family-base);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.complete-look-button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(
    27,
    59,
    54,
    0.16
  );
}

.complete-look-button span {
  color: var(--color-pink-light);
  font-size: 15px;
}

/* ================================= */
/* SUMMARY                            */
/* ================================= */

.style-summary {
  margin-top: 60px;
  padding: 30px;
  border: 1px solid rgba(
    183,
    156,
    140,
    0.25
  );
  border-radius: var(--radius-lg);
  background: var(--color-white);
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
}

.summary-header h3 {
  margin-top: 6px;
  color: var(--color-gray);
  font-size: 23px;
}

.summary-icon {
  color: var(--color-sand);
  font-size: 25px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #eee;
}

.summary-item {
  padding: 18px 14px;
  border-right: 1px solid #eee;
}

.summary-item:last-child {
  border-right: none;
}

/* ================================= */
/* FOOTER                             */
/* ================================= */

.stylist-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 38px;
  color: var(--color-sand);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 1.5px;
}

.stylist-footer div {
  flex: 1;
  height: 1px;
  background: rgba(
    183,
    156,
    140,
    0.3
  );
}

/* ================================= */
/* RESPONSIVE                         */
/* ================================= */

@media (max-width: 900px) {
  .selected-look {
    grid-template-columns: 1fr;
  }

  .selected-image {
    min-height: 420px;
  }

  .selected-info {
    padding: 35px;
  }

  .recommendations {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-item:nth-child(2) {
    border-right: none;
  }

  .recommendation-actions {
    flex-direction: column;
    align-items: flex-end;
  }

  .complete-look-content {
    align-items: flex-start;
    flex-direction: column;
  }

  .complete-look-button {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .stylist-section {
    padding: 55px 16px;
  }

  .stylist-heading {
    margin-bottom: 35px;
  }

  .stylist-heading h2 {
    font-size: 31px;
  }

  .selected-image {
    min-height: 390px;
  }

  .selected-info {
    padding: 25px 20px;
  }

  .selected-info h3 {
    font-size: 23px;
  }

  .product-details {
    grid-template-columns: 1fr;
  }

  .detail-item {
    border-right: none;
    border-bottom: 1px solid #eee;
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .recommendation-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .recommendation-actions {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }

  .recommendation-count {
    width: fit-content;
  }

  .another-look-button {
    width: 100%;
  }

  .recommendations {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-item {
    border-right: none;
    border-bottom: 1px solid #eee;
  }

  .summary-item:last-child {
    border-bottom: none;
  }

  .stylist-footer {
    flex-wrap: wrap;
  }

  .stylist-footer div {
    min-width: 30px;
  }
}
</style>