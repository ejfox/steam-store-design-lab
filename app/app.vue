<script setup lang="ts">
import { useProject } from '~/composables/useProject'
import { useAssetUrl } from '~/composables/useAssets'

const { state } = useProject()
const pageBgUrl = useAssetUrl(() => state.value.assetKeys.pageBackground)

const drawerOpen = ref(false)

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.key === 'e' && !e.metaKey && !e.ctrlKey) {
      drawerOpen.value = !drawerOpen.value
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})

const breadcrumb = computed(() => {
  const genre = state.value.genres[0] ?? 'All Games'
  const label = genre === 'Action' || genre === 'Adventure' || genre === 'Casual' ||
                genre === 'RPG' || genre === 'Strategy' || genre === 'Simulation'
    ? `${genre} Games` : genre
  return ['All Games', label, state.value.title]
})
</script>

<template>
  <div class="app-shell">
    <StoreHeader />

    <main class="page" :class="{ 'has-bg': !!pageBgUrl }">
      <div v-if="pageBgUrl" class="page-bg" :style="{ backgroundImage: `url(${pageBgUrl})` }" />
      <div class="page-inner">
        <!-- Title row: breadcrumb + title on the left, Community Hub button on the right -->
        <div class="title-row">
          <div class="title-left">
            <nav class="breadcrumb">
              <template v-for="(b, i) in breadcrumb" :key="i">
                <a v-if="i < breadcrumb.length - 1" class="crumb">{{ b }}</a>
                <span v-else class="crumb active">{{ b }}</span>
                <span v-if="i < breadcrumb.length - 1" class="sep">&gt;</span>
              </template>
            </nav>
            <h1 class="game-title">{{ state.title }}</h1>
          </div>
          <div class="title-right">
            <button class="community-hub">Community Hub</button>
          </div>
        </div>

        <!-- Main media + right rail -->
        <div class="main-grid">
          <div class="main-grid-left">
            <MediaGallery />
          </div>
          <RightRail />
        </div>

        <!-- Wishlist / follow / ignore row, or purchase box for released games -->
        <WishlistBar />

        <AboutThisGame />
        <SystemRequirements />
      </div>
    </main>

    <ClientFooter />

    <button class="edit-fab" @click="drawerOpen = true" :class="{ hidden: drawerOpen }" title="Edit (press E)">
      <span class="fab-icon">✎</span>
      <span class="fab-label">Edit page</span>
      <span class="fab-key">E</span>
    </button>

    <AdminDrawer v-model:open="drawerOpen" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--dream-bg-root);
}
.page {
  position: relative;
  flex: 1;
  background: radial-gradient(farthest-side at top center, #2a475e 0%, #1b2838 80%);
  overflow: hidden;
}
.page-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center top;
  opacity: 0.45;
  pointer-events: none;
  z-index: 0;
}
.page-inner {
  position: relative;
  max-width: 940px;
  margin: 0 auto;
  padding: 14px 10px 48px;
  z-index: 1;
}

.title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}
.title-left { min-width: 0; }
.breadcrumb {
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: #acb2b8;
  margin-bottom: 4px;
}
.crumb { color: #67c1f5; cursor: pointer; }
.crumb.active { color: #c7d5e0; cursor: default; }
.sep { color: #556772; }
.game-title {
  font-size: 26px;
  color: #fff;
  font-weight: 300;
  margin: 0;
  letter-spacing: 0.3px;
}

.community-hub {
  background: linear-gradient(to bottom, rgba(103,193,245,0.18), rgba(103,193,245,0.08));
  border: 1px solid rgba(103,193,245,0.25);
  color: #67c1f5;
  font-family: inherit;
  font-size: 13px;
  padding: 7px 16px;
  cursor: pointer;
  border-radius: 2px;
}
.community-hub:hover {
  background: linear-gradient(to bottom, #66c0f4, #417a9b);
  color: #fff;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 324px;
  gap: 12px;
}
.main-grid-left { min-width: 0; }

.edit-fab {
  position: fixed;
  bottom: 44px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(to bottom, #75b022, #588a1b);
  color: #d2e885;
  padding: 10px 16px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  border-radius: 3px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.3);
  z-index: 900;
  transition: opacity 0.2s, transform 0.2s;
}
.edit-fab:hover { color: #fff; transform: translateY(-1px); }
.edit-fab.hidden { opacity: 0; pointer-events: none; transform: translateY(20px); }
.fab-icon { font-size: 16px; }
.fab-key {
  background: rgba(0,0,0,0.3);
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 10px;
  font-family: "SF Mono", Consolas, monospace;
}
</style>
