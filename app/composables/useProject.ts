import { defaultProject, type ProjectState } from '~/utils/schema'

const STORAGE_KEY = 'steam-lab:project:v1'

/**
 * Shared reactive project state, persisted to localStorage.
 * Binary assets (images/videos) live in IndexedDB — this store only holds their keys.
 */
export const useProject = () => {
  const state = useLocalStorage<ProjectState>(STORAGE_KEY, defaultProject(), {
    mergeDefaults: true,
  })

  function reset() {
    state.value = defaultProject()
  }

  function exportJson(): string {
    return JSON.stringify(state.value, null, 2)
  }

  function importJson(raw: string) {
    const parsed = JSON.parse(raw) as ProjectState
    state.value = { ...defaultProject(), ...parsed }
  }

  return { state, reset, exportJson, importJson }
}
