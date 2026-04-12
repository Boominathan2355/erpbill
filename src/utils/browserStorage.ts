export type ThemeMode = 'light' | 'dark'

const hasWindow = typeof window !== 'undefined'
const hasDocument = typeof document !== 'undefined'

const getSafeStorage = (): Storage | null => {
  if (!hasWindow) return null
  try {
    const storage = window.localStorage
    const x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return storage
  } catch (e) {
    return null
  }
}

const safeStorage = getSafeStorage()

export const readJSONStorage = <T>(key: string, fallback: T): T => {
  if (!safeStorage) return fallback

  try {
    const rawValue = safeStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) as T : fallback
  } catch {
    return fallback
  }
}

export const writeJSONStorage = <T>(key: string, value: T): void => {
  if (!safeStorage) return

  try {
    safeStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore environments that block storage access.
  }
}

export const readStringStorage = (key: string, fallback: string): string => {
  if (!safeStorage) return fallback

  try {
    return safeStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

export const writeStringStorage = (key: string, value: string): void => {
  if (!safeStorage) return

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