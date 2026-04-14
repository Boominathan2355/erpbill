import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'
import type { Role } from '../types'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<Role[]>([])
  const isLoading = ref(false)

  const fetchRoles = async (force = false) => {
    if (isLoading.value) return
    if (roles.value.length > 0 && !force) return

    isLoading.value = true
    try {
      const response = await api.get('/roles')
      roles.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      // Populate with default roles if API fails for now
      if (roles.value.length === 0) {
        roles.value = [
          { id: 1, name: 'Super Admin', desc: 'Can manage billing platform and create new client tenants.' },
          { id: 2, name: 'Client Admin (Billing)', desc: 'Full access to a specific clients billing modules.' },
          { id: 3, name: 'Finance Agent', desc: 'Read/Write access to invoices, no access to settings.' }
        ]
      }
    } finally {
      isLoading.value = false
    }
  }

  const createRole = async (roleData: { name: string; desc: string }) => {
    try {
      const response = await api.post('/roles', roleData)
      roles.value.push(response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Failed to create role:', error)
      throw error
    }
  }

  const updateRole = async (id: string | number, roleData: { name: string; desc: string }) => {
    try {
      const response = await api.put(`/roles/${id}`, roleData)
      const index = roles.value.findIndex(r => r.id === id || (r as any)._id === id)
      if (index !== -1) {
        roles.value[index] = response.data.data
      }
      return response.data.data
    } catch (error) {
      console.error('Failed to update role:', error)
      throw error
    }
  }

  const deleteRole = async (id: string | number) => {
    try {
      await api.delete(`/roles/${id}`)
      roles.value = roles.value.filter(r => r.id !== id && (r as any)._id !== id)
    } catch (error) {
      console.error('Failed to delete role:', error)
      throw error
    }
  }

  return {
    roles,
    isLoading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole
  }
})
