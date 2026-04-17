<script setup lang="ts">
import { useProject } from '~/composables/useProject'
import type { SystemReqsOS } from '~/utils/schema'

const { state } = useProject()

const osTabs = computed(() => {
  const out: Array<{ key: 'windows' | 'mac' | 'linux'; label: string; min?: SystemReqsOS; rec?: SystemReqsOS }> = []
  const req = state.value.systemRequirements
  if (req.windowsMin || req.windowsRec) out.push({ key: 'windows', label: 'Windows', min: req.windowsMin, rec: req.windowsRec })
  if (req.macMin || req.macRec) out.push({ key: 'mac', label: 'macOS', min: req.macMin, rec: req.macRec })
  if (req.linuxMin || req.linuxRec) out.push({ key: 'linux', label: 'DreamOS + Linux', min: req.linuxMin, rec: req.linuxRec })
  return out
})

const activeTab = ref<'windows' | 'mac' | 'linux'>('windows')
watch(osTabs, (tabs) => {
  if (tabs.length && !tabs.find(t => t.key === activeTab.value)) {
    activeTab.value = tabs[0]!.key
  }
}, { immediate: true })

const current = computed(() => osTabs.value.find(t => t.key === activeTab.value))

function reqRow(os: SystemReqsOS | undefined, key: keyof SystemReqsOS, label: string) {
  if (!os) return null
  const val = os[key]
  if (!val) return null
  return { label, val }
}

function rowsFor(os: SystemReqsOS | undefined) {
  return [
    reqRow(os, 'os', 'OS'),
    reqRow(os, 'processor', 'Processor'),
    reqRow(os, 'memory', 'Memory'),
    reqRow(os, 'graphics', 'Graphics'),
    reqRow(os, 'directX', 'DirectX'),
    reqRow(os, 'storage', 'Storage'),
    reqRow(os, 'additional', 'Additional Notes'),
  ].filter(Boolean) as Array<{ label: string; val: string }>
}
</script>

<template>
  <section v-if="osTabs.length" class="sysreq">
    <h2 class="section-title">System Requirements</h2>
    <div class="os-tabs" v-if="osTabs.length > 1">
      <button
        v-for="t in osTabs"
        :key="t.key"
        class="os-tab"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >{{ t.label }}</button>
    </div>
    <div class="reqs-grid" v-if="current">
      <div class="reqs-col">
        <h3 class="reqs-head">Minimum:</h3>
        <ul v-if="current.min">
          <li v-for="r in rowsFor(current.min)" :key="r.label">
            <strong>{{ r.label }}:</strong> {{ r.val }}
          </li>
        </ul>
        <p v-else class="empty">Not specified</p>
      </div>
      <div class="reqs-col">
        <h3 class="reqs-head">Recommended:</h3>
        <ul v-if="current.rec">
          <li v-for="r in rowsFor(current.rec)" :key="r.label">
            <strong>{{ r.label }}:</strong> {{ r.val }}
          </li>
        </ul>
        <p v-else class="empty">Not specified</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sysreq {
  margin-top: 28px;
  color: #acb2b8;
}
.section-title {
  color: #fff;
  font-size: 20px;
  font-weight: 100;
  border-bottom: 1px solid #223242;
  padding-bottom: 8px;
  margin: 0 0 14px;
}
.os-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 14px;
}
.os-tab {
  background: rgba(0,0,0,0.3);
  border: none;
  color: #67c1f5;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 13px;
}
.os-tab:hover { color: #fff; }
.os-tab.active {
  background: linear-gradient(to right, #417a9b 5%, #67c1f5 95%);
  color: #fff;
}
.reqs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.reqs-col ul { margin: 0; padding-left: 16px; }
.reqs-col li { font-size: 13px; line-height: 1.6; }
.reqs-col strong { color: #c7d5e0; font-weight: 500; }
.reqs-head {
  color: #fff;
  font-size: 14px;
  margin: 0 0 6px;
  font-weight: 400;
}
.empty { color: #546b81; font-style: italic; font-size: 13px; }
</style>
