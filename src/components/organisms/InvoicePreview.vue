<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice, Client, BusinessProfile } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface Props {
  invoice: Invoice
  client?: Client
  business: BusinessProfile
}

const props = defineProps<Props>()

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const isInterState = computed(() => props.business.stateCode !== props.client?.stateCode)

const cgstTotal = computed(() => props.invoice.items.reduce((sum, item) => sum + (props.invoice.clientType !== 'b2e' && !isInterState.value ? item.taxAmount / 2 : 0), 0))
const sgstTotal = computed(() => props.invoice.items.reduce((sum, item) => sum + (props.invoice.clientType !== 'b2e' && !isInterState.value ? item.taxAmount / 2 : 0), 0))
const igstTotal = computed(() => props.invoice.items.reduce((sum, item) => sum + (props.invoice.clientType !== 'b2e' && isInterState.value ? item.taxAmount : 0), 0))

const discountAmount = computed(() => {
  if (props.invoice.discountType === 'percentage') {
    return (props.invoice.subtotal * props.invoice.discount) / 100
  }
  return props.invoice.discount
})
</script>

<template>
  <div class="invoice-preview-canvas">
    <div class="invoice-paper">
      <!-- Watermark or Header -->
      <div class="paper-header">
        <div class="brand">
          <div v-if="business.logo" class="logo-circle">
             <img :src="business.logo" alt="Logo" />
          </div>
          <div class="brand-info">
            <h2>{{ business.name || 'Your Company' }}</h2>
            <p>{{ business.address || 'Address not set' }}</p>
            <p>{{ business.email }} | {{ business.phone }}</p>
            <p v-if="business.gstin">GSTIN: {{ business.gstin }}</p>
          </div>
        </div>
        <div class="invoice-meta">
          <div class="document-type">{{ invoice.clientType === 'b2e' ? 'EXPORT INVOICE' : 'TAX INVOICE' }}</div>
          <p class="inv-num">#{{ invoice.invoiceNumber || 'DRAFT' }}</p>
          <div class="dates mt-sm">
            <div class="date-row">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(invoice.date) }}</span>
            </div>
            <div class="date-row">
              <span class="label">Due Date:</span>
              <span class="value">{{ formatDate(invoice.dueDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="billing-info">
        <div class="bill-to">
          <span class="section-title">BILL TO</span>
          <div v-if="client" class="client-details">
            <h4 class="m-0">{{ client.name }}</h4>
            <p>{{ client.address }}</p>
            <p>{{ client.email }}</p>
            <p v-if="client.gstin">GSTIN: {{ client.gstin }}</p>
            <p v-if="invoice.clientType === 'b2e' && invoice.lutNumber">LUT No: {{ invoice.lutNumber }}</p>
          </div>
          <div v-else class="placeholder-text">
            Select a client to see billing details
          </div>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th class="text-left">DESCRIPTION</th>
            <th class="text-right">QTY</th>
            <th class="text-right">RATE</th>
            <th class="text-right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in invoice.items" :key="item.id">
            <td>
              <div class="item-name">{{ item.name }}</div>
            </td>
            <td class="text-right">{{ item.quantity }}</td>
            <td class="text-right">{{ formatCurrency(item.price, invoice.currency) }}</td>
            <td class="text-right">{{ formatCurrency(item.price * item.quantity, invoice.currency) }}</td>
          </tr>
          <tr v-if="invoice.items.length === 0">
            <td colspan="4" class="empty-placeholder">No items added yet</td>
          </tr>
        </tbody>
      </table>

      <div class="invoice-foot">
        <div class="terms-notes">
          <div v-if="invoice.notes" class="notes-block">
            <span class="section-title">NOTES</span>
            <p>{{ invoice.notes }}</p>
          </div>
          <div v-if="invoice.terms" class="notes-block mt-md">
            <span class="section-title">TERMS & CONDITIONS</span>
            <p>{{ invoice.terms }}</p>
          </div>
        </div>
        <div class="totals-block">
          <div class="summary-line">
            <span>Subtotal</span>
            <span>{{ formatCurrency(invoice.subtotal, invoice.currency) }}</span>
          </div>
          
          <template v-if="invoice.clientType === 'b2e'">
            <div class="summary-line">
              <span>IGST (Export under LUT)</span>
              <span>{{ formatCurrency(0, invoice.currency) }}</span>
            </div>
          </template>
          <template v-else-if="isInterState">
            <div class="summary-line" v-if="igstTotal > 0">
              <span>IGST Total</span>
              <span>{{ formatCurrency(igstTotal, invoice.currency) }}</span>
            </div>
          </template>
          <template v-else>
            <div class="summary-line" v-if="cgstTotal > 0">
              <span>CGST Total</span>
              <span>{{ formatCurrency(cgstTotal, invoice.currency) }}</span>
            </div>
            <div class="summary-line" v-if="sgstTotal > 0">
              <span>SGST Total</span>
              <span>{{ formatCurrency(sgstTotal, invoice.currency) }}</span>
            </div>
          </template>

          <div v-if="invoice.discount > 0" class="summary-line discount">
            <span>Discount {{ invoice.discountType === 'percentage' ? `(${invoice.discount}%)` : '' }}</span>
            <span>- {{ formatCurrency(discountAmount, invoice.currency) }}</span>
          </div>
          <div class="summary-line grand-total">
            <span>Grand Total</span>
            <span>{{ formatCurrency(invoice.totalAmount, invoice.currency) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invoice-preview-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
  background: var(--bg-app);
  overflow-y: auto;
  min-height: 800px;
}

.invoice-paper {
  background: #fff;
  width: 100%;
  max-width: 800px;
  min-height: 1000px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 60px;
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
}

.paper-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 50px;
}

.brand-info h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #000;
  font-weight: 800;
}

.brand-info p {
  margin: 4px 0;
  font-size: 0.85rem;
  color: #666;
}

.document-type {
  font-size: 2.25rem;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: 2px;
  text-align: right;
  line-height: 1;
}

.inv-num {
  text-align: right;
  font-size: 1.125rem;
  font-weight: 700;
  margin-top: 8px;
}

.date-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  font-size: 0.85rem;
  margin-top: 4px;
}

.date-row .label { color: #999; font-weight: 600; }
.date-row .value { color: #333; font-weight: 600; }

.billing-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.section-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: #999;
  letter-spacing: 1px;
  margin-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 4px;
}

.client-details h4 { font-size: 1.125rem; margin-bottom: 4px; }
.client-details p { margin: 2px 0; font-size: 0.9rem; color: #444; }

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
}

.invoice-table th {
  padding: 12px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.invoice-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9375rem;
  color: #334155;
}

.item-name { font-weight: 600; }

.empty-placeholder {
  text-align: center;
  padding: 40px !important;
  color: #999;
  font-style: italic;
}

.invoice-foot {
  margin-top: auto;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 50px;
}

.notes-block p {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
}

.totals-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
  color: #666;
}

.summary-line.grand-total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #000;
  font-size: 1.25rem;
  font-weight: 800;
  color: #000;
}

.summary-line.discount {
  color: var(--color-danger);
}

.m-0 { margin: 0; }
.mt-sm { margin-top: 8px; }
.mt-md { margin-top: 24px; }
.text-left { text-align: left; }
.text-right { text-align: right; }
</style>
