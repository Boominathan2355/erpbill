<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useAuthStore } from '../stores/auth'
import { INDIAN_STATES } from '../utils/constants'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import AppIcon from '../components/atoms/AppIcon.vue'
import BusinessSettings from '../components/organisms/BusinessSettings.vue'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const isSuccess = ref(false)

// Clone profile for local editing
const form = ref({ ...settingsStore.profile })
const taxInclusivePref = ref(settingsStore.taxInclusive)

const handleSave = () => {
  settingsStore.updateProfile(form.value)
  settingsStore.setTaxPreference(taxInclusivePref.value)
  
  isSuccess.value = true
  setTimeout(() => isSuccess.value = false, 3000)
}

onMounted(() => {
  form.value = { ...settingsStore.profile }
  taxInclusivePref.value = settingsStore.taxInclusive
})

// Update form when business switches
watch(() => settingsStore.profile, (newProfile) => {
  form.value = { ...newProfile }
}, { deep: true })
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-info">
        <h1>Business Profile</h1>
        <p class="text-muted">Configure your official billing and tax identity.</p>
      </div>
      <BaseButton variant="glow" icon="check" @click="handleSave">Save Changes</BaseButton>
    </header>

    <div class="settings-layout">
      <!-- 0. Multiple Businesses (Client Admin Only) -->
      <section v-if="authStore.currentUserRole.includes('Client Admin')" class="settings-card glass-card no-padding mb-5">
        <BusinessSettings />
        <div class="divider"></div>
      </section>

      <!-- 1. General Identity -->
      <section class="settings-card glass-card">
        <div class="card-header">
          <AppIcon name="users" :size="20" />
          <h3>Basic Details</h3>
        </div>
        <div class="form-grid">
          <div class="full-width">
            <BaseInput v-model="form.name" label="Legal Business Name" placeholder="Enterprise Ltd." />
          </div>
          <div class="full-width">
            <BaseInput v-model="form.address" label="Registered Address" placeholder="Street, Building, Area" />
          </div>
          <BaseInput v-model="form.email" label="Official Email" type="email" />
          <BaseInput v-model="form.phone" label="Contact Number" />
        </div>
      </section>

      <!-- 2. Tax & Compliance -->
      <section class="settings-card glass-card">
        <div class="card-header">
          <AppIcon name="file-text" :size="20" />
          <h3>GST & Compliance</h3>
        </div>
        <div class="form-grid">
          <BaseInput v-model="form.gstin" label="GSTIN Number" placeholder="15-digit code" />
          
          <div class="input-group">
            <label class="input-label">Registration State</label>
            <select v-model="form.stateCode" class="custom-select">
              <option v-for="state in INDIAN_STATES" :key="state.code" :value="state.code">
                {{ state.name }} ({{ state.code }})
              </option>
            </select>
          </div>

          <div class="full-width mt-2">
            <label class="toggle-control">
              <span class="label-text">Pricing Model</span>
              <div class="radio-toggle">
                <button 
                  class="toggle-btn" 
                  :class="{ active: taxInclusivePref }" 
                  @click="taxInclusivePref = true"
                >Tax Inclusive</button>
                <button 
                  class="toggle-btn" 
                  :class="{ active: !taxInclusivePref }" 
                  @click="taxInclusivePref = false"
                >Tax Exclusive</button>
              </div>
              <p class="help-text">Controls if prices entered in the builder include GST by default.</p>
            </label>
          </div>
        </div>
      </section>

      <!-- 3. Banking Info -->
      <section class="settings-card glass-card">
        <div class="card-header">
          <AppIcon name="invoice" :size="20" />
          <h3>Banking Details (For Invoice)</h3>
        </div>
        <div class="form-grid">
          <div class="full-width">
            <BaseInput v-model="form.bankName" label="Bank Name" placeholder="e.g. State Bank of India" />
          </div>
          <BaseInput v-model="form.bankAccountNo" label="Account Number" />
          <BaseInput v-model="form.bankIFSC" label="IFSC Code" />
        </div>
      </section>
    </div>

    <Transition name="toast">
      <div v-if="isSuccess" class="success-toast">
        <AppIcon name="check" :size="18" />
        <span>Profile updated successfully!</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xxl);
}

.settings-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  max-width: 900px;
  padding-bottom: 50px;
}

.settings-card { padding: var(--spacing-xl); }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: var(--spacing-lg); color: var(--color-primary); }
.card-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); }
.full-width { grid-column: span 2; }

.no-padding { padding: 0 !important; border: none; background: transparent; box-shadow: none; }
.divider { height: 1px; background: var(--border-color); margin: var(--spacing-xxl) 0; }

/* Custom Select Styling */
.input-label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
.custom-select {
  width: 100%; height: 42px; background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color); border-radius: var(--radius-md);
  color: var(--text-main); padding: 0 12px; outline: none; transition: border-color 0.2s;
}
.custom-select:focus { border-color: var(--color-primary); }
.custom-select option { background: var(--bg-app); color: var(--text-main); }

/* Toggle Styling */
.toggle-control { display: flex; flex-direction: column; gap: 8px; }
.label-text { font-size: 0.875rem; font-weight: 600; color: var(--text-muted); }
.radio-toggle { display: flex; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 8px; width: fit-content; }
.toggle-btn {
  padding: 6px 16px; border: none; background: transparent; color: var(--text-muted);
  border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.toggle-btn.active { background: var(--color-primary); color: white; }
.help-text { font-size: 0.75rem; color: var(--text-muted); margin: 4px 0 0; }

.success-toast {
  position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
  background: var(--color-success); color: white; padding: 12px 24px;
  border-radius: 50px; display: flex; align-items: center; gap: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 3000;
}

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; bottom: 10px; }

.mt-2 { margin-top: var(--spacing-sm); }
</style>
