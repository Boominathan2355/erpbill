import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

export interface User {
  _id?: string
  id?: string
  name: string
  email: string
  username?: string
  role: string
  source: string
  status: 'Active' | 'Inactive'
  businessId?: string
}

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)

  const fetchUsers = async (force = false) => {
    if (isLoading.value) return
    if (users.value.length > 0 && !force) return

    isLoading.value = true
    try {
      const response = await api.get('/users')
      users.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch users:', error)
      // Fallback for demo if backend is not ready
      if (users.value.length === 0) {
        users.value = [
          { id: '1', name: 'System Admin', email: 'admin@billsoft.com', role: 'Super Admin', source: 'Local DB', status: 'Active' },
          { id: '2', name: 'John Doe', email: 'john.d@clientcorp.ld', role: 'Client Admin (TechCorp)', source: 'Active Directory (LDAP)', status: 'Active' }
        ]
      }
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`)
      users.value = users.value.filter(u => (u._id || u.id) !== id)
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const response = await api.put(`/users/${id}`, userData)
      const index = users.value.findIndex(u => (u._id || u.id) === id)
      if (index !== -1) {
        users.value[index] = response.data.data
      }
      return response.data.data
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  const createUser = async (userData: any) => {
    try {
      const response = await api.post('/users', userData)
      users.value.push(response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }

  return {
    users,
    isLoading,
    fetchUsers,
    deleteUser,
    updateUser,
    createUser
  }
})
