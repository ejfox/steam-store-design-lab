<script setup lang="ts">
import type { MediaItem } from '~/utils/schema'
import { useAssetUrl } from '~/composables/useAssets'

const props = defineProps<{ item: MediaItem; active: boolean }>()
const url = useAssetUrl(() => props.item.thumbKey || props.item.assetKey)
</script>

<template>
  <button class="thumb" :class="{ active }">
    <img v-if="url" :src="url" />
    <div v-else class="thumb-placeholder">
      <span v-if="item.kind === 'video'">▶</span>
      <span v-else>—</span>
    </div>
    <span v-if="item.kind === 'video'" class="video-badge">▶</span>
  </button>
</template>

<style scoped>
.thumb {
  flex: 0 0 auto;
  width: 120px;
  height: 67px;
  background: #000;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  opacity: 0.6;
  transition: opacity 0.15s, border-color 0.15s;
}
.thumb:hover { opacity: 0.85; }
.thumb.active {
  opacity: 1;
  border-color: #67c1f5;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3c5064;
  font-size: 20px;
}
.video-badge {
  position: absolute;
  bottom: 3px;
  right: 3px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 1px 4px;
  font-size: 10px;
  border-radius: 2px;
}
</style>
