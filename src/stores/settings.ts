import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { BusinessProfile } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import { useBusinessStore } from './business'

// Global application and active business settings
export const useSettingsStore = defineStore('settings', () => {
  const businessStore = useBusinessStore()

  const profile = computed(() => businessStore.activeBusiness?.profile || {} as BusinessProfile)

  const taxInclusive = ref<boolean>(
    readJSONStorage<boolean>('settings_tax_inclusive', true)
  )

  const updateProfile = (newProfile: Partial<BusinessProfile>) => {
    businessStore.updateActiveProfile(newProfile)
  }

  const setTaxPreference = (value: boolean) => {
    taxInclusive.value = value
  }

  // Persist tax preference
  watch(taxInclusive, (newVal) => {
    writeJSONStorage('settings_tax_inclusive', newVal)
  })

  return { profile, taxInclusive, updateProfile, setTaxPreference }
})
