<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/users'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import AppTable from '../components/organisms/AppTable.vue'
import AppModal from '../components/organisms/AppModal.vue'

const userStore = useUserStore()
const searchQuery = ref('')
const showSyncModal = ref(false)
const showCreateAdminModal = ref(false)
const showEditModal = ref(false)
const editingUser = ref<any>(null)

const columns = [
  { key: 'name', label: 'UserName' },
  { key: 'role', label: 'Assigned Role' },
  { key: 'source', label: 'Auth Source' },
  { key: 'status', label: 'Status' }
]

onMounted(() => {
  userStore.fetchUsers()
})

const handleEdit = (user: any) => {
  editingUser.value = { ...user }
  showEditModal.value = true
}

const handleUpdate = async () => {
  if (editingUser.value) {
    await userStore.updateUser(editingUser.value._id || editingUser.value.id, editingUser.value)
    showEditModal.value = false
  }
}

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this user?')) {
    await userStore.deleteUser(id)
  }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header d-flex justify-content-between align-items-center mb-4">
      <div class="header-info">
        <h1>Users & Tenants</h1>
        <p class="text-muted">Manage Super Admins, Client Tenants, and LDAP integrations.</p>
      </div>
      <div class="actions d-flex gap-2">
        <BaseButton variant="ghost" icon="download" @click="showSyncModal = true">Sync LDAP Directory</BaseButton>
        <BaseButton variant="glow" icon="plus" @click="showCreateAdminModal = true">Create Tenant Admin</BaseButton>
      </div>
    </header>

    <div class="table-actions glass-card mb-4 p-3" style="max-width: 400px;">
      <BaseInput v-model="searchQuery" placeholder="Search by name, email, or role..." icon="users" />
    </div>

    <AppTable :columns="columns" :data="userStore.users" :loading="userStore.isLoading">
      <template #actions="{ row }">
        <BaseButton variant="ghost" size="sm" icon="edit" @click="handleEdit(row)" />
        <BaseButton variant="ghost" size="sm" icon="trash" @click="handleDelete(row._id || row.id)" />
      </template>
    </AppTable>
    
    <!-- LDAP Modal -->
    <AppModal 
      :show="showSyncModal" 
      title="LDAP / Active Directory Sync" 
      @close="showSyncModal = false" 
      @confirm="showSyncModal = false"
    >
      <div class="form-grid mb-3">
        <BaseInput modelValue="" label="LDAP Server URL" placeholder="ldap://ad.company.com:389" />
        <BaseInput modelValue="" label="Base DN" placeholder="dc=company,dc=com" />
        <BaseInput modelValue="" label="Bind DN (Service Account)" placeholder="cn=admin,dc=company,dc=com" />
        <BaseInput modelValue="" label="Bind Password" type="password" placeholder="••••••••" />
      </div>
      <p class="text-muted" style="font-size: 0.85rem">Running sync will map LDAP groups to BillSoft roles automatically based on your Role Mapping config.</p>
    </AppModal>

    <!-- Create Tenant Admin -->
    <AppModal 
      :show="showCreateAdminModal" 
      title="Provision New Client Tenant" 
      @close="showCreateAdminModal = false" 
      @confirm="showCreateAdminModal = false"
    >
      <div class="form-grid mb-3">
        <div class="full-width mb-3">
          <label class="form-label fw-semibold">Workspace / Tenant Name</label>
          <input class="form-control input-field" placeholder="e.g. Acme Corp Sandbox" />
        </div>
        <BaseInput modelValue="" label="Admin Full Name" placeholder="Jane Smith" />
        <BaseInput modelValue="" label="Admin Email" type="email" placeholder="jane@acme.com" />
        <BaseInput modelValue="" label="Temporary Password" type="password" placeholder="••••••••" />
        <div class="mb-3 w-100">
           <label class="form-label fw-semibold">Assign Role</label>
           <select class="form-select">
              <option>Client Admin (Full Tenant Access)</option>
              <option>Finance Manager</option>
           </select>
        </div>
      </div>
    </AppModal>

    <!-- Edit User Modal -->
    <AppModal 
      :show="showEditModal" 
      title="Edit System User" 
      @close="showEditModal = false" 
      @confirm="handleUpdate"
    >
      <div v-if="editingUser" class="form-grid mb-3">
        <BaseInput v-model="editingUser.name" label="Full Name" placeholder="Jane Smith" />
        <BaseInput v-model="editingUser.email" label="Email" type="email" placeholder="jane@acme.com" />
        <div class="mb-3 w-100">
           <label class="form-label fw-semibold">Role</label>
           <select v-model="editingUser.role" class="form-select">
              <optgroup label="System Roles">
                <option value="Super Admin">Super Admin (System)</option>
              </optgroup>
              <optgroup label="Tenant Roles">
                <option value="Client Admin">Client Admin (Tenant)</option>
                <option value="Finance Agent">Finance Agent</option>
              </optgroup>
           </select>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.full-width {
  grid-column: span 2;
}
</style>
