import { get, set, del, keys as idbKeys } from 'idb-keyval'
import type { ProjectState } from '~/utils/schema'

/**
 * Revisions are full-state snapshots persisted to IDB.
 * They reference asset IDs by key; if an asset is later wiped, the snapshot
 * still loads but images show the empty placeholder.
 *
 * Keys look like `rev:<id>`.
 */

export interface Revision {
  id: string
  createdAt: number
  label?: string
  auto?: boolean
  state: ProjectState
}

const KEY_PREFIX = 'rev:'
const MAX_AUTO = 10

function newId() {
  return 'r_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36)
}

export async function listRevisions(): Promise<Revision[]> {
  const all = await idbKeys()
  const revs: Revision[] = []
  for (const k of all) {
    if (typeof k === 'string' && k.startsWith(KEY_PREFIX)) {
      const rev = await get<Revision>(k)
      if (rev) revs.push(rev)
    }
  }
  return revs.sort((a, b) => b.createdAt - a.createdAt)
}

export async function saveRevision(state: ProjectState, opts: { label?: string; auto?: boolean } = {}): Promise<Revision> {
  const rev: Revision = {
    id: newId(),
    createdAt: Date.now(),
    label: opts.label,
    auto: opts.auto,
    state: JSON.parse(JSON.stringify(state)),
  }
  await set(KEY_PREFIX + rev.id, rev)
  if (opts.auto) await pruneAuto()
  return rev
}

export async function deleteRevision(id: string) {
  await del(KEY_PREFIX + id)
}

export async function renameRevision(id: string, label: string) {
  const rev = await get<Revision>(KEY_PREFIX + id)
  if (!rev) return
  rev.label = label
  await set(KEY_PREFIX + id, rev)
}

async function pruneAuto() {
  const all = await listRevisions()
  const autos = all.filter(r => r.auto).sort((a, b) => b.createdAt - a.createdAt)
  const extras = autos.slice(MAX_AUTO)
  for (const r of extras) await deleteRevision(r.id)
}

/** Reactive wrapper: returns a ref that re-reads IDB on `refresh()`. */
export function useRevisions() {
  const revisions = ref<Revision[]>([])
  const loading = ref(false)

  async function refresh() {
    loading.value = true
    try {
      revisions.value = await listRevisions()
    } finally {
      loading.value = false
    }
  }

  async function save(state: ProjectState, label?: string) {
    await saveRevision(state, { label })
    await refresh()
  }

  async function remove(id: string) {
    await deleteRevision(id)
    await refresh()
  }

  async function rename(id: string, label: string) {
    await renameRevision(id, label)
    await refresh()
  }

  onMounted(refresh)

  return { revisions, loading, refresh, save, remove, rename }
}
