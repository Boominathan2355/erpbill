<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import { formatCurrency } from '../utils/formatters'
import AppTable from '../components/organisms/AppTable.vue'
import AppModal from '../components/organisms/AppModal.vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'

const productStore = useProductStore()

onMounted(() => {
  productStore.fetchProducts()
})
const showModal = ref(false)
const searchQuery = ref('')

const columns = [
  { key: 'name', label: 'Item Name' },
  { key: 'price', label: 'Unit Price' },
  { key: 'unit', label: 'Unit' },
  { key: 'taxRate', label: 'GST %' }
]

const filteredProducts = computed(() => {
  if (!searchQuery.value) return productStore.products
  return productStore.products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const newProduct = ref({
  name: '',
  description: '',
  price: 0,
  unit: 'pcs',
  taxRate: 18,
  hsnCode: ''
})

const openAddModal = () => {
  newProduct.value = { name: '', description: '', price: 0, unit: 'pcs', taxRate: 18, hsnCode: '' }
  showModal.value = true
}

const handleAddProduct = () => {
  if (!newProduct.value.name) return
  productStore.addProduct({ ...newProduct.value, price: Number(newProduct.value.price) })
  showModal.value = false
}

const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this product?')) {
    productStore.deleteProduct(id)
  }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-info">
        <h1>Products & Services</h1>
        <p class="text-muted">Manage your inventory and pricing</p>
      </div>
      <BaseButton variant="glow" icon="plus" @click="openAddModal">Add Product</BaseButton>
    </header>

    <div class="table-actions glass-card">
      <BaseInput 
        v-model="searchQuery" 
        placeholder="Search products..." 
        icon="box"
      />
    </div>

    <AppTable :columns="columns" :data="filteredProducts">
      <template #col-price="{ row }">
        <span class="font-mono">{{ formatCurrency(row.price) }}</span>
      </template>
      <template #col-taxRate="{ row }">
        {{ row.taxRate }}%
      </template>
      <template #actions="{ row }">
        <BaseButton variant="ghost" size="sm" icon="trash" @click="handleDelete(row.id)" />
      </template>
    </AppTable>

    <!-- Add Product Modal -->
    <AppModal 
      :show="showModal" 
      title="Add New Product/Service" 
      @close="showModal = false" 
      @confirm="handleAddProduct"
    >
      <div class="form-grid">
        <div class="full-width">
          <BaseInput v-model="newProduct.name" label="Product Name" required placeholder="Web Development" />
        </div>
        <div class="full-width">
          <BaseInput v-model="newProduct.description" label="Description" placeholder="Project based billing..." />
        </div>
        <BaseInput v-model="newProduct.price" label="Unit Price" type="number" step="0.01" />
        <BaseInput v-model="newProduct.unit" label="Unit" placeholder="e.g., pcs, hrs, month" />
        <BaseInput v-model="newProduct.taxRate" label="Tax Rate (%)" type="number" />
        <BaseInput v-model="newProduct.hsnCode" label="HSN/SAC Code" placeholder="Optional" />
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
