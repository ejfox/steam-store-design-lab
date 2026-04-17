<script setup lang="ts">
import { useProject } from '~/composables/useProject'
import { useAssetUrl } from '~/composables/useAssets'

const { state } = useProject()

const activeIndex = ref(0)
const activeItem = computed(() => state.value.mediaOrder[activeIndex.value] ?? null)
const activeUrl = useAssetUrl(() => activeItem.value?.assetKey)

function selectIndex(i: number) {
  activeIndex.value = i
}

watch(() => state.value.mediaOrder.length, (len) => {
  if (activeIndex.value >= len) activeIndex.value = Math.max(0, len - 1)
})
</script>

<template>
  <section class="media-gallery">
    <div class="stage">
      <template v-if="activeItem">
        <img v-if="activeItem.kind === 'screenshot' && activeUrl" :src="activeUrl" class="stage-img" />
        <div v-else-if="activeItem.kind === 'video'" class="stage-video">
          <iframe
            v-if="activeItem.videoUrl"
            :src="activeItem.videoUrl"
            allowfullscreen
            class="video-frame"
          />
          <div v-else class="stage-empty">Paste a video embed URL in the editor</div>
        </div>
        <div v-else class="stage-empty">Screenshot missing</div>
      </template>
      <div v-else class="stage-empty">
        <div class="stage-empty-title">No media yet</div>
        <div class="stage-empty-sub">Open the editor and add screenshots to preview your gallery</div>
      </div>
    </div>

    <div class="thumb-strip" v-if="state.mediaOrder.length">
      <MediaThumb
        v-for="(item, i) in state.mediaOrder"
        :key="item.id"
        :item="item"
        :active="i === activeIndex"
        @click="selectIndex(i)"
      />
    </div>
  </section>
</template>

<style scoped>
.media-gallery {
  width: 100%;
}
.stage {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.stage-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.stage-video, .video-frame {
  width: 100%;
  height: 100%;
  border: 0;
}
.stage-empty {
  color: #546b81;
  text-align: center;
  padding: 24px;
  width: 100%;
}
.stage-empty-title {
  font-size: 20px;
  color: #67c1f5;
  margin-bottom: 6px;
}
.stage-empty-sub {
  font-size: 13px;
  color: #8f98a0;
}
.thumb-strip {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  overflow-x: auto;
  padding-bottom: 4px;
}
</style>
