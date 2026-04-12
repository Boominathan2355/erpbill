<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import BaseButton from '../components/atoms/BaseButton.vue'
import AppTable from '../components/organisms/AppTable.vue'
import type { PermissionLevel } from '../types'

const authStore = useAuthStore()

const matrixCols = [
  { key: 'module', label: 'Module' },
  { key: 'super', label: 'Super Admin (System)' },
  { key: 'client', label: 'Client Admin (Tenant)' },
  { key: 'finance', label: 'Finance Agent (Tenant)' }
]

const permissionOptions: PermissionLevel[] = ['Full', 'Read', 'None']

const getBadgeClass = (level: PermissionLevel) => {
  switch (level) {
    case 'Full': return 'bg-success bg-opacity-10 text-success'
    case 'Read': return 'bg-primary bg-opacity-10 text-primary'
    case 'None': return 'bg-danger bg-opacity-10 text-danger'
    default: return 'bg-secondary'
  }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header d-flex justify-content-between align-items-center mb-4">
      <div class="header-info">
        <h1>Role Permissions & Modules</h1>
        <p class="text-muted">Define access levels and module availability for custom roles. Changes apply in real-time.</p>
      </div>
      <BaseButton variant="glow" icon="plus">Create Custom Role</BaseButton>
    </header>

    <div class="roles-definitions mb-5 d-flex gap-3 flex-wrap">
      <div class="role-card glass-card p-4 flex-fill" v-for="role in authStore.roles" :key="role.id">
        <h4 class="mb-2">{{ role.name }}</h4>
        <p class="text-muted mb-3" style="font-size: 0.875rem">{{ role.desc }}</p>
        <BaseButton variant="ghost" size="sm">Edit Role</BaseButton>
      </div>
    </div>

    <h3 class="mb-3">Module Access Matrix</h3>
    <AppTable :columns="matrixCols" :data="authStore.permissionsMatrix">
      <template #col-super="{ row }">
        <select v-model="row.super" class="form-select form-select-sm border-0 bg-transparent fw-bold" :class="getBadgeClass(row.super)">
          <option v-for="opt in permissionOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </template>
      <template #col-client="{ row }">
        <select v-model="row.client" class="form-select form-select-sm border-0 bg-transparent fw-bold" :class="getBadgeClass(row.client)">
          <option v-for="opt in permissionOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </template>
      <template #col-finance="{ row }">
        <select v-model="row.finance" class="form-select form-select-sm border-0 bg-transparent fw-bold" :class="getBadgeClass(row.finance)">
          <option v-for="opt in permissionOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
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
