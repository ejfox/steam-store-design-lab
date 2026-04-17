<script setup lang="ts">
import { useProject } from '~/composables/useProject'

const { state } = useProject()

/** Fabricated URL path that resembles what the real Dream client shows. */
const fakeUrl = computed(() => {
  const slug = state.value.title
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/^$/, 'Untitled')
  return `https://store.dreampowered.com/app/1172620/${slug}/`
})
</script>

<template>
  <header class="client-chrome">
    <!-- Window chrome (macOS traffic lights + client tabs + user area) -->
    <div class="window-bar">
      <div class="traffic-lights">
        <span class="tl tl-red" />
        <span class="tl tl-yellow" />
        <span class="tl tl-green" />
      </div>
      <nav class="client-tabs">
        <a class="client-tab active">STORE</a>
        <a class="client-tab">LIBRARY</a>
        <a class="client-tab">COMMUNITY</a>
        <a class="client-tab username">EJFOX</a>
      </nav>
      <div class="window-spacer" />
      <div class="window-right">
        <span class="wr-icon">🔊</span>
        <span class="wr-icon notif">🔔</span>
        <span class="wr-user">
          <span class="wr-avatar" />
          <span class="wr-name">ejfox</span>
          <span class="wr-caret">▾</span>
        </span>
        <span class="wr-icon mini">◱</span>
      </div>
    </div>

    <!-- URL bar -->
    <div class="url-bar">
      <span class="url-btn">‹</span>
      <span class="url-btn">›</span>
      <span class="url-btn refresh">↻</span>
      <span class="url-lock">🔒</span>
      <span class="url-path">{{ fakeUrl }}</span>
    </div>

    <!-- Store sub-nav -->
    <div class="subnav">
      <div class="subnav-inner">
        <div class="subnav-left">
          <a class="sn-item">Browse <span class="sn-caret">▾</span></a>
          <a class="sn-item">Recommendations <span class="sn-caret">▾</span></a>
          <a class="sn-item">Categories <span class="sn-caret">▾</span></a>
          <a class="sn-item">Hardware <span class="sn-caret">▾</span></a>
          <a class="sn-item">Ways to Play <span class="sn-caret">▾</span></a>
          <a class="sn-item">Special Sections <span class="sn-caret">▾</span></a>
        </div>
        <div class="subnav-right">
          <div class="search-box">
            <input class="search-input" placeholder="Search the store" />
            <button class="search-btn">🔍</button>
          </div>
          <a class="wishlist-link">
            <span class="star">★</span>
            Wishlist <span class="wl-count">46</span>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.client-chrome {
  background: #171a21;
  user-select: none;
}

/* ── Window bar ─────────────────────────── */
.window-bar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 14px;
  background: #0c0f14;
  border-bottom: 1px solid #000;
  gap: 12px;
}
.traffic-lights { display: flex; gap: 8px; }
.tl {
  width: 12px; height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.tl-red { background: #ff5f57; }
.tl-yellow { background: #ffbd2e; }
.tl-green { background: #28ca42; }

.client-tabs {
  display: flex;
  gap: 28px;
  margin-left: 16px;
}
.client-tab {
  color: #8f98a0;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 6px 0;
  border-bottom: 3px solid transparent;
  position: relative;
  top: 1px;
}
.client-tab:hover { color: #c7d5e0; }
.client-tab.active {
  color: #66c0f4;
  border-bottom-color: #66c0f4;
}
.client-tab.username { text-transform: uppercase; }

.window-spacer { flex: 1; }

.window-right {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8f98a0;
  font-size: 12px;
}
.wr-icon {
  width: 28px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(103,193,245,0.08);
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}
.wr-icon.notif { background: #5d7c1e; color: #beee11; }
.wr-icon:hover { background: rgba(103,193,245,0.2); }
.wr-user {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  cursor: pointer;
  background: rgba(103,193,245,0.05);
  border-radius: 3px;
}
.wr-user:hover { background: rgba(103,193,245,0.15); }
.wr-avatar {
  width: 18px; height: 18px;
  background: linear-gradient(135deg, #67c1f5, #1a44c2);
  border-radius: 2px;
}
.wr-name { color: #c7d5e0; font-size: 12px; }
.wr-caret { font-size: 8px; color: #67c1f5; }

/* ── URL bar ─────────────────────────── */
.url-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 14px;
  background: #0a0d12;
  border-bottom: 1px solid #000;
  color: #67c1f5;
  font-size: 11px;
  font-family: "SF Mono", "Consolas", monospace;
}
.url-btn {
  color: #8f98a0;
  cursor: pointer;
  padding: 0 4px;
  font-size: 14px;
}
.url-btn:hover { color: #fff; }
.url-btn.refresh { font-size: 12px; }
.url-lock { color: #66c0f4; font-size: 10px; }
.url-path { color: #8f98a0; }

/* ── Sub-nav ─────────────────────────── */
.subnav {
  background: linear-gradient(to bottom, #1b2838 0%, #1b2838 100%);
  border-bottom: 1px solid #000;
  padding: 10px 0;
}
.subnav-inner {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.subnav-left {
  display: flex;
  gap: 4px;
}
.sn-item {
  color: #c7d5e0;
  font-size: 14px;
  padding: 6px 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 2px;
}
.sn-item:hover { background: rgba(103,193,245,0.1); color: #fff; }
.sn-caret { font-size: 8px; color: #67c1f5; }

.subnav-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.search-box {
  display: flex;
  background: rgba(255,255,255,0.05);
  border-radius: 2px;
  height: 30px;
  align-items: center;
}
.search-input {
  background: transparent;
  border: none;
  color: #fff;
  padding: 0 12px;
  width: 210px;
  outline: none;
  font-size: 13px;
  font-family: inherit;
}
.search-input::placeholder { color: #67c1f5; font-style: italic; }
.search-btn {
  background: #66c0f4;
  border: none;
  color: #1b2838;
  padding: 0 10px;
  cursor: pointer;
  height: 100%;
  font-size: 12px;
  border-radius: 0 2px 2px 0;
}
.wishlist-link {
  color: #67c1f5;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.wishlist-link:hover { color: #fff; }
.star { color: #67c1f5; }
.wl-count { color: #8f98a0; font-size: 12px; margin-left: 2px; }
</style>
