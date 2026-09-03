<script setup>
import { computed, ref } from 'vue'
import ProductCard from './ProductCard.vue'
import useOutfitEngine from './useOutfitEngine.js'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['add-to-cart', 'toggle-favorite'])

const showDetails = ref(true)
const favorites = ref([])
const addingProductId = ref(null)

const recommendations = computed(() => {
  if (!props.product) return []

  const result = useOutfitEngine(props.product)

  return Object.values(result.outfit)
})

const recommendationCount = computed(() => recommendations.value.length)

const isFavorite = (product) => {
  return favorites.value.includes(product.id)
}

function toggleFavorite(product) {
  if (favorites.value.includes(product.id)) {
    favorites.value = favorites.value.filter(id => id !== product.id)
  } else {
    favorites.value.push(product.id)
  }

  emit('toggle-favorite', product)
}

function addToCart(product) {
  addingProductId.value = product.id

  emit('add-to-cart', product)

  setTimeout(() => {
    addingProductId.value = null
  }, 700)
}
</script>

<template>
  <section v-if="props.product" class="stylist-section">
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
          Discover carefully selected pieces that complement
          your style and complete your outfit.
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
            <span>SELECTED PIECE</span>
            <strong>{{ props.product.name }}</strong>
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
              @click="showDetails = !showDetails"
            >
              {{ showDetails ? 'Hide Details' : 'View Details' }}
              <span>
                {{ showDetails ? '−' : '+' }}
              </span>
            </button>
          </div>

          <h3>
            {{ props.product.name }}
          </h3>

          <p class="selected-description">
            A versatile piece chosen as the foundation
            of your personalized look.
          </p>

          <!-- DETAILS -->
          <div
            v-if="showDetails"
            class="product-details"
          >

            <div class="detail-item">
              <span>STYLE</span>
              <strong>
                {{ props.product.style || '—' }}
              </strong>
            </div>

            <div class="detail-item">
              <span>CATEGORY</span>
              <strong>
                {{ props.product.category || '—' }}
              </strong>
            </div>

            <div class="detail-item">
              <span>COLOR</span>
              <strong>
                {{ props.product.color || '—' }}
              </strong>
            </div>

          </div>

          <div class="selected-price">
            <span>PRICE</span>

            <strong>
              {{ props.product.price }}
              <small>EGP</small>
            </strong>
          </div>

          <div class="stylist-message">
            <div class="message-icon">
              ✦
            </div>

            <div>
              <span>OUR STYLIST SAYS</span>

              <p>
                This piece creates the perfect base
                for building a polished outfit.
              </p>
            </div>
          </div>

        </div>
      </section>

      <!-- CONNECTION -->
      <div class="connection">
        <span class="connection-line"></span>

        <div class="connection-circle">
          +
        </div>

        <span class="connection-line"></span>
      </div>

      <!-- RECOMMENDATIONS HEADER -->
      <section class="recommendation-header">

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
            Handpicked based on your selected piece,
            style and color.
          </p>
        </div>

        <div class="recommendation-count">
          <strong>
            {{ recommendationCount }}
          </strong>

          <span>
            MATCHED<br />
            PIECES
          </span>
        </div>

      </section>

      <!-- RECOMMENDATIONS -->
      <div
        v-if="recommendations.length"
        class="recommendations"
      >

        <article
          v-for="(recommendedProduct, index) in recommendations"
          :key="recommendedProduct.id"
          class="recommendation-item"
        >

          <div class="item-label">
            <span>
              {{ String(index + 2).padStart(2, '0') }}
            </span>

            <div></div>

            <small>
              STYLE MATCH
            </small>
          </div>

          <ProductCard
            :product="recommendedProduct"
            :is-favorite="isFavorite(recommendedProduct)"
            :adding-to-cart="
              addingProductId === recommendedProduct.id
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

      <!-- EMPTY STATE -->
      <div
        v-else
        class="empty-state"
      >
        <div class="empty-icon">
          ✦
        </div>

        <h3>
          Your next look is still being styled
        </h3>

        <p>
          We couldn't find matching pieces for
          this selection yet.
        </p>
      </div>

      <!-- STYLE SUMMARY -->
      <section class="style-summary">

        <div class="summary-header">
          <div>
            <span class="eyebrow">
              STYLE SUMMARY
            </span>

            <h3>
              Your look,
              <em>curated.</em>
            </h3>
          </div>

          <span class="summary-icon">
            ✦
          </span>
        </div>

        <div class="summary-grid">

          <div class="summary-item">
            <span>BASE PIECE</span>
            <strong>
              {{ props.product.name }}
            </strong>
          </div>

          <div class="summary-item">
            <span>STYLE</span>
            <strong>
              {{ props.product.style || 'Modern' }}
            </strong>
          </div>

          <div class="summary-item">
            <span>COLOR PALETTE</span>
            <strong>
              {{ props.product.color || 'Neutral' }}
            </strong>
          </div>

          <div class="summary-item">
            <span>CURATED PIECES</span>
            <strong>
              {{ recommendationCount }}
            </strong>
          </div>

        </div>

      </section>

      <!-- FOOTER -->
      <footer class="stylist-footer">
        <span>
          PERSONALIZED STYLE
        </span>

        <div></div>

        <span>
          CURATED WITH YOUR LOOK IN MIND
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
      rgba(235, 214, 207, 0.35),
      transparent 28%
    ),
    var(--color-beige);
}

.stylist-container {
  width: 100%;
  max-width: 1126px;
  margin: 0 auto;
}

/* HEADER */

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
.style-summary h3 em {
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

/* SELECTED LOOK */

.selected-look {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  min-height: 500px;
  overflow: hidden;
  background: var(--color-white);
  border: 1px solid rgba(183, 156, 140, 0.2);
  border-radius: var(--radius-lg);
  box-shadow: 0 18px 45px rgba(27, 59, 54, 0.09);
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

.selected-look:hover .selected-image img {
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

/* SELECTED INFO */

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
  border: 1px solid rgba(183, 156, 140, 0.4);
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

/* DETAILS */

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

/* PRICE */

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

/* MESSAGE */

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

/* CONNECTION */

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
  background: rgba(183, 156, 140, 0.5);
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

/* RECOMMENDATION HEADER */

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

/* RECOMMENDATIONS */

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
  background: rgba(183, 156, 140, 0.3);
}

.item-label small {
  color: var(--color-sand);
  font-size: 8px;
  letter-spacing: 1px;
}

/* EMPTY */

.empty-state {
  padding: 70px 20px;
  text-align: center;
  border: 1px dashed rgba(183, 156, 140, 0.5);
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

/* STYLE SUMMARY */

.style-summary {
  margin-top: 60px;
  padding: 30px;
  border: 1px solid rgba(183, 156, 140, 0.25);
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

/* FOOTER */

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
  background: rgba(183, 156, 140, 0.3);
}

/* RESPONSIVE */

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