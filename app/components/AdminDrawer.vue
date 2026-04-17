<script setup lang="ts">
import { useProject } from '~/composables/useProject'
import { saveAsset, deleteAsset, wipeAssets } from '~/composables/useAssets'
import {
  ASSET_SPECS,
  ASSET_GROUPS,
  COMMON_GENRES,
  COMMON_FEATURES,
  REVIEW_SUMMARIES,
  type MediaItem,
  type SystemReqsOS,
} from '~/utils/schema'

const open = defineModel<boolean>('open', { default: false })
const { state, reset, exportJson, importJson } = useProject()

type Tab =
  | 'checklist'
  | 'identity'
  | 'media'
  | 'assets'
  | 'taxonomy'
  | 'commerce'
  | 'reviews'
  | 'requirements'
  | 'languages'
  | 'data'

type ReqKey = 'windowsMin' | 'windowsRec' | 'macMin' | 'macRec' | 'linuxMin' | 'linuxRec'
type NoticeTone = 'info' | 'success' | 'error'

interface TabMeta {
  id: Tab
  label: string
}

const tab = ref<Tab>('checklist')
const exportView = ref('')
const importText = ref('')
const newTag = ref('')
const resetPhrase = ref('')
const resetArmed = ref(false)
const notice = ref<{ tone: NoticeTone; text: string } | null>(null)
const lastEditedAt = ref(new Date())

let noticeTimeout: number | undefined
let editTimer: number | undefined

const TABS: TabMeta[] = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'identity', label: 'Identity' },
  { id: 'assets', label: 'Graphics' },
  { id: 'media', label: 'Media' },
  { id: 'taxonomy', label: 'Tags' },
  { id: 'commerce', label: 'Pricing' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'requirements', label: 'System' },
  { id: 'languages', label: 'Languages' },
  { id: 'data', label: 'Data' },
]

const groupedAssetSpecs = computed(() => {
  const out: Record<string, typeof ASSET_SPECS> = {}
  for (const spec of ASSET_SPECS) {
    out[spec.group] ??= []
    out[spec.group]!.push(spec)
  }
  return out
})

const screenshotCount = computed(() => state.value.mediaOrder.filter(item => item.kind === 'screenshot').length)
const requiredAssetsTotal = ASSET_SPECS.filter(spec => spec.required).length
const requiredAssetsDone = computed(() => ASSET_SPECS.filter(spec => spec.required && state.value.assetKeys[spec.key]).length)
const requiredFieldsTotal = 10
const requiredFieldsDone = computed(() => [
  !!state.value.title && state.value.title !== 'Untitled Game',
  state.value.shortDescription.length > 20 && !state.value.shortDescription.startsWith('Your short description'),
  state.value.aboutThisGame.length > 40 && !state.value.aboutThisGame.startsWith('Write the full'),
  !!state.value.developer && state.value.developer !== 'Your Studio',
  !!state.value.publisher && state.value.publisher !== 'Your Studio',
  !!state.value.releaseDate && state.value.releaseDate !== 'Coming Soon',
  state.value.genres.length > 0,
  state.value.features.length > 0,
  screenshotCount.value >= 5,
  !!state.value.systemRequirements.windowsMin?.processor,
].filter(Boolean).length)
const requiredOverallPct = computed(() => Math.round(((requiredAssetsDone.value + requiredFieldsDone.value) / (requiredAssetsTotal + requiredFieldsTotal)) * 100))

const currentLabel = computed(() => TABS.find(t => t.id === tab.value)?.label ?? '')


const relativeEditedLabel = computed(() => {
  const deltaMs = Date.now() - lastEditedAt.value.getTime()
  const deltaSec = Math.max(0, Math.round(deltaMs / 1000))
  if (deltaSec < 10) return 'just now'
  if (deltaSec < 60) return `${deltaSec}s ago`
  const deltaMin = Math.round(deltaSec / 60)
  if (deltaMin < 60) return `${deltaMin}m ago`
  return lastEditedAt.value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
})

const pricePreview = computed(() => {
  if (!state.value.hasPrice) return state.value.comingSoon ? 'Not yet available' : 'No price set'
  return state.value.discountPct > 0
    ? `$${formatCents(Math.round(state.value.priceCents * (1 - state.value.discountPct / 100)))} sale price`
    : `$${formatCents(state.value.priceCents)} standard price`
})

function pushNotice(tone: NoticeTone, text: string) {
  notice.value = { tone, text }
  if (noticeTimeout) clearTimeout(noticeTimeout)
  noticeTimeout = setTimeout(() => {
    notice.value = null
  }, 4000)
}

function clearNotice() {
  if (noticeTimeout) clearTimeout(noticeTimeout)
  notice.value = null
}

function selectTab(nextTab: string) {
  tab.value = nextTab as Tab
}

function dismissReset() {
  resetArmed.value = false
  resetPhrase.value = ''
}

function formatCents(cents: number) {
  return (cents / 100).toFixed(2)
}

function setPriceDollars(v: string) {
  const n = parseFloat(v)
  if (!Number.isNaN(n)) state.value.priceCents = Math.round(n * 100)
}

function addTag() {
  const value = newTag.value.trim()
  if (value && !state.value.tags.includes(value)) state.value.tags.push(value)
  newTag.value = ''
}

function removeTag(tag: string) {
  state.value.tags = state.value.tags.filter(entry => entry !== tag)
}

function toggleList(list: 'genres' | 'features', value: string) {
  const arr = state.value[list]
  const index = arr.indexOf(value)
  if (index >= 0) arr.splice(index, 1)
  else arr.push(value)
}

async function addScreenshots(files: FileList | null) {
  if (!files) return
  let added = 0
  for (const file of Array.from(files)) {
    const key = await saveAsset(file)
    const item: MediaItem = {
      id: 's_' + Math.random().toString(36).slice(2, 8),
      kind: 'screenshot',
      assetKey: key,
      thumbKey: key,
    }
    state.value.mediaOrder.push(item)
    added += 1
  }
  if (added) pushNotice('success', `Added ${added} screenshot${added === 1 ? '' : 's'} to the gallery.`)
}

async function removeMedia(index: number) {
  const [removed] = state.value.mediaOrder.splice(index, 1)
  if (removed?.assetKey) await deleteAsset(removed.assetKey)
  pushNotice('info', 'Removed media item.')
}

function moveMedia(index: number, dir: -1 | 1) {
  const nextIndex = index + dir
  if (nextIndex < 0 || nextIndex >= state.value.mediaOrder.length) return
  const arr = state.value.mediaOrder
  ;[arr[index], arr[nextIndex]] = [arr[nextIndex]!, arr[index]!]
}

function addVideo() {
  state.value.mediaOrder.unshift({
    id: 'v_' + Math.random().toString(36).slice(2, 8),
    kind: 'video',
    assetKey: '',
    videoUrl: '',
  })
  pushNotice('info', 'Added an empty video slot. Paste an embed URL to preview it.')
}

function toggleReqBlock(key: ReqKey) {
  const req = state.value.systemRequirements
  if (req[key]) {
    delete req[key]
  } else {
    req[key] = { os: '', processor: '', memory: '', graphics: '', storage: '' }
  }
}

function getReq(key: ReqKey): SystemReqsOS | undefined {
  return state.value.systemRequirements[key]
}

function addLanguage() {
  state.value.languages.push({ name: '', interface: true, fullAudio: false, subtitles: false })
}

function removeLanguage(index: number) {
  state.value.languages.splice(index, 1)
}

function showExport() {
  exportView.value = exportJson()
  pushNotice('info', 'Prepared the current project JSON export.')
}

async function copyExport() {
  if (!exportView.value) exportView.value = exportJson()
  try {
    await navigator.clipboard.writeText(exportView.value)
    pushNotice('success', 'Copied the JSON export to the clipboard.')
  } catch {
    pushNotice('error', 'Clipboard copy failed in this browser. The export is still visible below.')
  }
}

function doImport() {
  try {
    importJson(importText.value)
    importText.value = ''
    exportView.value = ''
    resetArmed.value = false
    resetPhrase.value = ''
    tab.value = 'checklist'
    pushNotice('success', 'Imported project JSON and refreshed the preview.')
  } catch (error) {
    pushNotice('error', 'Import failed: ' + (error as Error).message)
  }
}

async function doReset() {
  if (resetPhrase.value !== 'RESET') {
    pushNotice('error', 'Type RESET exactly before wiping the project.')
    return
  }
  await wipeAssets()
  reset()
  exportView.value = ''
  importText.value = ''
  resetPhrase.value = ''
  resetArmed.value = false
  tab.value = 'checklist'
  pushNotice('success', 'Reset the project and cleared stored assets.')
}

function onWindowKeydown(event: KeyboardEvent) {
  if (!open.value) return
  if (event.key === 'Escape') {
    if (resetArmed.value) dismissReset()
    else open.value = false
  }
}

watch(state, () => {
  if (editTimer) clearTimeout(editTimer)
  editTimer = setTimeout(() => {
    lastEditedAt.value = new Date()
  }, 250)
}, { deep: true })

watch(open, isOpen => {
  if (!isOpen) {
    clearNotice()
    dismissReset()
  }
})

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onWindowKeydown)
  if (noticeTimeout) clearTimeout(noticeTimeout)
  if (editTimer) clearTimeout(editTimer)
})

/* ── Style tokens ────────────────────────────────────────────────
 * Pulled out of the template so every knob lives in one place.
 * Scoped CSS descendant rules under .drawer-root.open silently fail
 * to cascade in this project, and CSS transitions on transform /
 * background-color freeze the computed value — so state-driven
 * styles are applied inline with no transition.
 */
const TOKENS = {
  backdropColor: 'rgba(4, 8, 12, 0.72)',
  backdropBlur: '4px',
} as const

const drawerRootStyle = computed(() => ({
  pointerEvents: open.value ? 'auto' : 'none',
}))

const drawerStyle = computed(() => ({
  transform: open.value ? 'translateX(0)' : 'translateX(100%)',
}))

const backdropStyle = computed(() => ({
  backgroundColor: open.value ? TOKENS.backdropColor : 'transparent',
  backdropFilter: open.value ? `blur(${TOKENS.backdropBlur})` : 'blur(0)',
  WebkitBackdropFilter: open.value ? `blur(${TOKENS.backdropBlur})` : 'blur(0)',
  pointerEvents: open.value ? 'auto' : 'none',
}))
</script>

<template>
  <div class="drawer-root" :class="{ open }" :style="drawerRootStyle">
    <aside class="drawer" :style="drawerStyle">
      <header class="drawer-header">
        <div class="header-left">
          <div class="drawer-title">{{ state.title }}</div>
          <div class="drawer-caption">{{ requiredOverallPct }}% ready · saved {{ relativeEditedLabel }}</div>
        </div>
        <button class="close-btn" @click="open = false" title="Close editor (Esc)">Close</button>
      </header>

      <div class="drawer-body">
        <div class="drawer-shell">
          <aside class="drawer-sidebar">
            <nav class="section-nav">
              <button
                v-for="item in TABS"
                :key="item.id"
                class="section-nav-btn"
                :class="{ active: tab === item.id }"
                @click="tab = item.id"
              >{{ item.label }}</button>
            </nav>
          </aside>

          <section class="drawer-content">
            <div v-if="notice" class="notice" :class="notice.tone">
              <span>{{ notice.text }}</span>
              <button class="notice-close" @click="clearNotice">Dismiss</button>
            </div>

            <header class="section-header">
              <h2 class="section-title">{{ currentLabel }}</h2>
            </header>

            <div class="editor-surface">
              <section v-if="tab === 'checklist'" class="section-stack">
                <AssetChecklist :active-tab="tab" @select-tab="selectTab" />
              </section>

              <section v-else-if="tab === 'identity'" class="section-stack">
                <div class="surface-card form">
                  <div class="card-title">Store presentation</div>
                  <label class="field">
                    <span class="field-label">Title</span>
                    <input v-model="state.title" />
                  </label>
                  <label class="field">
                    <span class="field-label">Short description</span>
                    <textarea v-model="state.shortDescription" rows="3" />
                    <span class="field-help">This appears under the title and in search contexts. Keep it short and punchy.</span>
                  </label>
                  <label class="field">
                    <span class="field-label">About This Game</span>
                    <textarea v-model="state.aboutThisGame" rows="10" />
                    <span class="field-help">Use blank lines to create readable paragraphs in the long-form store copy.</span>
                  </label>
                </div>

                <div class="surface-card form">
                  <div class="card-title">Studio and release framing</div>
                  <div class="row-2">
                    <label class="field">
                      <span class="field-label">Developer</span>
                      <input v-model="state.developer" />
                    </label>
                    <label class="field">
                      <span class="field-label">Publisher</span>
                      <input v-model="state.publisher" />
                    </label>
                  </div>
                  <div class="row-2">
                    <label class="field">
                      <span class="field-label">Franchise</span>
                      <input v-model="state.franchise" />
                    </label>
                    <label class="field">
                      <span class="field-label">Release date</span>
                      <input v-model="state.releaseDate" placeholder="Coming Soon / Q3 2026 / Mar 5, 2026" />
                    </label>
                  </div>
                  <div class="row-2 toggles-inline">
                    <label class="toggle">
                      <input type="checkbox" v-model="state.earlyAccess" />
                      <span>Early Access</span>
                    </label>
                    <label class="toggle">
                      <input type="checkbox" v-model="state.comingSoon" />
                      <span>Coming Soon</span>
                    </label>
                  </div>
                </div>

                <div class="surface-card form">
                  <div class="card-title">Links and disclosure</div>
                  <label class="field">
                    <span class="field-label">Website URL</span>
                    <input v-model="state.websiteUrl" placeholder="https://example.com" />
                  </label>
                  <label class="field">
                    <span class="field-label">Mature content description</span>
                    <textarea v-model="state.matureContent" rows="3" />
                    <span class="field-help">Leave blank if the page should not show a content disclosure block.</span>
                  </label>
                </div>
              </section>

              <section v-else-if="tab === 'assets'" class="section-stack">
                <div class="surface-card" v-for="(specs, group) in groupedAssetSpecs" :key="group">
                  <div class="card-title">{{ ASSET_GROUPS[group as keyof typeof ASSET_GROUPS] }}</div>
                  <div class="asset-grid">
                    <div v-for="spec in specs" :key="spec.key" class="asset-row">
                      <AssetDropZone
                        :width="spec.width"
                        :height="spec.height"
                        :label="spec.label"
                        :model-value="state.assetKeys[spec.key]"
                        @update:model-value="(value) => state.assetKeys[spec.key] = value"
                      />
                      <div class="asset-meta">
                        <div class="asset-meta-title">
                          {{ spec.label }}
                          <span v-if="spec.required" class="req-badge">required</span>
                        </div>
                        <div class="asset-meta-dims">{{ spec.width }} x {{ spec.height }} · {{ spec.format }}</div>
                        <div class="asset-meta-desc">{{ spec.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section v-else-if="tab === 'media'" class="section-stack">
                <div class="surface-card">
                  <div class="card-title">Add to gallery</div>
                  <div class="media-toolbar">
                    <label class="btn">
                      Add screenshots
                      <input type="file" accept="image/*" multiple hidden @change="(event) => { addScreenshots((event.target as HTMLInputElement).files); (event.target as HTMLInputElement).value = '' }" />
                    </label>
                    <button class="btn ghost" @click="addVideo">Add video slot</button>
                    <div class="toolbar-note">Order here matches the gallery preview immediately.</div>
                  </div>
                </div>

                <div class="surface-card">
                  <div class="card-title">Gallery order</div>
                  <ul v-if="state.mediaOrder.length" class="media-list">
                    <li v-for="(item, index) in state.mediaOrder" :key="item.id" class="media-row">
                      <div class="media-row-main">
                        <span class="media-index">{{ index + 1 }}</span>
                        <div class="media-copy">
                          <span class="media-kind">{{ item.kind === 'video' ? 'Video' : 'Screenshot' }}</span>
                          <span class="media-meta">
                            {{ item.kind === 'video' ? (item.videoUrl || 'Paste an embed URL below') : 'Stored in the local asset library' }}
                          </span>
                        </div>
                      </div>
                      <input
                        v-if="item.kind === 'video'"
                        v-model="item.videoUrl"
                        placeholder="Embed URL (YouTube /embed/... or .mp4)"
                        class="video-input"
                      />
                      <div class="media-buttons">
                        <button class="mini-btn" :disabled="index === 0" @click="moveMedia(index, -1)">Move up</button>
                        <button class="mini-btn" :disabled="index === state.mediaOrder.length - 1" @click="moveMedia(index, 1)">Move down</button>
                        <button class="mini-btn danger" @click="removeMedia(index)">Remove</button>
                      </div>
                    </li>
                  </ul>
                  <p v-else class="empty-hint">No media yet. Add screenshots or a trailer slot to populate the gallery preview.</p>
                </div>
              </section>

              <section v-else-if="tab === 'taxonomy'" class="section-stack">
                <div class="surface-card form">
                  <div class="card-title">Genres</div>
                  <div class="chip-grid">
                    <button
                      v-for="genre in COMMON_GENRES"
                      :key="genre"
                      class="chip"
                      :class="{ active: state.genres.includes(genre) }"
                      @click="toggleList('genres', genre)"
                    >{{ genre }}</button>
                  </div>
                </div>

                <div class="surface-card form">
                  <div class="card-title">User tags</div>
                  <div class="tag-editor">
                    <span v-for="tag in state.tags" :key="tag" class="tag-pill">
                      {{ tag }}
                      <button class="tag-x" @click="removeTag(tag)">x</button>
                    </span>
                  </div>
                  <div class="tag-add">
                    <input v-model="newTag" placeholder="Add tag and press Enter" @keydown.enter.prevent="addTag" />
                    <button class="btn ghost" @click="addTag">Add tag</button>
                  </div>
                  <div class="field-help">Three or more strong tags makes the page feel much closer to a real Steam listing.</div>
                </div>

                <div class="surface-card form">
                  <div class="card-title">Features</div>
                  <div class="chip-grid">
                    <button
                      v-for="feature in COMMON_FEATURES"
                      :key="feature"
                      class="chip"
                      :class="{ active: state.features.includes(feature) }"
                      @click="toggleList('features', feature)"
                    >{{ feature }}</button>
                  </div>
                </div>
              </section>

              <section v-else-if="tab === 'commerce'" class="section-stack">
                <div class="surface-card form">
                  <div class="card-title">Purchase area</div>
                  <label class="toggle">
                    <input type="checkbox" v-model="state.hasPrice" />
                    <span>Price is set</span>
                  </label>
                  <div class="row-2">
                    <label class="field">
                      <span class="field-label">Price (USD)</span>
                      <input :disabled="!state.hasPrice" :value="formatCents(state.priceCents)" @input="(event) => setPriceDollars((event.target as HTMLInputElement).value)" type="number" step="0.01" />
                    </label>
                    <label class="field">
                      <span class="field-label">Discount %</span>
                      <input v-model.number="state.discountPct" type="number" min="0" max="100" :disabled="!state.hasPrice" />
                    </label>
                  </div>
                  <div class="row-2 toggles-inline">
                    <label class="toggle">
                      <input type="checkbox" v-model="state.earlyAccess" />
                      <span>Early Access</span>
                    </label>
                    <label class="toggle">
                      <input type="checkbox" v-model="state.comingSoon" />
                      <span>Coming Soon</span>
                    </label>
                  </div>
                  <div class="price-preview">
                    <span class="price-preview-label">Preview state</span>
                    <strong>{{ pricePreview }}</strong>
                  </div>
                </div>
              </section>

              <section v-else-if="tab === 'reviews'" class="section-stack">
                <div class="surface-card form">
                  <div class="card-title">Review summary</div>
                  <label class="field">
                    <span class="field-label">All-time summary</span>
                    <select v-model="state.reviews.summary">
                      <option v-for="review in REVIEW_SUMMARIES" :key="review">{{ review }}</option>
                    </select>
                  </label>
                  <div class="row-2">
                    <label class="field">
                      <span class="field-label">Total review count</span>
                      <input v-model.number="state.reviews.totalCount" type="number" min="0" />
                    </label>
                    <label class="field">
                      <span class="field-label">% positive</span>
                      <input v-model.number="state.reviews.positivePct" type="number" min="0" max="100" />
                    </label>
                  </div>
                  <label class="field">
                    <span class="field-label">Recent summary</span>
                    <select v-model="state.reviews.recentSummary">
                      <option :value="undefined">None</option>
                      <option v-for="review in REVIEW_SUMMARIES" :key="review">{{ review }}</option>
                    </select>
                  </label>
                  <label class="field">
                    <span class="field-label">Recent review count</span>
                    <input v-model.number="state.reviews.recentCount" type="number" min="0" />
                  </label>
                </div>
              </section>

              <section v-else-if="tab === 'requirements'" class="section-stack">
                <div v-for="key in ['windowsMin', 'windowsRec', 'macMin', 'macRec', 'linuxMin', 'linuxRec'] as const" :key="key" class="surface-card form">
                  <div class="req-header">
                    <div>
                      <div class="card-title req-title">{{ key }}</div>
                      <div class="field-help">Toggle this block on only when you want it visible in the preview.</div>
                    </div>
                    <label class="toggle">
                      <input type="checkbox" :checked="!!getReq(key)" @change="toggleReqBlock(key)" />
                      <span>{{ getReq(key) ? 'Configured' : 'Hidden' }}</span>
                    </label>
                  </div>
                  <div v-if="getReq(key)" class="reqs-inputs">
                    <input v-model="(getReq(key) as SystemReqsOS).os" placeholder="OS (for example Windows 10 64-bit)" />
                    <input v-model="(getReq(key) as SystemReqsOS).processor" placeholder="Processor" />
                    <input v-model="(getReq(key) as SystemReqsOS).memory" placeholder="Memory (for example 8 GB RAM)" />
                    <input v-model="(getReq(key) as SystemReqsOS).graphics" placeholder="Graphics" />
                    <input v-if="key.startsWith('windows')" v-model="(getReq(key) as SystemReqsOS).directX" placeholder="DirectX (for example Version 11)" />
                    <input v-model="(getReq(key) as SystemReqsOS).storage" placeholder="Storage (for example 50 GB available space)" />
                    <input v-model="(getReq(key) as SystemReqsOS).additional" placeholder="Additional notes (optional)" />
                  </div>
                </div>
              </section>

              <section v-else-if="tab === 'languages'" class="section-stack">
                <div class="surface-card form">
                  <div class="lang-header">
                    <span>Language</span>
                    <span>UI</span>
                    <span>Audio</span>
                    <span>Subs</span>
                    <span></span>
                  </div>
                  <div v-for="(lang, index) in state.languages" :key="index" class="lang-row">
                    <input v-model="lang.name" placeholder="Language name" />
                    <input type="checkbox" v-model="lang.interface" />
                    <input type="checkbox" v-model="lang.fullAudio" />
                    <input type="checkbox" v-model="lang.subtitles" />
                    <button class="mini-btn danger" @click="removeLanguage(index)">Remove</button>
                  </div>
                  <button class="btn ghost" @click="addLanguage">Add language</button>
                </div>
              </section>

              <section v-else-if="tab === 'data'" class="section-stack">
                <div class="surface-card form">
                  <div class="card-title">Export current project</div>
                  <div class="data-actions">
                    <button class="btn" @click="showExport">{{ exportView ? 'Refresh export' : 'Show JSON export' }}</button>
                    <button class="btn ghost" @click="copyExport" :disabled="!exportView">Copy export</button>
                  </div>
                  <textarea v-if="exportView" :value="exportView" readonly rows="14" />
                  <div v-else class="field-help">Generate the export only when you need it, so this section stays lightweight while editing.</div>
                </div>

                <div class="surface-card form">
                  <div class="card-title">Import JSON</div>
                  <textarea v-model="importText" rows="7" placeholder="Paste project JSON here" />
                  <div class="data-actions">
                    <button class="btn" :disabled="!importText.trim()" @click="doImport">Import project</button>
                    <span class="field-help">Import replaces the current project state but keeps the editor open so you can inspect changes.</span>
                  </div>
                </div>

                <div class="surface-card form danger-card">
                  <div class="card-title">Reset everything</div>
                  <div class="field-help">This clears project text plus stored image assets from local browser storage.</div>
                  <div v-if="!resetArmed" class="data-actions">
                    <button class="btn danger" @click="resetArmed = true">Start reset</button>
                  </div>
                  <div v-else class="reset-confirm">
                    <label class="field">
                      <span class="field-label">Type RESET to confirm</span>
                      <input v-model="resetPhrase" placeholder="RESET" />
                    </label>
                    <div class="data-actions">
                      <button class="btn danger" :disabled="resetPhrase !== 'RESET'" @click="doReset">Reset project</button>
                      <button class="btn ghost" @click="dismissReset">Cancel</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </aside>
    <div class="drawer-backdrop" :style="backdropStyle" @click="open = false" />
  </div>
</template>

<style scoped>
/* Drawer root + backdrop + slide — the state-driven bits are in the script. */
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  background: #0c131b;
  border-left: 1px solid #000;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  color: #c7d5e0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  background: linear-gradient(180deg, #171a21, #101822);
  border-bottom: 1px solid #000;
}

.drawer-header-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #67c1f5;
}

.drawer-subtitle {
  font-size: 22px;
  color: #fff;
  line-height: 1.1;
}

.drawer-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.autosave-pill {
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(117, 176, 34, 0.12);
  border: 1px solid rgba(117, 176, 34, 0.35);
  color: #beee11;
  font-size: 12px;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.close-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid #223242;
  color: #c7d5e0;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
}

.close-btn:hover {
  color: #fff;
  border-color: #67c1f5;
}

.drawer-body {
  flex: 1;
  min-height: 0;
}

.drawer-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: 100%;
}

.drawer-sidebar {
  padding: 24px;
  background: linear-gradient(180deg, #0d151e, #0a1118);
  border-right: 1px solid #111820;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  background: rgba(16, 24, 34, 0.95);
  border: 1px solid #1f2b38;
  border-radius: 12px;
  padding: 16px;
}

.sidebar-kicker,
.section-kicker,
.field-label,
.card-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-kicker,
.section-kicker,
.field-label {
  color: #67c1f5;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-progress-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-end;
}

.project-progress-value {
  font-size: 36px;
  color: #fff;
  line-height: 1;
}

.project-progress-label {
  font-size: 13px;
  color: #8f98a0;
}

.project-progress-meta {
  font-size: 13px;
  color: #8f98a0;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-progress-bar {
  height: 8px;
  background: #060a0f;
  border-radius: 999px;
  overflow: hidden;
}

.project-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #75b022, #beee11);
}

.project-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: #8f98a0;
}

.project-meta-row strong {
  color: #c7d5e0;
  font-weight: 600;
  text-align: right;
}

.section-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-nav-btn {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #223242;
  background: rgba(11, 18, 24, 0.96);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, transform 0.15s, background 0.15s;
}

.section-nav-btn:hover {
  border-color: #67c1f5;
  background: rgba(17, 28, 38, 0.98);
}

.section-nav-btn.active {
  border-color: #67c1f5;
  background: linear-gradient(180deg, rgba(30, 62, 82, 0.95), rgba(11, 18, 24, 0.98));
  box-shadow: inset 0 0 0 1px rgba(103, 193, 245, 0.15);
}

.section-nav-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-nav-label {
  color: #fff;
  font-size: 14px;
}

.section-nav-desc {
  color: #8f98a0;
  font-size: 12px;
  line-height: 1.45;
}

.drawer-content {
  min-width: 0;
  padding: 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid #223242;
  font-size: 14px;
}

.notice.info {
  background: rgba(71, 191, 255, 0.08);
  border-color: rgba(71, 191, 255, 0.3);
}

.notice.success {
  background: rgba(117, 176, 34, 0.08);
  border-color: rgba(117, 176, 34, 0.35);
}

.notice.error {
  background: rgba(163, 76, 37, 0.12);
  border-color: rgba(163, 76, 37, 0.45);
}

.notice-close {
  background: none;
  border: none;
  color: #c7d5e0;
  cursor: pointer;
  font-size: 13px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
}

.section-header-copy {
  max-width: 720px;
}

.section-title {
  margin: 6px 0 8px;
  font-size: 34px;
  line-height: 1.05;
  color: #fff;
}

.section-description {
  margin: 0;
  color: #8f98a0;
  font-size: 16px;
  line-height: 1.5;
}

.section-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  min-width: 0;
}

.fact-card {
  background: rgba(10, 16, 22, 0.9);
  border: 1px solid #1f2b38;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fact-label {
  font-size: 12px;
  color: #8f98a0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.fact-value {
  font-size: 17px;
  color: #fff;
  font-weight: 600;
}

.editor-surface {
  min-height: 0;
}

.section-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.surface-card {
  background: linear-gradient(180deg, rgba(17, 25, 34, 0.98), rgba(10, 16, 22, 0.98));
  border: 1px solid #1f2b38;
  border-radius: 14px;
  padding: 22px;
}

.danger-card {
  border-color: rgba(163, 76, 37, 0.45);
}

.card-title {
  color: #fff;
  margin-bottom: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-help {
  color: #7d8b97;
  font-size: 13px;
  line-height: 1.45;
}

.row-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.toggles-inline {
  align-items: stretch;
}

.form input,
.form textarea,
.form select {
  background: #091019;
  border: 1px solid #223242;
  color: #c7d5e0;
  padding: 11px 13px;
  font-size: 14px;
  border-radius: 8px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}

.form input:focus,
.form textarea:focus,
.form select:focus {
  border-color: #67c1f5;
  box-shadow: 0 0 0 3px rgba(103, 193, 245, 0.12);
  background: #0b131d;
}

.form textarea {
  resize: vertical;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 10px 12px;
  background: rgba(9, 16, 25, 0.9);
  border: 1px solid #223242;
  border-radius: 10px;
}

.toggle span {
  color: #c7d5e0;
  font-size: 14px;
}

.toggle input {
  margin: 0;
}

.asset-grid {
  display: grid;
  gap: 14px;
}

.asset-row {
  display: grid;
  grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.asset-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.asset-meta-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #fff;
}

.asset-meta-dims {
  color: #67c1f5;
  font-family: "SF Mono", Consolas, monospace;
  font-size: 11px;
}

.asset-meta-desc {
  color: #8f98a0;
  line-height: 1.5;
  font-size: 14px;
}

.req-badge {
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(117, 176, 34, 0.14);
  color: #beee11;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.btn,
.mini-btn,
.chip {
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 15px;
  border-radius: 10px;
  background: linear-gradient(180deg, #75b022, #588a1b);
  color: #d2e885;
  font-size: 14px;
}

.btn:hover {
  color: #fff;
}

.btn.ghost {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid #223242;
  color: #c7d5e0;
}

.btn.ghost:hover {
  border-color: #67c1f5;
}

.btn.danger {
  background: linear-gradient(180deg, #b24d2d, #7e2c16);
  color: #fff;
}

.btn:disabled,
.mini-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.media-toolbar,
.data-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.toolbar-note {
  color: #8f98a0;
  font-size: 13px;
}

.media-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-row {
  border: 1px solid #223242;
  border-radius: 12px;
  background: rgba(9, 16, 25, 0.9);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-row-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.media-index {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(103, 193, 245, 0.14);
  color: #67c1f5;
  font-weight: 700;
}

.media-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.media-kind {
  color: #fff;
  font-size: 15px;
}

.media-meta {
  color: #8f98a0;
  font-size: 13px;
}

.video-input {
  width: 100%;
}

.media-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mini-btn {
  padding: 9px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #223242;
  color: #c7d5e0;
  font-size: 13px;
}

.mini-btn:hover:not(:disabled) {
  border-color: #67c1f5;
  color: #fff;
}

.mini-btn.danger {
  border-color: rgba(163, 76, 37, 0.45);
  color: #f0c0ae;
}

.empty-hint {
  margin: 0;
  color: #8f98a0;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(103, 193, 245, 0.12);
  color: #9ad7ff;
  font-size: 13px;
}

.chip.active {
  background: linear-gradient(180deg, #417a9b, #2c5b73);
  color: #fff;
}

.tag-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 11px;
  border-radius: 999px;
  background: rgba(103, 193, 245, 0.12);
  color: #9ad7ff;
  font-size: 13px;
}

.tag-x {
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

.tag-add {
  display: flex;
  gap: 10px;
}

.price-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  background: rgba(9, 16, 25, 0.95);
  border: 1px solid #223242;
}

.price-preview-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #8f98a0;
}

.req-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.req-title {
  margin-bottom: 8px;
}

.reqs-inputs {
  display: grid;
  gap: 10px;
}

.lang-header,
.lang-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 60px 60px 60px auto;
  gap: 10px;
  align-items: center;
}

.lang-header {
  color: #8f98a0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.reset-confirm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 1080px) {
  .drawer {
    width: 100vw;
  }

  .drawer-shell {
    grid-template-columns: 1fr;
  }

  .drawer-sidebar {
    border-right: none;
    border-bottom: 1px solid #111820;
  }

  .section-facts {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    min-width: 0;
  }
}

@media (max-width: 840px) {
  .drawer-header {
    padding: 14px 16px;
    align-items: flex-start;
    flex-direction: column;
  }

  .drawer-header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .drawer-content,
  .drawer-sidebar {
    padding: 18px;
  }

  .section-facts {
    width: 100%;
  }

  .asset-row,
  .row-2,
  .lang-header,
  .lang-row {
    grid-template-columns: 1fr;
  }

  .req-header {
    flex-direction: column;
  }

  .tag-add {
    flex-direction: column;
  }
}
</style>
