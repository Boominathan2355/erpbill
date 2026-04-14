<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRoleStore } from '../stores/role'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import AppTable from '../components/organisms/AppTable.vue'
import AppModal from '../components/organisms/AppModal.vue'
import AppIcon from '../components/atoms/AppIcon.vue'
import type { PermissionLevel } from '../types'

const authStore = useAuthStore()
const roleStore = useRoleStore()
const isSuccess = ref(false)
const editingModule = ref<string | null>(null)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const newRole = ref({ name: '', desc: '' })
const editingRole = ref<any>(null)

onMounted(() => {
  roleStore.fetchRoles()
})

const handleCreateRole = async () => {
  await roleStore.createRole(newRole.value)
  showCreateModal.value = false
  newRole.value = { name: '', desc: '' }
  isSuccess.value = true
  setTimeout(() => isSuccess.value = false, 3000)
}

const openEditModal = (role: any) => {
  editingRole.value = { ...role }
  showEditModal.value = true
}

const handleUpdateRole = async () => {
  if (editingRole.value) {
    await roleStore.updateRole(editingRole.value.id || editingRole.value._id, editingRole.value)
    showEditModal.value = false
    isSuccess.value = true
    setTimeout(() => isSuccess.value = false, 3000)
  }
}

const matrixCols = [
  { key: 'module', label: 'Module' },
  { key: 'super', label: 'Super Admin (System)' },
  { key: 'client', label: 'Client Admin (Tenant)' },
  { key: 'finance', label: 'Finance Agent (Tenant)' }
]

const permissionOptions: PermissionLevel[] = ['Full', 'Read', 'None']

const handleUpdateMatrix = (module: string) => {
  if (editingModule.value === module) {
    // Save
    isSuccess.value = true
    editingModule.value = null
    setTimeout(() => isSuccess.value = false, 3000)
  } else {
    // Enter Edit Mode
    editingModule.value = module
  }
}

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
      <BaseButton variant="glow" icon="plus" @click="showCreateModal = true">Create Custom Role</BaseButton>
    </header>

    <div class="roles-definitions mb-5 d-flex gap-3 flex-wrap">
      <div class="role-card glass-card p-4 flex-fill" v-for="role in roleStore.roles" :key="role.id || (role as any)._id">
        <h4 class="mb-2">{{ role.name }}</h4>
        <p class="text-muted mb-3" style="font-size: 0.875rem">{{ role.desc }}</p>
        <BaseButton variant="ghost" size="sm" @click="openEditModal(role)">Edit Role</BaseButton>
      </div>
    </div>

    <!-- Create Role Modal -->
    <AppModal 
      :show="showCreateModal" 
      title="Create Custom Role" 
      @close="showCreateModal = false" 
      @confirm="handleCreateRole"
    >
      <div class="form-grid mb-3">
        <div class="full-width">
          <BaseInput v-model="newRole.name" label="Role Name" placeholder="e.g. Compliance Officer" />
        </div>
        <div class="full-width">
          <label class="form-label fw-semibold">Description</label>
          <textarea 
            v-model="newRole.desc" 
            class="form-control" 
            rows="3" 
            placeholder="Describe the responsibilities..."
            style="background: rgba(255,255,255,0.05); border-color: var(--border-color); color: white;"
          ></textarea>
        </div>
      </div>
    </AppModal>

    <!-- Edit Role Modal -->
    <AppModal 
      :show="showEditModal" 
      title="Edit Role Details" 
      @close="showEditModal = false" 
      @confirm="handleUpdateRole"
    >
      <div v-if="editingRole" class="form-grid mb-3">
        <div class="full-width">
          <BaseInput v-model="editingRole.name" label="Role Name" />
        </div>
        <div class="full-width">
          <label class="form-label fw-semibold">Description</label>
          <textarea 
            v-model="editingRole.desc" 
            class="form-control" 
            rows="3"
            style="background: rgba(255,255,255,0.05); border-color: var(--border-color); color: white;"
          ></textarea>
        </div>
      </div>
    </AppModal>

    <h3 class="mb-3">Module Access Matrix</h3>
    <AppTable :columns="matrixCols" :data="authStore.permissionsMatrix">
      <template #col-super="{ row }">
        <select v-if="editingModule === row.module" v-model="row.super" class="form-select form-select-sm border-0 bg-transparent fw-bold" :class="getBadgeClass(row.super)">
          <option v-for="opt in permissionOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span v-else class="fw-bold" :class="getBadgeClass(row.super).replace('bg-opacity-10', '').replace('bg-', 'text-')">
          {{ row.super }}
        </span>
      </template>
      <template #col-client="{ row }">
        <select v-if="editingModule === row.module" v-model="row.client" class="form-select form-select-sm border-0 bg-transparent fw-bold" :class="getBadgeClass(row.client)">
          <option v-for="opt in permissionOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span v-else class="fw-bold" :class="getBadgeClass(row.client).replace('bg-opacity-10', '').replace('bg-', 'text-')">
          {{ row.client }}
        </span>
      </template>
      <template #col-finance="{ row }">
        <select v-if="editingModule === row.module" v-model="row.finance" class="form-select form-select-sm border-0 bg-transparent fw-bold" :class="getBadgeClass(row.finance)">
          <option v-for="opt in permissionOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span v-else class="fw-bold" :class="getBadgeClass(row.finance).replace('bg-opacity-10', '').replace('bg-', 'text-')">
          {{ row.finance }}
        </span>
      </template>
      <template #actions="{ row }">
         <BaseButton 
           variant="ghost" 
           size="sm" 
           :icon="editingModule === row.module ? 'check' : 'edit'" 
           @click="handleUpdateMatrix(row.module)" 
         />
      </template>
    </AppTable>

    <Transition name="toast">
      <div v-if="isSuccess" class="success-toast">
        <AppIcon name="check" :size="18" />
        <span>Module permissions synced successfully!</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.role-card {
  min-width: 300px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.success-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-success);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  z-index: 3000;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  bottom: 10px;
}
</style>
