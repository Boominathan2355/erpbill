<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoiceStore } from '../stores/invoices'
import { useClientStore } from '../stores/clients'
import { formatCurrency, formatDate } from '../utils/formatters'
import AppTable from '../components/organisms/AppTable.vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseBadge from '../components/atoms/BaseBadge.vue'

const router = useRouter()
const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()

const columns = [
  { key: 'invoiceNumber', label: 'Invoice #' },
  { key: 'clientName', label: 'Client' },
  { key: 'date', label: 'Date' },
  { key: 'totalAmount', label: 'Total' },
  { key: 'status', label: 'Status' }
]

const tableData = computed(() => {
  return invoiceStore.invoices
    .map(invoice => {
      const client = clientStore.clients.find(c => c.id === invoice.clientId)
      return {
        ...invoice,
        clientName: client ? client.name : 'Unknown Client'
      }
    })
})

const getBadgeVariant = (status: string) => {
  if (status === 'paid') return 'success'
  if (status === 'overdue') return 'danger'
  if (status === 'cancelled') return 'ghost'
  return 'warning'
}

const handleCreate = () => {
  router.push({ name: 'invoice-builder' })
}

const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this invoice?')) {
    invoiceStore.deleteInvoice(id)
  }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-info">
        <h1>Invoices</h1>
        <p class="text-muted">Manage billings and payments</p>
      </div>
      <BaseButton variant="glow" icon="plus" @click="handleCreate">New Invoice</BaseButton>
    </header>

    <AppTable :columns="columns" :data="tableData" emptyMessage="No invoices generated yet.">
      <template #col-invoiceNumber="{ row }">
        <span class="font-mono text-bold">{{ row.invoiceNumber }}</span>
      </template>
      <template #col-date="{ row }">
        {{ formatDate(row.date) }}
      </template>
      <template #col-totalAmount="{ row }">
        <span class="font-mono">{{ formatCurrency(row.totalAmount) }}</span>
      </template>
      <template #col-status="{ row }">
        <BaseBadge :variant="getBadgeVariant(row.status)">
          {{ row.status.toUpperCase() }}
        </BaseBadge>
      </template>
      <template #actions="{ row }">
        <BaseButton variant="ghost" size="sm" icon="edit" @click="router.push(`/invoices/builder?id=${row.id}`)" />
        <BaseButton variant="ghost" size="sm" icon="trash" @click="handleDelete(row.id)" />
      </template>
    </AppTable>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.text-bold { font-weight: 700; }
.text-muted {
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
