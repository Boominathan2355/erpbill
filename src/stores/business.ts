import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { Business, BusinessProfile } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'

export const useBusinessStore = defineStore('business', () => {
  // Try to find existing profile for migration
  const oldProfile = readJSONStorage<BusinessProfile | null>('settings', null)
  
  const initialBusinesses: Business[] = oldProfile ? [
    { 
      id: 'default', 
      name: oldProfile.name || 'Primary Business', 
      profile: oldProfile 
    }
  ] : [
    {
      id: 'default',
      name: 'Primary Business',
      profile: {
        name: 'Your Business Name',
        address: 'Business Address, Chennai, Tamil Nadu',
        email: 'billing@yourbusiness.com',
        phone: '+91 0000000000',
        gstin: '33AABCU1234F1Z5',
        stateCode: '33'
      }
    }
  ]

  const businesses = ref<Business[]>(readJSONStorage<Business[]>('businesses', initialBusinesses))
  const activeBusinessId = ref<string>(readJSONStorage<string>('active_business_id', 'default'))

  const activeBusiness = computed(() => {
    return businesses.value.find(b => b.id === activeBusinessId.value) || businesses.value[0]
  })

  const switchBusiness = (id: string) => {
    if (businesses.value.some(b => b.id === id)) {
      activeBusinessId.value = id
      // Force reload to ensure other stores re-initialize
      window.location.reload()
    }
  }

  const canAddBusiness = computed(() => businesses.value.length < 5)

  const addBusiness = (name: string) => {
    if (!canAddBusiness.value) return ''
    const newId = `biz_${crypto.randomUUID().slice(0, 8)}`
    const baseBiz = businesses.value[0]
    if (!baseBiz) return '' // Should never happen
    
    const newBusiness: Business = {
      id: newId,
      name,
      profile: { ...baseBiz.profile, name }
    }
    businesses.value.push(newBusiness)
    return newId
  }

  const updateActiveProfile = (profile: Partial<BusinessProfile>) => {
    const biz = businesses.value.find(b => b.id === activeBusinessId.value)
    if (biz) {
      biz.profile = { ...biz.profile, ...profile }
      biz.name = biz.profile.name || biz.name
    }
  }

  const deleteBusiness = (id: string) => {
    if (businesses.value.length <= 1) return
    businesses.value = businesses.value.filter(b => b.id !== id)
    if (activeBusinessId.value === id && businesses.value.length > 0) {
      activeBusinessId.value = businesses.value[0]!.id
      window.location.reload()
    }
  }

  // Persist
  watch(businesses, (newVal) => {
    writeJSONStorage('businesses', newVal)
  }, { deep: true })

  watch(activeBusinessId, (newId) => {
    writeJSONStorage('active_business_id', newId)
  })

  return {
    businesses,
    activeBusinessId,
    activeBusiness,
    canAddBusiness,
    switchBusiness,
    addBusiness,
    updateActiveProfile,
    deleteBusiness
  }
})
