import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Invoice } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import { useTransactionStore } from './transactions'
import { useBusinessStore } from './business'

export const useInvoiceStore = defineStore('invoices', () => {
  const businessStore = useBusinessStore()
  const storageKey = `invoices_${businessStore.activeBusinessId}`
  const invoices = ref<Invoice[]>(readJSONStorage<Invoice[]>(storageKey, []))

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
      const oldStatus = invoice.status
      invoice.status = status

      // Log transaction if newly paid
      if (status === 'paid' && oldStatus !== 'paid') {
        const transactionStore = useTransactionStore()
        transactionStore.addTransaction({
          date: Date.now(),
          type: 'income',
          category: 'Sales',
          amount: invoice.totalAmount,
          description: `Payment for Invoice ${invoice.invoiceNumber}`,
          referenceId: invoice.id,
          paymentMethod: 'Bank', // Default
          status: 'completed'
        })
      }
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
    writeJSONStorage(storageKey, newInvoices)
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
