<script setup lang="ts">
import { useAssetUrl } from '~/composables/useAssets'
import type { Revision } from '~/composables/useRevisions'

const props = defineProps<{
  revision: Revision
  summary: string
  time: string
}>()

defineEmits<{ restore: []; delete: []; rename: [] }>()

const capsuleUrl = useAssetUrl(() => props.revision.state.assetKeys.headerCapsule)
</script>

<template>
  <li class="rev-card">
    <div class="thumb">
      <img v-if="capsuleUrl" :src="capsuleUrl" />
      <div v-else class="thumb-empty">{{ revision.state.title[0] }}</div>
    </div>
    <div class="rev-body">
      <div class="rev-top">
        <div class="rev-label">
          <span v-if="revision.label" class="label-text">{{ revision.label }}</span>
          <span v-else class="label-time">{{ time }}</span>
        </div>
        <div class="rev-actions">
          <button class="act" @click="$emit('rename')" title="Rename">✎</button>
          <button class="act" @click="$emit('restore')" title="Restore">↺</button>
          <button class="act danger" @click="$emit('delete')" title="Delete">✕</button>
        </div>
      </div>
      <div v-if="revision.label" class="rev-time">{{ time }}</div>
      <div class="rev-summary">{{ summary }}</div>
    </div>
  </li>
</template>

<style scoped>
.rev-card {
  display: flex;
  gap: 10px;
  background: rgba(0,0,0,0.25);
  padding: 8px;
  border-radius: 2px;
  border-left: 3px solid #223242;
}
.rev-card:hover { border-left-color: #67c1f5; background: rgba(0,0,0,0.4); }

.thumb {
  width: 72px;
  height: 34px;
  background: #000;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-empty {
  color: #67c1f5;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #16202d, #1b2838);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rev-body { flex: 1; min-width: 0; }
.rev-top { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
.rev-label { font-size: 13px; color: #c7d5e0; }
.label-text { color: #fff; font-weight: 500; }
.label-time { color: #8f98a0; }
.rev-time { font-size: 10px; color: #556772; margin-top: 1px; }
.rev-summary { font-size: 11px; color: #8f98a0; margin-top: 3px; }

.rev-actions { display: flex; gap: 2px; }
.act {
  background: transparent;
  border: 1px solid transparent;
  color: #67c1f5;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-size: 11px;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.act:hover { background: rgba(103,193,245,0.2); color: #fff; }
.act.danger:hover { background: #a34c25; color: #fff; }
</style>
