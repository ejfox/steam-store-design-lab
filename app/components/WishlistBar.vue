<script setup lang="ts">
import { useProject } from '~/composables/useProject'

const { state } = useProject()

const showPurchaseBox = computed(() =>
  state.value.hasPrice && !state.value.comingSoon
)

const discountedCents = computed(() => {
  if (!state.value.discountPct) return state.value.priceCents
  return Math.round(state.value.priceCents * (1 - state.value.discountPct / 100))
})
const formatDollars = (c: number) => '$' + (c / 100).toFixed(2)
</script>

<template>
  <section class="wishlist-section">
    <!-- Released + priced: green purchase box -->
    <div v-if="showPurchaseBox" class="purchase-box">
      <div class="purchase-label">Buy {{ state.title }}</div>
      <div class="purchase-inner">
        <div class="price-area">
          <template v-if="state.discountPct > 0">
            <div class="discount-badge">-{{ state.discountPct }}%</div>
            <div class="prices">
              <div class="price-orig">{{ formatDollars(state.priceCents) }}</div>
              <div class="price-final">{{ formatDollars(discountedCents) }}</div>
            </div>
          </template>
          <div v-else class="price-final solo">{{ formatDollars(state.priceCents) }}</div>
        </div>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    </div>

    <!-- Unreleased or no price yet: wishlist/follow/ignore bar -->
    <div v-else class="wishlist-bar">
      <div class="actions">
        <button class="action primary">Add to your wishlist</button>
        <button class="action">Follow</button>
        <div class="action-group">
          <button class="action">Ignore</button>
          <button class="action caret">▾</button>
        </div>
      </div>
      <a class="queue-link">View Your Queue <span class="arrow">→</span></a>
    </div>
  </section>
</template>

<style scoped>
.wishlist-section {
  margin-top: 16px;
}

/* Wishlist/Follow/Ignore bar (coming-soon style) */
.wishlist-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0;
}
.actions {
  display: flex;
  gap: 8px;
}
.action {
  background: linear-gradient(to bottom, rgba(103,193,245,0.2), rgba(103,193,245,0.1));
  border: 1px solid rgba(103,193,245,0.3);
  color: #67c1f5;
  font-family: inherit;
  font-size: 13px;
  padding: 7px 18px;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.1s;
}
.action:hover {
  background: linear-gradient(to bottom, #66c0f4, #417a9b);
  color: #fff;
  border-color: #66c0f4;
}
.action.primary { padding-right: 22px; padding-left: 22px; }
.action-group { display: flex; }
.action.caret { padding: 7px 10px; border-left: 1px solid rgba(0,0,0,0.3); margin-left: -1px; }

.queue-link {
  color: #67c1f5;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.queue-link:hover { color: #fff; }
.arrow { font-size: 12px; }

/* Released purchase box */
.purchase-box {
  background: rgba(0,0,0,0.2);
  padding: 10px 14px;
}
.purchase-label {
  color: #fff;
  font-size: 22px;
  font-weight: 100;
  margin-bottom: 6px;
}
.purchase-inner {
  background: rgba(0,0,0,0.2);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.price-area { display: flex; align-items: center; gap: 10px; flex: 1; }
.discount-badge {
  background: #4c6b22;
  color: #beee11;
  padding: 6px 10px;
  font-size: 22px;
  letter-spacing: -1px;
}
.prices { display: flex; flex-direction: column; }
.price-orig {
  color: #738895;
  text-decoration: line-through;
  font-size: 12px;
}
.price-final { color: #beee11; font-size: 15px; }
.price-final.solo { padding: 0 8px; }
.add-to-cart {
  background: linear-gradient(to bottom, #75b022 5%, #588a1b 95%);
  color: #d2e885;
  border: none;
  padding: 6px 22px;
  height: 32px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  border-radius: 2px;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
}
.add-to-cart:hover {
  background: linear-gradient(to bottom, #8bb347, #6aa120);
  color: #fff;
}
</style>
