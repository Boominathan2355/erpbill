<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Transaction, TransactionType, PaymentMethod } from '../../types'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../types'
import AppIcon from '../atoms/AppIcon.vue'
import BaseButton from '../atoms/BaseButton.vue'

const props = defineProps<{
  show: boolean
  editTransaction?: Transaction
}>()

const emit = defineEmits(['close', 'save'])

const type = ref<TransactionType>(props.editTransaction?.type || 'expense')
const category = ref(props.editTransaction?.category || '')
const amount = ref(props.editTransaction?.amount || 0)
const date = ref<string>(props.editTransaction ? new Date(props.editTransaction.date).toISOString().split('T')[0] ?? '' : new Date().toISOString().split('T')[0] ?? '')
const description = ref(props.editTransaction?.description || '')
const paymentMethod = ref<PaymentMethod>(props.editTransaction?.paymentMethod || 'Cash')

const categories = computed(() => {
  return type.value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
})

const handleSave = () => {
  if (!category.value || amount.value <= 0) return

  emit('save', {
    id: props.editTransaction?.id,
    type: type.value,
    category: category.value,
    amount: amount.value,
    date: new Date(date.value).getTime(),
    description: description.value,
    paymentMethod: paymentMethod.value,
    status: 'completed'
  })
  reset()
}

const reset = () => {
  type.value = 'expense'
  category.value = ''
  amount.value = 0
  date.value = new Date().toISOString().split('T')[0] ?? ''
  description.value = ''
  paymentMethod.value = 'Cash'
}
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click="emit('close')">
      <div class="modal-content glass-card" @click.stop>
        <div class="modal-header">
          <h3>{{ editTransaction ? 'Edit Entry' : 'New Transaction' }}</h3>
          <button class="close-btn" @click="emit('close')">
            <AppIcon name="menu" :size="20" />
          </button>
        </div>

        <div class="form-grid">
          <div class="form-section full">
            <label>Transaction Type</label>
            <div class="type-toggle">
              <button 
                :class="{ active: type === 'income' }" 
                @click="type = 'income'; category = ''"
              >
                Income
              </button>
              <button 
                :class="{ active: type === 'expense' }" 
                @click="type = 'expense'; category = ''"
              >
                Expense
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Amount</label>
            <div class="input-wrapper">
              <span class="currency-symbol">₹</span>
              <input type="number" v-model="amount" placeholder="0.00" />
            </div>
          </div>

          <div class="form-group">
            <label>Date</label>
            <input type="date" v-model="date" />
          </div>

          <div class="form-group">
            <label>Category</label>
            <select v-model="category">
              <option value="" disabled>Select Category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Payment Method</label>
            <select v-model="paymentMethod">
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div class="form-group full">
            <label>Description</label>
            <textarea v-model="description" placeholder="Notes about this entry..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
          <BaseButton variant="primary" @click="handleSave">Save Transaction</BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group.full {
  grid-column: span 2;
}

.form-grid label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
}

.type-toggle {
  display: flex;
  background: var(--bg-app);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.type-toggle button {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.type-toggle button.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

input, select, textarea {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.9rem;
}

.input-wrapper input {
  padding-left: 32px;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
