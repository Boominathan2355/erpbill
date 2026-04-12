import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Client } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'

export const useClientStore = defineStore('clients', () => {
  const clients = ref<Client[]>(readJSONStorage<Client[]>('clients', []))

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now()
    }
    clients.value.push(newClient)
  }

  const updateClient = (id: string, updatedClient: Partial<Client>) => {
    const index = clients.value.findIndex(c => c.id === id)
    if (index !== -1) {
      const currentClient = clients.value[index]!
      clients.value[index] = {
        ...currentClient,
        ...updatedClient,
        id: currentClient.id,
        type: updatedClient.type ?? currentClient.type,
        name: updatedClient.name ?? currentClient.name,
        email: updatedClient.email ?? currentClient.email,
        phone: updatedClient.phone ?? currentClient.phone,
        address: updatedClient.address ?? currentClient.address,
        createdAt: currentClient.createdAt
      }
    }
  }

  const deleteClient = (id: string) => {
    clients.value = clients.value.filter(c => c.id !== id)
  }

  // Persist to localStorage
  watch(clients, (newClients) => {
    writeJSONStorage('clients', newClients)
  }, { deep: true })

  return { clients, addClient, updateClient, deleteClient }
})
