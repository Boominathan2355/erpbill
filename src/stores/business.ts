import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { Business, BusinessProfile } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import api from '../utils/api'
import { useAuthStore } from './auth'

export const useBusinessStore = defineStore('business', () => {
  const authStore = useAuthStore()
  const businesses = ref<Business[]>([])
  const activeBusinessId = ref<string>(readJSONStorage<string>('active_business_id', ''))
  const isLoading = ref(false)

  // Update activeBusinessId if auth store has a businessId and we don't have one set
  watch(() => authStore.currentUser?.businessId, (newBizId) => {
    if (newBizId && !activeBusinessId.value) {
      activeBusinessId.value = newBizId
    }
  }, { immediate: true })

  const activeBusiness = computed(() => {
    return businesses.value.find(b => (b._id || b.id) === activeBusinessId.value) || businesses.value[0]
  })

  const fetchBusinesses = async (force = false) => {
    if (isLoading.value) return
    if (businesses.value.length > 0 && !force) return

    isLoading.value = true
    try {
      const response = await api.get('/businesses')
      businesses.value = response.data.data
      if (businesses.value.length > 0 && !activeBusinessId.value) {
        const firstBiz = businesses.value[0];
        activeBusinessId.value = (firstBiz?._id || firstBiz?.id) ?? '';
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      isLoading.value = false
    }
  }

  const addBusiness = async (name: string) => {
    try {
      const response = await api.post('/businesses', { name })
      const newBiz = response.data.data
      businesses.value.push(newBiz)
      return newBiz._id || newBiz.id
    } catch (error) {
      console.error('Failed to add business:', error)
      return ''
    }
  }

  const updateActiveProfile = async (profile: Partial<BusinessProfile>) => {
    const biz = businesses.value.find(b => (b._id || b.id) === activeBusinessId.value)
    if (biz) {
      try {
        const id = biz._id || biz.id
        const response = await api.put(`/businesses/${id}`, { profile: { ...biz.profile, ...profile } })
        const updatedBiz = response.data.data
        const index = businesses.value.findIndex(b => (b._id || b.id) === id)
        if (index !== -1) {
          businesses.value[index] = updatedBiz
        }
      } catch (error) {
        console.error('Failed to update business profile:', error)
      }
    }
  }

  const deleteBusinessById = async (id: string) => {
    try {
      await api.delete(`/businesses/${id}`)
      businesses.value = businesses.value.filter(b => (b._id || b.id) !== id)
      if (activeBusinessId.value === id && businesses.value.length > 0) {
        const firstBiz = businesses.value[0];
        activeBusinessId.value = (firstBiz?._id || firstBiz?.id) ?? '';
      }
    } catch (error) {
      console.error('Failed to delete business:', error)
    }
  }

  const switchBusiness = (id: string) => {
    if (businesses.value.some(b => (b._id || b.id) === id)) {
      activeBusinessId.value = id
      writeJSONStorage('active_business_id', id)
      // Force reload to ensure other stores re-initialize with new business context
      window.location.reload()
    }
  }

  const canAddBusiness = computed(() => businesses.value.length < 5)

  // Persist only session context
  watch(activeBusinessId, (newId) => {
    writeJSONStorage('active_business_id', newId)
  })

  return {
    businesses,
    activeBusinessId,
    activeBusiness,
    canAddBusiness,
    fetchBusinesses,
    switchBusiness,
    addBusiness,
    updateActiveProfile,
    deleteBusiness: deleteBusinessById
  }
})
