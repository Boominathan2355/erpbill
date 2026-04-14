<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import AppTable from '../components/organisms/AppTable.vue'

const searchQuery = ref('')

const columns = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'user', label: 'User / Admin' },
  { key: 'action', label: 'Action' },
  { key: 'module', label: 'Module' },
  { key: 'ip', label: 'IP Address' }
]

const auditData = ref([
  { id: 1, timestamp: '10 Apr 2026 10:45 AM', user: 'Super Admin', action: 'Created Admin tenant', module: 'System', ip: '192.168.1.1' },
  { id: 2, timestamp: '10 Apr 2026 11:15 AM', user: 'Client Admin (TechCorp)', action: 'Generated B2E Invoice', module: 'Invoices', ip: '10.0.0.45' },
])
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-info">
        <h1>Audit Logs</h1>
        <p class="text-muted">Track system-wide activities and security events.</p>
      </div>
      <BaseButton variant="ghost" icon="download">Export Logs</BaseButton>
    </header>

    <div class="table-actions glass-card mb-4 p-3" style="max-width: 400px;">
      <BaseInput v-model="searchQuery" placeholder="Search logs..." icon="file-text" />
    </div>

    <AppTable :columns="columns" :data="auditData" hide-actions />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}
</style>
