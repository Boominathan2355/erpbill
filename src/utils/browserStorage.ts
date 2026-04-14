export type ThemeMode = 'light' | 'dark'

const hasWindow = typeof window !== 'undefined'
const hasDocument = typeof document !== 'undefined'

class InMemoryStorage implements Storage {
  private data: Record<string, string> = {}
  get length() { return Object.keys(this.data).length }
  clear() { this.data = {} }
  getItem(key: string) { return this.data[key] || null }
  key(index: number) { return Object.keys(this.data)[index] || null }
  removeItem(key: string) { delete this.data[key] }
  setItem(key: string, value: string) { this.data[key] = String(value) }
}

const getSafeStorage = (): Storage => {
  const fallback = new InMemoryStorage()
  if (!hasWindow) return fallback
  
  try {
    // Check if sessionStorage is even defined
    if (typeof window.sessionStorage === 'undefined') return fallback

    const storage = window.sessionStorage
    if (!storage) return fallback

    // Test for actual usability
    const x = `__storage_test_${Math.random()}_`
    storage.setItem(x, x)
    const result = storage.getItem(x)
    storage.removeItem(x)
    
    if (result !== x) return fallback
    
    return storage
  } catch (e) {
    console.warn('SessionStorage is blocked or unavailable. Falling back to in-memory storage.', e)
    return fallback
  }
}

const safeStorage = getSafeStorage()

export const readJSONStorage = <T>(key: string, fallback: T): T => {
  try {
    const rawValue = safeStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) as T : fallback
  } catch {
    return fallback
  }
}

export const writeJSONStorage = <T>(key: string, value: T): void => {
  try {
    safeStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore environments that block storage access.
  }
}

export const readStringStorage = (key: string, fallback: string): string => {
  try {
    return safeStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

export const writeStringStorage = (key: string, value: string): void => {
  try {
    safeStorage.setItem(key, value)
  } catch {
    // Ignore environments that block storage access.
  }
}

export const readThemeMode = (): ThemeMode => {
  const fallback: ThemeMode = 'light'

  if (!hasWindow) return fallback

  try {
    const storedTheme = readStringStorage('theme', '') as ThemeMode | ''
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    return fallback
  }

  return fallback
}

export const applyTheme = (theme: ThemeMode): void => {
  if (!hasDocument) return

  try {
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    // Ignore document access issues in restricted contexts.
  }
}