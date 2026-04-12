import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Invoice } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'

export const useInvoiceStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>(readJSONStorage<Invoice[]>('invoices', []))

  const saveInvoice = (invoice: Invoice) => {
    const index = invoices.value.findIndex(i => i.id === invoice.id)
    if (index !== -1) {
      invoices.value[index] = invoice
    } else {
      invoices.value.push(invoice)
    }
  }

  const deleteInvoice = (id: string) => {
    invoices.value = invoices.value.filter(i => i.id !== id)
  }

  const updateStatus = (id: string, status: Invoice['status']) => {
    const invoice = invoices.value.find(i => i.id === id)
    if (invoice) {
      invoice.status = status
    }
  }

  const getInvoiceById = (id: string) => {
    return invoices.value.find(i => i.id === id)
  }

  const getNextInvoiceNumber = () => {
    const count = invoices.value.length + 1
    return `INV-${count.toString().padStart(3, '0')}`
  }

  // Persist to localStorage
  watch(invoices, (newInvoices) => {
    writeJSONStorage('invoices', newInvoices)
  }, { deep: true })

  return { 
    invoices, 
    saveInvoice, 
    deleteInvoice, 
    updateStatus, 
    getInvoiceById,
    getNextInvoiceNumber 
  }
})
