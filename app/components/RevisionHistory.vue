<script setup lang="ts">
import { useProject } from '~/composables/useProject'
import { useRevisions } from '~/composables/useRevisions'
import { useAssetUrl } from '~/composables/useAssets'
import type { Revision } from '~/composables/useRevisions'

const { state } = useProject()
const { revisions, refresh, save, remove, rename } = useRevisions()

const newLabel = ref('')
async function doSave() {
  await save(state.value, newLabel.value || undefined)
  newLabel.value = ''
}

async function doRestore(r: Revision) {
  if (!confirm(`Restore this snapshot? Current unsaved work will be overwritten.\n\n${r.label || formatTime(r.createdAt)}`)) return
  state.value = JSON.parse(JSON.stringify(r.state))
}

async function doDelete(r: Revision) {
  if (!confirm('Delete this snapshot?')) return
  await remove(r.id)
}

async function doRename(r: Revision) {
  const label = prompt('Label for this snapshot:', r.label || '')
  if (label === null) return
  await rename(r.id, label)
}

function formatTime(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const now = new Date()
  const same = d.toDateString() === now.toDateString()
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (same) return `Today ${time}`
  const yest = new Date(now); yest.setDate(yest.getDate() - 1)
  if (d.toDateString() === yest.toDateString()) return `Yesterday ${time}`
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${time}`
}

function summary(r: Revision) {
  const s = r.state
  const parts: string[] = []
  parts.push(`"${s.title}"`)
  const shots = s.mediaOrder.filter(m => m.kind === 'screenshot').length
  const videos = s.mediaOrder.filter(m => m.kind === 'video').length
  if (shots) parts.push(`${shots} shot${shots === 1 ? '' : 's'}`)
  if (videos) parts.push(`${videos} video${videos === 1 ? '' : 's'}`)
  const assetCount = Object.values(s.assetKeys).filter(Boolean).length
  if (assetCount) parts.push(`${assetCount} asset${assetCount === 1 ? '' : 's'}`)
  if (s.tags.length) parts.push(`${s.tags.length} tags`)
  return parts.join(' · ')
}
</script>

<template>
  <div class="rev-root">
    <div class="save-block">
      <input
        v-model="newLabel"
        class="save-input"
        placeholder="Snapshot label (optional)…"
        @keydown.enter.prevent="doSave"
      />
      <button class="btn save-btn" @click="doSave">
        <span class="plus">＋</span> Save snapshot
      </button>
    </div>

    <div v-if="!revisions.length" class="empty">
      <div class="empty-title">No snapshots yet</div>
      <div class="empty-sub">Save a snapshot to capture the current state. Restore any time.</div>
    </div>

    <ul v-else class="rev-list">
      <RevisionCard
        v-for="r in revisions"
        :key="r.id"
        :revision="r"
        :summary="summary(r)"
        :time="formatTime(r.createdAt)"
        @restore="doRestore(r)"
        @delete="doDelete(r)"
        @rename="doRename(r)"
      />
    </ul>
  </div>
</template>

<style scoped>
.rev-root { display: flex; flex-direction: column; gap: 14px; }
.save-block { display: flex; gap: 6px; }
.save-input {
  flex: 1;
  background: #0a1016;
  border: 1px solid #223242;
  color: #c7d5e0;
  padding: 7px 10px;
  font-size: 13px;
  font-family: inherit;
  border-radius: 2px;
  outline: none;
}
.save-input:focus { border-color: #67c1f5; }
.save-btn {
  background: linear-gradient(to bottom, #75b022, #588a1b);
  color: #d2e885;
  border: none;
  padding: 0 14px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.save-btn:hover { color: #fff; }
.plus { font-size: 14px; }

.empty {
  background: rgba(0,0,0,0.2);
  padding: 24px 18px;
  text-align: center;
  border: 1px dashed #223242;
  border-radius: 2px;
}
.empty-title { color: #67c1f5; font-size: 13px; margin-bottom: 4px; }
.empty-sub { color: #556772; font-size: 12px; }

.rev-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
