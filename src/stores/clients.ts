import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Client } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import api from '../utils/api'
import { useBusinessStore } from './business'

// Store for managing client entities
export const useClientStore = defineStore('clients', () => {
  const businessStore = useBusinessStore()
  const clients = ref<Client[]>([])
  const isLoading = ref(false)

  const fetchClients = async (force = false) => {
    // If already loading, don't start a new request
    if (isLoading.value) return
    
    // If already have data and not forced, skip
    if (clients.value.length > 0 && !force) return

    isLoading.value = true
    try {
      const response = await api.get('/clients')
      clients.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      isLoading.value = false
    }
  }

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const response = await api.post('/clients', client)
      clients.value.push(response.data.data)
    } catch (error) {
      console.error('Failed to add client:', error)
    }
  }

  const updateClient = async (id: string, updatedClient: Partial<Client>) => {
    try {
      const response = await api.put(`/clients/${id}`, updatedClient)
      const index = clients.value.findIndex(c => (c._id || c.id) === id)
      if (index !== -1) {
        clients.value[index] = response.data.data
      }
    } catch (error) {
      console.error('Failed to update client:', error)
    }
  }

  const deleteClientById = async (id: string) => {
    try {
      await api.delete(`/clients/${id}`)
      clients.value = clients.value.filter(c => (c._id || c.id) !== id)
    } catch (error) {
      console.error('Failed to delete client:', error)
    }
  }

  return { clients, fetchClients, addClient, updateClient, deleteClient: deleteClientById }
})
