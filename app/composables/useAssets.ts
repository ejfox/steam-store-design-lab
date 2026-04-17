import { get, set, del, keys as idbKeys } from 'idb-keyval'

/**
 * Asset store: binary blobs (images/videos) go in IndexedDB keyed by a short id.
 * Components receive a blob URL that auto-revokes on unmount.
 *
 * Keys have the shape `asset:<uuid>`; the short uuid is what's stored in ProjectState.
 */

const urlCache = new Map<string, string>()

function makeId(): string {
  return 'a_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export async function saveAsset(file: File | Blob): Promise<string> {
  const id = makeId()
  await set(`asset:${id}`, file)
  return id
}

export async function loadAssetUrl(id: string | undefined | null): Promise<string | null> {
  if (!id) return null
  if (urlCache.has(id)) return urlCache.get(id)!
  const blob = await get<Blob>(`asset:${id}`)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(id, url)
  return url
}

export async function deleteAsset(id: string | undefined | null) {
  if (!id) return
  const cached = urlCache.get(id)
  if (cached) {
    URL.revokeObjectURL(cached)
    urlCache.delete(id)
  }
  await del(`asset:${id}`)
}

/** Reactive helper: returns a ref<string|null> that resolves to the blob URL. */
export function useAssetUrl(idRef: MaybeRefOrGetter<string | undefined | null>) {
  const url = ref<string | null>(null)
  watchEffect(async () => {
    const id = toValue(idRef)
    url.value = await loadAssetUrl(id)
  })
  return url
}

/** Clear everything — useful for the admin "reset project" action. */
export async function wipeAssets() {
  const all = await idbKeys()
  for (const k of all) {
    if (typeof k === 'string' && k.startsWith('asset:')) await del(k)
  }
  for (const url of urlCache.values()) URL.revokeObjectURL(url)
  urlCache.clear()
}
