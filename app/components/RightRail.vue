<script setup lang="ts">
import { useProject } from '~/composables/useProject'
import { useAssetUrl } from '~/composables/useAssets'

const { state } = useProject()
const capsuleUrl = useAssetUrl(() => state.value.assetKeys.headerCapsule)

const reviewColor = computed(() => {
  const s = state.value.reviews.summary
  if (s.includes('Negative')) return 'var(--dream-review-negative)'
  if (s === 'Mixed') return 'var(--dream-review-mixed)'
  if (s === 'No Reviews') return 'var(--dream-text-dim)'
  return 'var(--dream-review-positive)'
})

const formattedReviewCount = computed(() =>
  state.value.reviews.totalCount.toLocaleString()
)

const visibleTags = computed(() => state.value.tags.slice(0, 5))
</script>

<template>
  <aside class="right-rail">
    <div class="capsule">
      <img v-if="capsuleUrl" :src="capsuleUrl" alt="header capsule" />
      <div v-else class="capsule-placeholder">
        <span>Header Capsule</span>
        <small>460 × 215</small>
      </div>
    </div>

    <p class="short-desc">{{ state.shortDescription }}</p>

    <div class="data-grid">
      <div class="data-row" v-if="state.reviews.recentSummary">
        <span class="label">Recent Reviews:</span>
        <span class="value" :style="{ color: reviewColor }">
          {{ state.reviews.recentSummary }}
          <span v-if="state.reviews.recentCount" class="count">({{ state.reviews.recentCount.toLocaleString() }})</span>
        </span>
      </div>
      <div class="data-row">
        <span class="label">All Reviews:</span>
        <span class="value" :style="{ color: reviewColor }">
          {{ state.reviews.summary }}
          <span v-if="state.reviews.totalCount" class="count">({{ formattedReviewCount }})</span>
        </span>
      </div>
      <div class="data-row">
        <span class="label">Release Date:</span>
        <span class="value value-date">{{ state.releaseDate }}</span>
      </div>
      <div class="data-row" v-if="state.developer">
        <span class="label">Developer:</span>
        <span class="value"><a>{{ state.developer }}</a></span>
      </div>
      <div class="data-row" v-if="state.publisher">
        <span class="label">Publisher:</span>
        <span class="value"><a>{{ state.publisher }}</a></span>
      </div>
    </div>

    <div v-if="visibleTags.length" class="tags-block">
      <div class="tags-label">Popular user-defined tags for this product:</div>
      <div class="tags-list">
        <span v-for="t in visibleTags" :key="t" class="tag">{{ t }}</span>
        <span v-if="state.tags.length > visibleTags.length" class="tag-more">+</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.right-rail {
  width: 324px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.capsule {
  width: 100%;
  aspect-ratio: 460 / 215;
  background: #000;
  overflow: hidden;
}
.capsule img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.capsule-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #16202d, #1b2838);
  color: #546b81;
  gap: 4px;
}
.capsule-placeholder small { font-size: 11px; opacity: 0.7; }
.short-desc {
  font-size: 13px;
  line-height: 1.5;
  color: #c7d5e0;
  margin: 0;
}
.data-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}
.data-row {
  display: flex;
  gap: 6px;
}
.label {
  color: #556772;
  width: 100px;
  flex-shrink: 0;
}
.value { color: #8f98a0; }
.value-date { color: #c7d5e0; }
.count { color: #8f98a0; font-size: 11px; }
.tags-block { margin-top: 8px; }
.tags-label {
  font-size: 12px;
  color: #556772;
  margin-bottom: 4px;
}
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
.tag {
  background: rgba(103, 193, 245, 0.2);
  color: #67c1f5;
  padding: 1px 7px;
  font-size: 11px;
  border-radius: 2px;
  cursor: pointer;
}
.tag:hover { background: rgba(103, 193, 245, 0.4); color: #fff; }
.tag-more {
  background: rgba(103, 193, 245, 0.2);
  color: #67c1f5;
  padding: 1px 7px;
  font-size: 11px;
  border-radius: 2px;
  cursor: pointer;
}
</style>
