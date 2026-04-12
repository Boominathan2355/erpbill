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
  lutNumber?: string // Added for Exports
  isTaxableExport?: boolean // Added for Exports
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
  hsnCode?: string // Mandatory for GST
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
  isTaxableExport?: boolean // Added for Exports
  isB2CLarge?: boolean // Added for GST compliance
  reverseCharge?: boolean // Added for GST compliance
  placeOfSupply?: string
  items: InvoiceItem[]
  subtotal: number
  taxTotal: number // Sum of CGST/SGST or IGST
  discount: number
  discountType: 'percentage' | 'fixed'
  totalAmount: number
  isRounded: boolean // User-selectable toggle
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
  bankName?: string
  bankAccountNo?: string
  bankIFSC?: string
}

export type PermissionLevel = 'Full' | 'Read' | 'None'

export interface Role {
  id: number
  name: string
  desc: string
}

export interface PermissionRow {
  module: string
  super: PermissionLevel
  client: PermissionLevel
  finance: PermissionLevel
}
