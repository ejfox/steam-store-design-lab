<script setup lang="ts">
import { useProject } from '~/composables/useProject'
import { ASSET_SPECS, ASSET_GROUPS, type AssetSpec } from '~/utils/schema'

const props = defineProps<{
  activeTab?: string
}>()

const emit = defineEmits<{
  'select-tab': [tab: string]
}>()

const { state } = useProject()

interface ChecklistItem {
  key: string
  label: string
  done: boolean
  required: boolean
  tab: string
  detail?: string
}

const grouped = computed(() => {
  const out: Record<string, AssetSpec[]> = {}
  for (const spec of ASSET_SPECS) {
    out[spec.group] ??= []
    out[spec.group]!.push(spec)
  }
  return out
})

const textChecks = computed<ChecklistItem[]>(() => [
  { key: 'title', label: 'Game title', done: !!state.value.title && state.value.title !== 'Untitled Game', required: true, tab: 'identity' },
  { key: 'shortDesc', label: 'Short description', done: state.value.shortDescription.length > 20 && !state.value.shortDescription.startsWith('Your short description'), required: true, tab: 'identity' },
  { key: 'about', label: 'About This Game', done: state.value.aboutThisGame.length > 40 && !state.value.aboutThisGame.startsWith('Write the full'), required: true, tab: 'identity' },
  { key: 'developer', label: 'Developer', done: !!state.value.developer && state.value.developer !== 'Your Studio', required: true, tab: 'identity' },
  { key: 'publisher', label: 'Publisher', done: !!state.value.publisher && state.value.publisher !== 'Your Studio', required: true, tab: 'identity' },
  { key: 'releaseDate', label: 'Release date', done: !!state.value.releaseDate && state.value.releaseDate !== 'Coming Soon', required: true, tab: 'identity' },
  { key: 'genres', label: 'Genres (1+)', done: state.value.genres.length > 0, required: true, tab: 'taxonomy' },
  { key: 'tags', label: 'Tags (3+ recommended)', done: state.value.tags.length >= 3, required: false, tab: 'taxonomy', detail: `${state.value.tags.length} added` },
  { key: 'features', label: 'Features (1+)', done: state.value.features.length > 0, required: true, tab: 'taxonomy' },
  {
    key: 'media',
    label: 'Screenshots (5+ recommended)',
    done: state.value.mediaOrder.filter(m => m.kind === 'screenshot').length >= 5,
    required: true,
    tab: 'media',
    detail: `${state.value.mediaOrder.filter(m => m.kind === 'screenshot').length} screenshots`,
  },
  {
    key: 'trailer',
    label: 'Trailer video',
    done: state.value.mediaOrder.some(m => m.kind === 'video'),
    required: false,
    tab: 'media',
    detail: state.value.mediaOrder.some(m => m.kind === 'video') ? 'Added' : 'Optional',
  },
  {
    key: 'reqs',
    label: 'System requirements',
    done: !!state.value.systemRequirements.windowsMin?.processor,
    required: true,
    tab: 'requirements',
  },
  {
    key: 'languages',
    label: 'Languages (1+)',
    done: state.value.languages.length > 0,
    required: true,
    tab: 'languages',
    detail: `${state.value.languages.length} configured`,
  },
  { key: 'price', label: 'Price set', done: state.value.hasPrice, required: false, tab: 'commerce' },
])

const assetItems = computed<ChecklistItem[]>(() => (
  ASSET_SPECS.map(spec => ({
    key: spec.key,
    label: spec.label,
    done: !!state.value.assetKeys[spec.key],
    required: spec.required,
    tab: 'assets',
    detail: `${spec.width} x ${spec.height}`,
  }))
))

const totals = computed(() => {
  const assetDone = assetItems.value.filter(item => item.done).length
  const assetTotal = assetItems.value.length
  const assetRequiredDone = assetItems.value.filter(item => item.required && item.done).length
  const assetRequiredTotal = assetItems.value.filter(item => item.required).length

  const textDone = textChecks.value.filter(item => item.done).length
  const textTotal = textChecks.value.length
  const textRequiredDone = textChecks.value.filter(item => item.required && item.done).length
  const textRequiredTotal = textChecks.value.filter(item => item.required).length

  const requiredDone = assetRequiredDone + textRequiredDone
  const requiredTotal = assetRequiredTotal + textRequiredTotal
  const overallDone = assetDone + textDone
  const overallTotal = assetTotal + textTotal

  return {
    assetDone,
    assetTotal,
    textDone,
    textTotal,
    requiredDone,
    requiredTotal,
    overallDone,
    overallTotal,
    pctRequired: requiredTotal === 0 ? 100 : Math.round((requiredDone / requiredTotal) * 100),
    pctOverall: overallTotal === 0 ? 100 : Math.round((overallDone / overallTotal) * 100),
  }
})

const nextUp = computed(() => {
  const items = [...textChecks.value, ...assetItems.value]
  return items
    .filter(item => !item.done)
    .sort((a, b) => Number(b.required) - Number(a.required))
    .slice(0, 4)
})

function selectTab(tab: string) {
  emit('select-tab', tab)
}
</script>

<template>
  <div class="checklist">
    <div class="progress-block">
      <div class="progress-row">
        <span class="progress-label">Required complete</span>
        <span class="progress-count">{{ totals.requiredDone }} / {{ totals.requiredTotal }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill required" :style="{ width: totals.pctRequired + '%' }" />
      </div>
      <div class="progress-row">
        <span class="progress-label">Everything</span>
        <span class="progress-count">{{ totals.overallDone }} / {{ totals.overallTotal }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: totals.pctOverall + '%' }" />
      </div>
    </div>

    <div v-if="nextUp.length" class="next-up">
      <div class="group-title">Recommended next steps</div>
      <div class="next-up-list">
        <button
          v-for="(item, index) in nextUp"
          :key="item.key"
          class="next-up-btn"
          :class="{ active: props.activeTab === item.tab }"
          @click="selectTab(item.tab)"
        >
          <span class="next-up-index">{{ index + 1 }}</span>
          <span class="next-up-copy">
            <span class="next-up-label">{{ item.label }}</span>
            <span class="next-up-detail">
              {{ item.required ? 'Required for a convincing page' : 'Optional polish' }}
            </span>
          </span>
          <span class="next-up-tab">Open {{ item.tab }}</span>
        </button>
      </div>
    </div>

    <div class="group">
      <h4 class="group-title">Text and metadata</h4>
      <ul class="items">
        <li v-for="item in textChecks" :key="item.key" class="item">
          <button
            class="item-btn"
            :class="{ active: props.activeTab === item.tab }"
            @click="selectTab(item.tab)"
          >
            <span class="check" :class="{ done: item.done }">{{ item.done ? 'OK' : '  ' }}</span>
            <span class="item-copy">
              <span class="item-label">{{ item.label }}</span>
              <span class="item-meta">
                <span v-if="item.required" class="req">Required</span>
                <span v-if="item.detail" class="detail">{{ item.detail }}</span>
                <span v-if="!item.detail && !item.required" class="detail">Optional polish</span>
              </span>
            </span>
            <span class="jump">Open {{ item.tab }}</span>
          </button>
        </li>
      </ul>
    </div>

    <div v-for="(specs, group) in grouped" :key="group" class="group">
      <h4 class="group-title">{{ ASSET_GROUPS[group as keyof typeof ASSET_GROUPS] }}</h4>
      <ul class="items">
        <li v-for="spec in specs" :key="spec.key" class="item">
          <button
            class="item-btn"
            :class="{ active: props.activeTab === 'assets' }"
            @click="selectTab('assets')"
          >
            <span class="check" :class="{ done: !!state.assetKeys[spec.key] }">{{ state.assetKeys[spec.key] ? 'OK' : '  ' }}</span>
            <span class="item-copy">
              <span class="item-label">{{ spec.label }}</span>
              <span class="item-meta">
                <span class="detail">{{ spec.width }} x {{ spec.height }}</span>
                <span v-if="spec.required" class="req">Required</span>
              </span>
            </span>
            <span class="jump">Open graphics</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.checklist {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 14px;
}

.progress-block {
  background: linear-gradient(180deg, rgba(25, 37, 49, 0.95), rgba(10, 16, 22, 0.95));
  padding: 16px;
  border: 1px solid #223242;
  border-radius: 12px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
}

.progress-row:not(:first-child) {
  margin-top: 12px;
}

.progress-label {
  color: #8f98a0;
  font-size: 13px;
}

.progress-count {
  color: #c7d5e0;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}

.progress-bar {
  height: 8px;
  background: #0e1620;
  overflow: hidden;
  border-radius: 999px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #47bfff, #1a44c2);
  transition: width 0.2s;
}

.progress-fill.required {
  background: linear-gradient(to right, #75b022, #beee11);
}

.group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  color: #67c1f5;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin: 0;
}

.next-up {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.next-up-list {
  display: grid;
  gap: 8px;
}

.next-up-btn,
.item-btn {
  width: 100%;
  border: 1px solid #223242;
  background: rgba(11, 18, 24, 0.98);
  color: inherit;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s, background 0.15s;
}

.next-up-btn:hover,
.item-btn:hover {
  border-color: #67c1f5;
  background: rgba(18, 30, 41, 0.98);
}

.next-up-btn.active,
.item-btn.active {
  border-color: #67c1f5;
  box-shadow: inset 0 0 0 1px rgba(103, 193, 245, 0.2);
}

.next-up-btn {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  text-align: left;
}

.next-up-index {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(103, 193, 245, 0.14);
  color: #9ad7ff;
  font-size: 14px;
  font-weight: 700;
}

.next-up-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.next-up-label {
  color: #fff;
  font-size: 15px;
}

.next-up-detail {
  color: #9aa9b5;
  font-size: 13px;
  line-height: 1.4;
}

.next-up-tab {
  color: #67c1f5;
  font-size: 13px;
  white-space: nowrap;
}

.items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  margin: 0;
}

.item-btn {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  text-align: left;
}

.check {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #101822;
  color: transparent;
  border: 1px solid #223242;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.check.done {
  background: #5ba32b;
  border-color: #5ba32b;
  color: #fff;
}

.item-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-label {
  min-width: 0;
  color: #f4f8fb;
  font-size: 14px;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.detail {
  color: #9aa9b5;
  font-size: 12px;
}

.req {
  font-size: 11px;
  color: #beee11;
  letter-spacing: 0.4px;
}

.jump {
  color: #67c1f5;
  font-size: 13px;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .item-btn {
    grid-template-columns: 32px minmax(0, 1fr);
  }

  .jump {
    grid-column: 2;
  }

  .next-up-btn {
    grid-template-columns: 38px minmax(0, 1fr);
  }

  .next-up-tab {
    grid-column: 2;
  }
}
</style>
