import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Invoice } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import api from '../utils/api'
import { useTransactionStore } from './transactions'
import { useBusinessStore } from './business'

export const useInvoiceStore = defineStore('invoices', () => {
  const businessStore = useBusinessStore()
  const invoices = ref<Invoice[]>([])
  const isLoading = ref(false)

  const fetchInvoices = async (force = false) => {
    // Prevent concurrent identical requests
    if (isLoading.value) return
    
    // Skip if data already present and not forced
    if (invoices.value.length > 0 && !force) return

    isLoading.value = true
    try {
      const response = await api.get('/invoices')
      invoices.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      isLoading.value = false
    }
  }

  const saveInvoice = async (invoice: Invoice) => {
    try {
      const id = invoice._id || invoice.id
      let response;
      if (id && id !== 'new') {
        response = await api.put(`/invoices/${id}`, invoice)
        const index = invoices.value.findIndex(i => (i._id || i.id) === id)
        if (index !== -1) {
          invoices.value[index] = response.data.data
        }
      } else {
        response = await api.post('/invoices', invoice)
        invoices.value.push(response.data.data)
      }
      return response.data.data
    } catch (error) {
      console.error('Failed to save invoice:', error)
      throw error
    }
  }

  const deleteInvoiceById = async (id: string) => {
    try {
      await api.delete(`/invoices/${id}`)
      invoices.value = invoices.value.filter(i => (i._id || i.id) !== id)
    } catch (error) {
      console.error('Failed to delete invoice:', error)
    }
  }

  const updateStatus = async (id: string, status: Invoice['status']) => {
    try {
      const response = await api.patch(`/invoices/${id}/status`, { status })
      const updatedInvoice = response.data.data
      const index = invoices.value.findIndex(i => (i._id || i.id) === id)
      if (index !== -1) {
        const currentInvoice = invoices.value[index];
        if (!currentInvoice) return;
        
        const oldStatus = currentInvoice.status
        invoices.value[index] = updatedInvoice

        // Log transaction if newly paid
        if (status === 'paid' && oldStatus !== 'paid') {
          const transactionStore = useTransactionStore()
          transactionStore.addTransaction({
            date: Date.now(),
            type: 'income',
            category: 'Sales',
            amount: updatedInvoice.totalAmount,
            description: `Payment for Invoice ${updatedInvoice.invoiceNumber}`,
            referenceId: updatedInvoice._id || updatedInvoice.id,
            paymentMethod: 'Bank',
            status: 'completed'
          })
        }
      }
    } catch (error) {
      console.error('Failed to update invoice status:', error)
    }
  }

  const getInvoiceById = (id: string) => {
    return invoices.value.find(i => (i._id || i.id) === id)
  }

  const getNextInvoiceNumber = async () => {
    try {
      const response = await api.get('/invoices/next-number')
      return response.data.data.nextNumber
    } catch (error) {
      console.error('Failed to get next invoice number:', error)
      const count = invoices.value.length + 1
      return `INV-${count.toString().padStart(3, '0')}`
    }
  }

  return { 
    invoices, 
    fetchInvoices,
    saveInvoice, 
    deleteInvoice: deleteInvoiceById, 
    updateStatus, 
    getInvoiceById,
    getNextInvoiceNumber 
  }
})
