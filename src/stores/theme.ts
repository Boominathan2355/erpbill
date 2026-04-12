import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { applyTheme, readThemeMode, writeStringStorage } from '../utils/browserStorage'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'light' | 'dark'>(readThemeMode())

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  // Watch for changes and update DOM and LocalStorage
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    writeStringStorage('theme', newTheme)
  }, { immediate: true })

  return {
    theme,
    toggleTheme
  }
})
