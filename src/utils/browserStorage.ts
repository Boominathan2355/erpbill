export type ThemeMode = 'light' | 'dark'

const hasWindow = typeof window !== 'undefined'
const hasDocument = typeof document !== 'undefined'

export const readJSONStorage = <T>(key: string, fallback: T): T => {
  if (!hasWindow) {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) as T : fallback
  } catch {
    return fallback
  }
}

export const writeJSONStorage = <T>(key: string, value: T): void => {
  if (!hasWindow) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore environments that block storage access.
  }
}

export const readStringStorage = (key: string, fallback: string): string => {
  if (!hasWindow) {
    return fallback
  }

  try {
    return window.localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

export const writeStringStorage = (key: string, value: string): void => {
  if (!hasWindow) {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore environments that block storage access.
  }
}

export const readThemeMode = (): ThemeMode => {
  const fallback: ThemeMode = 'light'

  if (!hasWindow) {
    return fallback
  }

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
  if (!hasDocument) {
    return
  }

  try {
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    // Ignore document access issues in restricted contexts.
  }
}