<script setup lang="ts">
import { saveAsset, deleteAsset, useAssetUrl } from '~/composables/useAssets'

const props = defineProps<{
  modelValue: string | undefined
  width: number
  height: number
  label?: string
  compact?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>()

const url = useAssetUrl(() => props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

async function ingest(file: File | Blob) {
  if (!file) return
  const oldKey = props.modelValue
  const key = await saveAsset(file)
  emit('update:modelValue', key)
  if (oldKey) await deleteAsset(oldKey)
}

function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) ingest(file)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) ingest(file)
}

function onPaste(e: ClipboardEvent) {
  const item = Array.from(e.clipboardData?.items ?? []).find(i => i.type.startsWith('image/'))
  if (item) {
    const file = item.getAsFile()
    if (file) ingest(file)
  }
}

async function clear() {
  const oldKey = props.modelValue
  emit('update:modelValue', undefined)
  if (oldKey) await deleteAsset(oldKey)
}

const aspect = computed(() => `${props.width} / ${props.height}`)
</script>

<template>
  <div
    class="drop-zone"
    :class="{ dragging: isDragging, compact, filled: !!url }"
    :style="{ aspectRatio: aspect }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop="onDrop"
    @paste="onPaste"
    tabindex="0"
    @click="inputRef?.click()"
  >
    <img v-if="url" :src="url" class="preview" />
    <div v-else class="placeholder">
      <div class="ph-title">{{ label ?? 'Drop / click / paste' }}</div>
      <div class="ph-dims">{{ width }} × {{ height }}</div>
    </div>
    <button v-if="url" class="clear-btn" @click.stop="clear" title="Remove">✕</button>
    <input ref="inputRef" type="file" accept="image/*" class="file-input" @change="onPick" />
  </div>
</template>

<style scoped>
.drop-zone {
  width: 100%;
  background: #0e1620;
  border: 1px dashed #2a3f52;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: border-color 0.15s, background 0.15s;
}
.drop-zone:hover:not(.filled) { border-color: #67c1f5; }
.drop-zone.dragging { border-color: #67c1f5; background: rgba(103, 193, 245, 0.08); }
.drop-zone.filled { border-style: solid; border-color: transparent; }
.drop-zone.compact { max-height: 120px; }
.preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder {
  text-align: center;
  padding: 8px;
  color: #546b81;
}
.ph-title {
  font-size: 12px;
  color: #67c1f5;
  margin-bottom: 2px;
}
.ph-dims { font-size: 10px; font-family: "SF Mono", Consolas, monospace; }
.clear-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.7);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}
.clear-btn:hover { background: #a34c25; }
.file-input { display: none; }
</style>
