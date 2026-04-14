<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '../stores/clients'
import AppTable from '../components/organisms/AppTable.vue'
import AppModal from '../components/organisms/AppModal.vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import AppIcon from '../components/atoms/AppIcon.vue'

const clientStore = useClientStore()

onMounted(() => {
  clientStore.fetchClients()
})
const showModal = ref(false)
const searchQuery = ref('')

const columns = [
  { key: 'name', label: 'Client Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'gstin', label: 'GSTIN' }
]

const filteredClients = computed(() => {
  if (!searchQuery.value) return clientStore.clients
  return clientStore.clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const newClient = ref<{
  type: import('../types').ClientType
  name: string
  email: string
  phone: string
  address: string
  gstin?: string
  stateCode?: string
  country?: string
  currency?: string
  taxId?: string
}>({
  type: 'b2b',
  name: '',
  email: '',
  phone: '',
  address: '',
  gstin: '',
  stateCode: '',
  country: '',
  currency: 'INR',
  taxId: ''
})

const openAddModal = () => {
  newClient.value = { 
    type: 'b2b',
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    gstin: '',
    stateCode: '',
    country: '',
    currency: 'INR',
    taxId: ''
  }
  showModal.value = true
}

const handleAddClient = () => {
  if (!newClient.value.name) return
  // Auto-extract state code from GSTIN for B2B if present
  if (newClient.value.type === 'b2b' && newClient.value.gstin && newClient.value.gstin.length >= 2) {
    newClient.value.stateCode = newClient.value.gstin.substring(0, 2)
  }
  clientStore.addClient(newClient.value)
  showModal.value = false
}

const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this client?')) {
    clientStore.deleteClient(id)
  }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-info">
        <h1>Clients</h1>
        <p class="text-muted">Manage your customer database</p>
      </div>
      <BaseButton variant="glow" icon="plus" @click="openAddModal">Add Client</BaseButton>
    </header>

    <div class="table-actions glass-card">
      <BaseInput 
        v-model="searchQuery" 
        placeholder="Search clients..." 
        icon="users"
      />
    </div>

    <AppTable :columns="columns" :data="filteredClients">
      <template #actions="{ row }">
        <BaseButton variant="ghost" size="sm" icon="trash" @click="handleDelete(row.id)" />
      </template>
    </AppTable>

    <!-- Add Client Modal -->
    <AppModal 
      :show="showModal" 
      title="Add New Client" 
      @close="showModal = false" 
      @confirm="handleAddClient"
    >
      <div class="mb-4">
        <label class="form-label fw-semibold" style="font-size: 0.875rem;">Client Type</label>
        <div class="d-flex gap-3">
          <div class="form-check">
            <input class="form-check-input" type="radio" v-model="newClient.type" value="b2b" id="b2b" />
            <label class="form-check-label" for="b2b">B2B (Domestic Business)</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" v-model="newClient.type" value="b2c" id="b2c" />
            <label class="form-check-label" for="b2c">B2C (Domestic Consumer)</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" v-model="newClient.type" value="b2e" id="b2e" />
            <label class="form-check-label" for="b2e">B2E (Export)</label>
          </div>
        </div>
      </div>

      <div class="form-grid">
        <BaseInput v-model="newClient.name" :label="newClient.type === 'b2c' ? 'Customer Name' : 'Company Name'" required placeholder="Acme Corp" />
        <BaseInput v-model="newClient.email" label="Email Address" type="email" placeholder="billing@acme.com" />
        <BaseInput v-model="newClient.phone" label="Phone Number" placeholder="+91 ..." />
        
        <BaseInput v-if="newClient.type === 'b2b'" v-model="newClient.gstin" label="GSTIN" placeholder="27XXXX..." />
        
        <div v-if="newClient.type === 'b2c'" class="mb-3 w-100">
          <label class="form-label fw-semibold mb-1" style="font-size: 0.875rem;">Place of Supply (State Code)</label>
          <select v-model="newClient.stateCode" class="form-select">
            <option value="" disabled>Select State Code...</option>
            <option value="27">27 - Maharashtra</option>
            <option value="29">29 - Karnataka</option>
            <!-- Add other common codes as needed -->
          </select>
        </div>

        <template v-if="newClient.type === 'b2e'">
          <BaseInput v-model="newClient.country" label="Country" placeholder="e.g. United States" />
          <div class="mb-3 w-100">
            <label class="form-label fw-semibold mb-1" style="font-size: 0.875rem;">Currency</label>
            <select v-model="newClient.currency" class="form-select">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
          <BaseInput v-model="newClient.taxId" label="Foreign Tax ID" placeholder="Optional" />
        </template>

        <div class="full-width mt-3">
          <BaseInput v-model="newClient.address" label="Full Address" placeholder="Street, City, Pin Code" />
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.table-actions {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  max-width: 400px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.full-width {
  grid-column: span 2;
}

.text-muted {
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
