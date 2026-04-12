<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import AppTable from '../components/organisms/AppTable.vue'

const modules = ['Dashboard', 'Invoices', 'Clients', 'Products', 'Settings', 'Audit Logs', 'Role Management']
const roles = ref([
  { id: 1, name: 'Super Admin', desc: 'Can manage billing platform and create new client tenants.' },
  { id: 2, name: 'Client Admin (Billing)', desc: 'Full access to a specific clients billing modules.' },
  { id: 3, name: 'Finance Agent', desc: 'Read/Write access to invoices, no access to settings.' }
])

const permissionsMatrix = ref([
  { module: 'Dashboard', super: 'Full', client: 'Full', finance: 'Read' },
  { module: 'Invoices', super: 'Full', client: 'Full', finance: 'Full' },
  { module: 'Clients', super: 'Full', client: 'Full', finance: 'Read' },
  { module: 'Products', super: 'Full', client: 'Full', finance: 'Read' },
  { module: 'Settings', super: 'Full', client: 'Full', finance: 'None' },
  { module: 'Audit Logs', super: 'Full', client: 'None', finance: 'None' },
  { module: 'Role Management', super: 'Full', client: 'None', finance: 'None' },
])

const matrixCols = [
  { key: 'module', label: 'Module' },
  { key: 'super', label: 'Super Admin (System)' },
  { key: 'client', label: 'Client Admin (Tenant)' },
  { key: 'finance', label: 'Finance Agent (Tenant)' }
]
</script>

<template>
  <div class="page-container">
    <header class="page-header d-flex justify-content-between align-items-center mb-4">
      <div class="header-info">
        <h1>Role Permissions & Modules</h1>
        <p class="text-muted">Define access levels and module availability for custom roles.</p>
      </div>
      <BaseButton variant="glow" icon="plus">Create Custom Role</BaseButton>
    </header>

    <div class="roles-definitions mb-5 d-flex gap-3 flex-wrap">
      <div class="role-card glass-card p-4 flex-fill" v-for="role in roles" :key="role.id">
        <h4 class="mb-2">{{ role.name }}</h4>
        <p class="text-muted mb-3" style="font-size: 0.875rem">{{ role.desc }}</p>
        <BaseButton variant="ghost" size="sm">Edit Role</BaseButton>
      </div>
    </div>

    <h3 class="mb-3">Module Access Matrix</h3>
    <AppTable :columns="matrixCols" :data="permissionsMatrix">
      <template #col-super="{ row }">
        <span class="badge" :class="row.super === 'Full' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'">{{ row.super }}</span>
      </template>
      <template #col-client="{ row }">
         <span class="badge" :class="row.client === 'Full' ? 'bg-success bg-opacity-10 text-success' : row.client === 'None' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'">{{ row.client }}</span>
      </template>
      <template #col-finance="{ row }">
         <span class="badge" :class="row.finance === 'Full' ? 'bg-success bg-opacity-10 text-success' : row.finance === 'None' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'">{{ row.finance }}</span>
      </template>
      <template #actions>
         <BaseButton variant="ghost" size="sm" icon="edit" />
      </template>
    </AppTable>
  </div>
</template>

<style scoped>
.role-card {
  min-width: 300px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
</style>
