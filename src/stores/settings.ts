import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { BusinessProfile } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'

export const useSettingsStore = defineStore('settings', () => {
  const profile = ref<BusinessProfile>(
    readJSONStorage<BusinessProfile>('settings', {
      name: 'Your Business Name',
      address: 'Business Address, City, State',
      email: 'billing@yourbusiness.com',
      phone: '+91 0000000000',
      gstin: '27AABCU1234F1Z5'
    })
  )

  const updateProfile = (newProfile: Partial<BusinessProfile>) => {
    profile.value = { ...profile.value, ...newProfile }
  }

  watch(profile, (newProfile) => {
    writeJSONStorage('settings', newProfile)
  }, { deep: true })

  return { profile, updateProfile }
})
