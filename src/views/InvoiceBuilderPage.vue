<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '../stores/clients'
import { useProductStore } from '../stores/products'
import { useInvoiceStore } from '../stores/invoices'
import { useSettingsStore } from '../stores/settings'
import { useInvoiceBuilder } from '../composables/useInvoiceBuilder'
import { formatCurrency } from '../utils/formatters'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseBadge from '../components/atoms/BaseBadge.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import BaseSearchSelect from '../components/atoms/BaseSearchSelect.vue'
import BaseDatePicker from '../components/atoms/BaseDatePicker.vue'
import AppIcon from '../components/atoms/AppIcon.vue'
import InvoicePreview from '../components/organisms/InvoicePreview.vue'

const router = useRouter()
const clientStore = useClientStore()
const productStore = useProductStore()
const invoiceStore = useInvoiceStore()
const settingsStore = useSettingsStore()
const { invoice, isInterState, addItem, removeItem, calculateTotals } = useInvoiceBuilder(undefined, invoiceStore.getNextInvoiceNumber())

const isSaved = ref(false)

const clientOptions = computed(() => 
  clientStore.clients.map(c => ({ id: c.id, label: c.name, sublabel: c.email }))
)

const selectedClient = computed(() => 
  clientStore.clients.find(c => c.id === invoice.value.clientId)
)

watch(selectedClient, (client) => {
  if (client) {
    invoice.value.clientType = client.type
    invoice.value.currency = client.currency || 'INR'
    invoice.value.placeOfSupply = client.stateCode || ''
    invoice.value.lutNumber = (client as any).lutNumber || ''
    
    isInterState.value = settingsStore.profile.stateCode !== client.stateCode
    calculateTotals()
  }
})

const productOptions = computed(() => 
  productStore.products.map(p => ({ 
    id: p.id, 
    label: p.name, 
    sublabel: `${formatCurrency(p.price, invoice.value.currency)} / ${p.unit}`
  }))
)

const handleSave = () => {
  if (!invoice.value.clientId || invoice.value.items.length === 0) {
    alert('Please select a client and add at least one item.')
    return
  }
  
  const finalInvoice = {
    ...invoice.value,
    id: Date.now().toString(),
    invoiceNumber: invoiceStore.getNextInvoiceNumber(),
  }
  
  invoiceStore.saveInvoice(finalInvoice as any)
  isSaved.value = true
}

const handleClose = () => {
  router.push('/invoices')
}

// Initial calculation
onMounted(() => {
  calculateTotals()
})
</script>

<template>
  <div class="builder-layout">
    <!-- Main Editor -->
    <div class="editor-panel">
      <header class="editor-header">
        <div class="header-left">
          <BaseButton variant="ghost" size="sm" icon="arrow-left" @click="router.back()">Back</BaseButton>
          <h1>Create Invoice</h1>
        </div>
        <div class="header-right">
          <!-- Removed redundant Save button to keep UI clean -->
        </div>
      </header>

      <div class="editor-content">
        <!-- 1. General Info -->
        <section class="editor-section glass-card">
          <div class="section-title">
            <AppIcon name="users" :size="20" color="var(--color-primary)" />
            <h3>Client & Dates</h3>
          </div>
          <div class="client-dates-grid">
            <div class="client-select-wrapper">
              <BaseSearchSelect 
                v-model="invoice.clientId" 
                label="Client"
                :options="clientOptions"
                placeholder="Search client..."
              />
              <div v-if="selectedClient" class="client-context-ribbon mt-2 p-2 glass-card rounded" style="font-size: 0.85rem; border-left: 3px solid var(--color-primary)">
                <strong>Type:</strong> <BaseBadge :text="(selectedClient.type || 'B2B').toUpperCase()" variant="info" class="mx-1"/>
                <strong class="ms-2">Tax ID:</strong> {{ selectedClient.gstin || selectedClient.taxId || 'N/A' }} 
                <span v-if="invoice.clientType === 'b2e'" class="ms-2">
                  <strong>LUT:</strong> {{ invoice.lutNumber || 'None' }}
                </span>
                <span v-if="invoice.clientType !== 'b2e'" class="ms-2">
                  <strong>State:</strong> {{ selectedClient.stateCode || 'Unknown' }}
                </span>
              </div>
            </div>
            <BaseDatePicker v-model="invoice.date" label="Issue Date" />
            <BaseDatePicker v-model="invoice.dueDate" label="Due Date" />
          </div>
        </section>

        <!-- 2. Items Table -->
        <section class="editor-section glass-card overflow-visible">
          <div class="section-header">
            <div class="section-title">
              <AppIcon name="box" :size="20" color="var(--color-primary)" />
              <h3>Items & Pricing</h3>
            </div>
          </div>

          <div class="command-search-wrapper">
             <AppIcon name="search" :size="20" class="search-icon" />
             <BaseSearchSelect 
                model-value=""
                placeholder="Type to search and add products..."
                :options="productOptions"
                @change="opt => addItem(productStore.products.find(p => p.id === opt.id)!)"
                class="big-search"
                hide-chevron
                show-only-on-search
              />
          </div>

          <div class="items-table-wrapper">
            <table class="items-table">
              <thead>
                <tr>
                  <th class="text-left">Item Name</th>
                  <th class="text-center" width="100">Qty</th>
                  <th class="text-right" width="140">Price</th>
                  <th class="text-right" width="140">Total</th>
                  <th width="50"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoice.items" :key="item.id">
                  <td class="item-name-cell">
                    {{ item.name }}
                  </td>
                  <td>
                    <div class="qty-control">
                      <input 
                        type="number" 
                        v-model.number="item.quantity" 
                        @input="calculateTotals"
                        min="1"
                      />
                    </div>
                  </td>
                  <td>
                    <div class="price-edit">
                      <span class="currency-symbol">{{ invoice.currency === 'USD' ? '$' : invoice.currency === 'EUR' ? '€' : '₹' }}</span>
                      <input 
                        type="number" 
                        v-model.number="item.price" 
                        @input="calculateTotals"
                      />
                    </div>
                  </td>
                  <td class="text-right font-bold">
                    {{ formatCurrency(item.price * item.quantity, invoice.currency) }}
                  </td>
                  <td class="text-center">
                    <button class="remove-btn" @click="removeItem(item.id)">
                      <AppIcon name="trash" :size="16" />
                    </button>
                  </td>
                </tr>
                <tr v-if="invoice.items.length === 0">
                  <td colspan="5" class="empty-state">
                    No items added. Select a product from the list above.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 3. Summary & Notes -->
        <div class="grid-2 mt-lg">
          <section class="editor-section glass-card">
            <div class="section-title">
              <AppIcon name="file-text" :size="20" color="var(--color-primary)" />
              <h3>Notes & Terms</h3>
            </div>
            <BaseInput v-model="invoice.notes" label="Private Notes" placeholder="Internal remarks..." textarea />
            <BaseInput v-model="invoice.terms" label="Terms & Conditions" placeholder="Payment terms, etc..." textarea class="mt-md" />
          </section>

          <section class="editor-section glass-card">
            <div class="section-title">
              <AppIcon name="percent" :size="20" color="var(--color-primary)" />
              <h3>Adjustment & Totals</h3>
            </div>
            
            <div class="discount-field">
              <div class="grid-2" style="grid-template-columns: 2fr 1fr">
                <BaseInput 
                  v-model.number="invoice.discount" 
                  label="Apply Discount" 
                  type="number"
                  @input="calculateTotals"
                />
                <div class="select-group">
                  <label class="input-label">Type</label>
                  <select v-model="invoice.discountType" @change="calculateTotals" class="custom-minimal-select">
                    <option value="percentage">%</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="totals-summary">
              <div class="summary-line">
                <span>Subtotal</span>
                <span>{{ formatCurrency(invoice.subtotal, invoice.currency) }}</span>
              </div>
              <div class="summary-line">
                <span v-if="invoice.clientType === 'b2e'">IGST @ 0% (Export)</span>
                <span v-else-if="isInterState">IGST Total</span>
                <span v-else>CGST + SGST Total</span>
                <span>{{ formatCurrency(invoice.taxTotal, invoice.currency) }}</span>
              </div>
              <div v-if="invoice.discount > 0" class="summary-line discount">
                <span>Discount</span>
                <span>- {{ invoice.discountType === 'percentage' ? formatCurrency((invoice.subtotal * invoice.discount) / 100, invoice.currency) : formatCurrency(invoice.discount, invoice.currency) }}</span>
              </div>
              <div class="summary-line grand-total">
                <span>Grand Total</span>
                <span>{{ formatCurrency(invoice.totalAmount, invoice.currency) }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- 4. Bottom Action -->
        <div class="bottom-actions">
           <div class="action-group">
             <BaseButton variant="ghost" size="lg" @click="router.back()">Cancel</BaseButton>
             <BaseButton variant="glow" size="lg" icon="plus" @click="handleSave">Save Invoice</BaseButton>
           </div>
           <p class="text-muted mt-md">Double check all details before saving.</p>
        </div>
      </div>
    </div>

    <!-- Post-Save Success Overlay -->
    <Transition name="fade-slide">
      <div v-if="isSaved" class="success-overlay">
        <div class="overlay-content">
          <div class="success-header">
            <div class="success-info">
              <div class="check-circle">
                <AppIcon name="check" :size="32" color="#fff" />
              </div>
              <div>
                <h2>Invoice Saved Successfully!</h2>
                <p>Invoice #{{ invoice.invoiceNumber }} has been generated.</p>
              </div>
            </div>
            <div class="success-actions">
              <BaseButton variant="ghost" icon="printer">Print</BaseButton>
              <BaseButton variant="ghost" icon="download">Download</BaseButton>
              <BaseButton variant="glow" @click="handleClose">Back to Invoices</BaseButton>
            </div>
          </div>
          
          <div class="preview-container glass-card">
            <InvoicePreview 
              :invoice="invoice as any" 
              :client="selectedClient" 
              :business="settingsStore.profile" 
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.builder-layout {
  display: block;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-app);
}

/* Editor Panel Styles */
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 80px;
  background: var(--bg-app);
  margin: 0 -var(--spacing-xl) var(--spacing-xl);
  padding: 0 var(--spacing-xl);
}

.editor-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
  opacity: 0.8;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-left h1 { 
  margin: 0; 
  font-size: 1.75rem; 
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding-bottom: 100px; /* Space for scroll */
}

.editor-section {
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--text-main);
}

.section-title h3 { 
  margin: 0; 
  font-size: 1rem; 
  font-weight: 700;
  line-height: 1.2;
}

.section-title :deep(.svg-icon) {
  margin-top: -1px;
}
.section-header .section-title { margin-bottom: 0; }

.command-search-wrapper {
  margin-bottom: var(--spacing-lg);
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  padding-left: var(--spacing-md);
  border: 1px dashed var(--border-color);
  transition: all 0.2s ease;
}

.command-search-wrapper:focus-within {
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.05);
  border-style: solid;
}

.command-search-wrapper .search-icon {
  color: var(--text-muted);
}

.big-search {
  flex: 1;
}

:deep(.big-search .input-wrapper) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Items Table */
.items-table-wrapper {
  margin: 0 -var(--spacing-lg);
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.items-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.item-name-cell { font-weight: 600; color: var(--text-main); }

.qty-control input, .price-edit input {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  padding: 4px 8px;
  width: 100%;
  text-align: right;
  outline: none;
}

.price-edit {
  display: flex;
  align-items: center;
  gap: 4px;
}

.remove-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
}

.remove-btn:hover { color: var(--color-danger); background: rgba(239, 68, 68, 0.1); }

.empty-state { text-align: center; padding: 40px !important; color: var(--text-muted); font-style: italic; }

/* Totals Summary */
.totals-summary {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.summary-line {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
}

.summary-line.grand-total {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--border-color);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
}

.discount { color: var(--color-danger); }

/* Minimal Select Styles */
.custom-minimal-select {
  height: 44px;
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  padding: 0 8px;
  outline: none;
}

.input-label { font-size: 0.875rem; font-weight: 600; margin-bottom: 4px; display: block; }

/* Success Overlay */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
}

.overlay-content {
  width: 100%;
  max-width: 1000px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.success-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-surface);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.success-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.check-circle {
  width: 48px;
  height: 48px;
  background: var(--color-success);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
}

.success-info h2 { margin: 0; font-size: 1.5rem; }
.success-info p { margin: 4px 0 0; color: var(--text-muted); }

.success-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.preview-container {
  flex: 1;
  overflow: hidden;
  border-radius: var(--radius-lg);
  padding: 0;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

/* Helpers */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); }
.client-dates-grid { 
  display: grid; 
  grid-template-columns: 1.2fr 1fr 1fr; 
  gap: var(--spacing-lg); 
}
.mt-lg { margin-top: var(--spacing-lg); }
.mt-md { margin-top: var(--spacing-md); }
.font-bold { font-weight: 700; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.overflow-visible { overflow: visible !important; }

/* Responsive adjustments */
@media (max-width: 1200px) {
  .editor-panel { padding: var(--spacing-lg); }
  .success-header { flex-direction: column; text-align: center; gap: var(--spacing-lg); }
  .success-actions { width: 100%; justify-content: center; }
}

.bottom-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: var(--spacing-xxl);
  padding: var(--spacing-xxxl) 0;
  border-top: 1px solid var(--border-color);
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.02));
}

.action-group {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.action-group :deep(.base-button) {
  min-width: 160px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-muted { color: var(--text-muted); }
</style>
e>
