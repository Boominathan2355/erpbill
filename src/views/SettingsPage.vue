<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'

</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-info">
        <h1>Settings</h1>
        <p class="text-muted">Configure application settings and preferences.</p>
      </div>
    </header>

    <div class="settings-content glass-card">
      <div class="form-grid">
        <BaseInput modelValue="" label="Company Name" placeholder="Your Company" />
        <BaseInput modelValue="" label="Support Email" type="email" placeholder="support@company.com" />
        <div class="full-width mt-3">
          <BaseButton variant="primary">Save Settings</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: var(--spacing-xl);
}
.settings-content {
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  max-width: 800px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}
.full-width {
  grid-column: span 2;
}
</style>
