<script setup lang="ts">
import AppIcon from '../components/atoms/AppIcon.vue'
import BaseButton from '../components/atoms/BaseButton.vue'

// Define a type for the icon names supported by AppIcon
type IconName = 'home' | 'invoice' | 'users' | 'box' | 'settings' | 'plus' | 'trash' | 'edit' | 'sun' | 'moon' | 'menu' | 'arrow-left' | 'search' | 'chevron-down' | 'calendar' | 'download' | 'printer' | 'percent' | 'file-text' | 'eye' | 'eye-off' | 'check'

interface ReportModule {
  id: string
  title: string
  description: string
  icon: IconName
  color: string
  status: 'Ready' | 'Scheduled' | 'Coming Soon'
}

const reportModules: ReportModule[] = [
  {
    id: 'sales',
    title: 'Sales Analytics',
    description: 'Detailed revenue breakdowns, growth trends, and top-performing regions.',
    icon: 'invoice',
    color: '#6366f1', // Indigo
    status: 'Ready'
  },
  {
    id: 'tax',
    title: 'Tax & Compliance',
    description: 'Quarterly GST/VAT summaries and detailed tax collection reports.',
    icon: 'file-text',
    color: '#10b981', // Emerald
    status: 'Scheduled'
  },
  {
    id: 'clients',
    title: 'Client Aging',
    description: 'Track overdue balances and identify payment bottleneck patterns.',
    icon: 'users',
    color: '#a855f7', // Purple
    status: 'Coming Soon'
  },
  {
    id: 'inventory',
    title: 'Product Insights',
    description: 'Inventory movement, best-sellers, and low-stock forecasting.',
    icon: 'box',
    color: '#f59e0b', // Amber
    status: 'Coming Soon'
  }
]
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-info">
        <h1>Reports & Insights</h1>
        <p class="text-muted">Analyze your business performance with high-fidelity financial data.</p>
      </div>
      <div class="header-actions">
        <BaseButton variant="ghost" icon="search">Export All</BaseButton>
      </div>
    </header>

    <div class="reports-grid">
      <div 
        v-for="module in reportModules" 
        :key="module.id" 
        class="report-card glass-card"
        :class="{ 'module-locked': module.status === 'Coming Soon' }"
      >
        <div class="card-header">
          <div class="icon-box" :style="{ backgroundColor: module.color + '15', color: module.color }">
            <AppIcon :name="module.icon" :size="24" />
          </div>
          <span class="status-tag" :style="{ color: module.color }">{{ module.status }}</span>
        </div>
        
        <div class="card-body">
          <h3>{{ module.title }}</h3>
          <p>{{ module.description }}</p>
        </div>

        <div class="card-footer">
          <BaseButton 
            variant="ghost" 
            size="sm" 
            :icon="module.status === 'Ready' ? 'check' : 'plus'"
            :disabled="module.status === 'Coming Soon'"
          >
            {{ module.status === 'Ready' ? 'Open Report' : 'Request Access' }}
          </BaseButton>
        </div>

        <div v-if="module.status === 'Coming Soon'" class="lock-overlay">
          <AppIcon name="settings" :size="32" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.report-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  height: 240px;
}

.report-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-primary);
  box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-tag {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 99px;
}

.card-body h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
  color: var(--text-main);
}

.card-body p {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-start;
}

.module-locked {
  opacity: 0.8;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.1);
  backdrop-filter: grayscale(1) blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.report-card:hover .lock-overlay {
  opacity: 1;
}

.text-muted {
  color: var(--text-muted);
  font-size: 0.95rem;
  max-width: 600px;
}
</style>
