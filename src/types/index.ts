/* src/types/index.ts */

export type ClientType = 'b2b' | 'b2c' | 'b2e'

export interface Client {
  id: string
  type: ClientType
  name: string
  email: string
  phone: string
  address: string
  gstin?: string
  stateCode?: string
  country?: string
  currency?: string
  taxId?: string
  createdAt: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string // e.g., 'pcs', 'hrs', 'kg'
  taxRate: number // Percentage
  hsnCode?: string
}

export interface InvoiceItem {
  id: string
  productId: string
  name: string
  quantity: number
  price: number
  taxRate: number
  taxAmount: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  date: number
  dueDate: number
  clientId: string
  clientType?: ClientType
  currency?: string
  lutNumber?: string
  placeOfSupply?: string
  items: InvoiceItem[]
  subtotal: number
  taxTotal: number // Sum of CGST/SGST or IGST/VAT
  discount: number
  discountType: 'percentage' | 'fixed'
  totalAmount: number
  status: 'draft' | 'paid' | 'overdue' | 'cancelled'
  notes?: string
  terms?: string
}

export interface BusinessProfile {
  name: string
  address: string
  email: string
  phone: string
  gstin?: string
  stateCode?: string
  logo?: string
}
