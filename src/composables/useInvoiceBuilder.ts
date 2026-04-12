import { ref, computed, watch } from 'vue'
import type { Invoice, InvoiceItem, Product, ClientType } from '../types'
import { generateId } from '../utils/formatters'
import { calculateGST } from '../utils/taxUtils'

export function useInvoiceBuilder(initialInvoice?: Invoice, nextNumber?: string) {
  const invoice = ref<Omit<Invoice, 'id'>>({
    invoiceNumber: initialInvoice?.invoiceNumber || nextNumber || '',
    date: initialInvoice?.date || Date.now(),
    dueDate: initialInvoice?.dueDate || (Date.now() + 7 * 24 * 60 * 60 * 1000),
    clientId: initialInvoice?.clientId || '',
    clientType: initialInvoice?.clientType || 'b2b',
    currency: initialInvoice?.currency || 'INR',
    lutNumber: initialInvoice?.lutNumber || '',
    placeOfSupply: initialInvoice?.placeOfSupply || '',
    items: initialInvoice?.items || [],
    subtotal: initialInvoice?.subtotal || 0,
    taxTotal: initialInvoice?.taxTotal || 0,
    discount: initialInvoice?.discount || 0,
    discountType: initialInvoice?.discountType || 'percentage',
    totalAmount: initialInvoice?.totalAmount || 0,
    status: initialInvoice?.status || 'draft',
    notes: initialInvoice?.notes || '',
    terms: initialInvoice?.terms || ''
  })

  // Auto-sync due date (keep 7 day gap) when issue date changes
  watch(() => invoice.value.date, (newDate, oldDate) => {
    if (newDate !== oldDate) {
      invoice.value.dueDate = newDate + (7 * 24 * 60 * 60 * 1000)
    }
  })

  const isInterState = ref(false)

  const addItem = (product: Product) => {
    const item: InvoiceItem = {
      id: generateId(),
      productId: product.id,
      name: product.name,
      quantity: 1,
      price: product.price,
      taxRate: product.taxRate,
      taxAmount: 0,
      total: 0
    }
    invoice.value.items.push(item)
    calculateTotals()
  }

  const removeItem = (id: string) => {
    invoice.value.items = invoice.value.items.filter(i => i.id !== id)
    calculateTotals()
  }

  const calculateTotals = () => {
    let subtotal = 0
    let taxTotal = 0
    
    invoice.value.items.forEach(item => {
      const baseAmount = item.price * item.quantity
      const tax = calculateGST(baseAmount, item.taxRate, invoice.value.clientType, isInterState.value)
      
      item.taxAmount = tax.totalTax
      item.total = baseAmount + tax.totalTax
      
      subtotal += baseAmount
      taxTotal += tax.totalTax
    })
    
    invoice.value.subtotal = subtotal
    invoice.value.taxTotal = taxTotal
    
    let discountAmount = 0
    if (invoice.value.discountType === 'percentage') {
      discountAmount = (subtotal * invoice.value.discount) / 100
    } else {
      discountAmount = invoice.value.discount
    }
    
    invoice.value.totalAmount = Math.max(0, subtotal + taxTotal - discountAmount)
  }

  return {
    invoice,
    isInterState,
    addItem,
    removeItem,
    calculateTotals
  }
}
