<script setup lang="ts">
import { ref } from 'vue'
import { useBusinessStore } from '../../stores/business'
import AppIcon from '../atoms/AppIcon.vue'
import BaseButton from '../atoms/BaseButton.vue'

const businessStore = useBusinessStore()
const isAddingBusiness = ref(false)
const newBusinessName = ref('')

const handleAddBusiness = async () => {
  if (!newBusinessName.value) return
  const id = await businessStore.addBusiness(newBusinessName.value)
  newBusinessName.value = ''
  isAddingBusiness.value = false
  // Switch to new business
  if (id) {
    businessStore.switchBusiness(id)
  }
}
</script>

<template>
  <div class="business-settings">
    <div class="section-header">
      <div class="header-text">
        <h3>Manage Businesses</h3>
        <p>Switch between, edit, or add new business profiles to your account (Max 5).</p>
      </div>
      <div class="header-actions">
        <span v-if="!businessStore.canAddBusiness" class="limit-text">
          Max limit of 5 reached
        </span>
        <BaseButton 
          variant="primary" 
          @click="isAddingBusiness = true" 
          v-if="!isAddingBusiness"
          :disabled="!businessStore.canAddBusiness"
        >
          <AppIcon name="plus" :size="18" />
          New Business
        </BaseButton>
      </div>
    </div>

    <div v-if="isAddingBusiness" class="add-business-card glass-card">
      <h4>Create New Business</h4>
      <div class="form-group">
        <label>Business Name</label>
        <input 
          v-model="newBusinessName" 
          placeholder="e.g., Acme Corp South" 
          @keyup.enter="handleAddBusiness"
        />
      </div>
      <div class="actions">
        <BaseButton variant="ghost" @click="isAddingBusiness = false">Cancel</BaseButton>
        <BaseButton variant="primary" @click="handleAddBusiness">Create Business</BaseButton>
      </div>
    </div>

    <div class="business-list">
      <div 
        v-for="biz in businessStore.businesses" 
        :key="biz.id" 
        class="business-card glass-card"
        :class="{ active: biz.id === businessStore.activeBusinessId }"
      >
        <div class="biz-info">
          <div class="biz-avatar">
            <AppIcon name="home" :size="24" />
          </div>
          <div class="biz-details">
            <div class="biz-header">
              <span class="biz-title">{{ biz.name }}</span>
              <span v-if="biz.id === businessStore.activeBusinessId" class="active-badge">Active</span>
            </div>
            <span class="biz-id">ID: {{ biz.id }}</span>
          </div>
        </div>
        
        <div class="biz-actions">
          <BaseButton 
            v-if="biz.id !== businessStore.activeBusinessId"
            variant="ghost" 
            size="sm"
            @click="businessStore.switchBusiness(biz.id)"
          >
            Switch to this
          </BaseButton>
          <BaseButton 
            v-if="businessStore.businesses.length > 1"
            variant="ghost" 
            size="sm"
            class="delete-btn"
            @click="businessStore.deleteBusiness(biz.id)"
          >
            <AppIcon name="menu" :size="16" />
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.business-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-text h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.header-text p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.limit-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.add-business-card {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  border: 1px dashed var(--color-primary);
  background: var(--color-primary-glow);
}

.add-business-card h4 {
  margin: 0;
  color: var(--color-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
}

.form-group input {
  padding: var(--spacing-md);
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.business-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.business-card {
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.business-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-glow);
}

.biz-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.biz-avatar {
  width: 48px;
  height: 48px;
  background: var(--bg-app);
  color: var(--text-muted);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}

.active .biz-avatar {
  background: white;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.biz-details {
  display: flex;
  flex-direction: column;
}

.biz-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.biz-title {
  font-weight: 700;
  color: var(--text-main);
}

.biz-id {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-family: monospace;
}

.active-badge {
  font-size: 0.65rem;
  background: var(--color-primary);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
}

.biz-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.delete-btn:hover {
  color: #ef4444 !important;
}
</style>
