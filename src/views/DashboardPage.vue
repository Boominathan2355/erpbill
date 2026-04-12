<script setup lang="ts">
import { computed } from 'vue'
import { useInvoiceStore } from '../stores/invoices'
import { useClientStore } from '../stores/clients'
import { formatCurrency } from '../utils/formatters'
import AppIcon from '../components/atoms/AppIcon.vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import SalesChart from '../components/organisms/SalesChart.vue'

const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()

const totalRevenue = computed(() => 
  invoiceStore.invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0)
)

const pendingRevenue = computed(() => 
  invoiceStore.invoices
    .filter(i => i.status === 'draft')
    .reduce((sum, i) => sum + i.totalAmount, 0)
)

const totalClientsCount = computed(() => 
  clientStore.clients.length
)

const stats = computed(() => [
  { label: 'Total Revenue', value: formatCurrency(totalRevenue.value), icon: 'invoice' as const, color: 'var(--color-primary)' },
  { label: 'Pending Amount', value: formatCurrency(pendingRevenue.value), icon: 'edit' as const, color: 'var(--color-warning)' },
  { label: 'Total Clients', value: totalClientsCount.value.toString(), icon: 'users' as const, color: 'var(--color-secondary)' }
])
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Dashboard</h1>
      <BaseButton variant="glow" icon="plus" @click="$router.push('/invoices')">New Invoice</BaseButton>
    </header>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card glass-card">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
          <AppIcon :name="stat.icon" :size="28" />
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value font-mono">{{ stat.value }}</span>
        </div>
      </div>
    </div>

    <!-- Analytics Section -->
    <div class="analytics-row mb-xl">
      <SalesChart />
    </div>

    <section class="recent-section">
      <div class="section-header">
        <h3>Quick Overview</h3>
      </div>
      <div class="glass-card empty-dashboard">
        <AppIcon name="box" :size="64" color="var(--text-muted)" />
        <p>No recent invoices yet. Start by adding your first client!</p>
        <BaseButton variant="ghost" @click="$router.push('/clients')">Add Client</BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
}

.empty-dashboard {
  padding: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  text-align: center;
  color: var(--text-muted);
}

.mb-xl { margin-bottom: var(--spacing-xl); }
</style>
