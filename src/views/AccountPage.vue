<script setup lang="ts">
import { ref } from 'vue'

</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-info">
        <h1>My Account</h1>
        <p class="text-muted">Manage your personal profile and subscription.</p>
      </div>
    </header>

    <div class="account-content glass-card">
      <div class="profile-info text-center py-5">
        <div class="avatar mb-3 mx-auto">
          <span class="initials">AD</span>
        </div>
        <h3>Admin User</h3>
        <p class="text-muted">admin@billsoft.com</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: var(--spacing-xl);
}
.account-content {
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  max-width: 600px;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
