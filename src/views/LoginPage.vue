<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppIcon from '../components/atoms/AppIcon.vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  // Simulate API delay
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Perform login (accepts any credentials as per user request)
    authStore.login()
    
    // Redirect to intended page or dashboard
    const redirectPath = route.query.redirect as string || '/'
    router.push(redirectPath)
  } catch (err) {
    errorMessage.value = 'An error occurred during login. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-background">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="login-card glass-card">
      <header class="login-header">
        <div class="logo-box">
          <AppIcon name="invoice" :size="32" color="white" />
        </div>
        <h1>Bill-Soft <span class="text-gradient">ERP</span></h1>
        <p>Enterprise billing solution for modern teams.</p>
      </header>

      <form class="login-form" @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="error-banner">
          <AppIcon name="trash" :size="16" />
          <span>{{ errorMessage }}</span>
        </div>

        <BaseInput 
          v-model="loginForm.email"
          label="Email Address"
          type="email"
          placeholder="admin@bill-soft.com"
          required
          :disabled="isLoading"
        />

        <BaseInput 
          v-model="loginForm.password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          :disabled="isLoading"
        />

        <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="loginForm.rememberMe">
            <span class="checkmark"></span>
            Remember me
          </label>
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>

        <BaseButton 
          type="submit" 
          variant="glow" 
          class="submit-btn" 
          :isLoading="isLoading"
        >
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </BaseButton>

        <p class="auth-footer">
          Don't have an account? <a href="#">Contact Support</a>
        </p>
      </form>
    </div>

    <footer class="legal-footer">
      <p>&copy; 2026 Bill-Soft ERP Systems. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0f172a; /* Deep blue background */
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Background Blobs */
.login-background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 20s infinite alternate;
}

.blob-1 {
  width: 400px; height: 400px;
  background: #6366f1;
  top: -100px; right: -100px;
}

.blob-2 {
  width: 300px; height: 300px;
  background: #a855f7;
  bottom: -50px; left: -50px;
  animation-delay: -5s;
}

.blob-3 {
  width: 250px; height: 250px;
  background: #10b981;
  top: 40%; left: 20%;
  animation-delay: -10s;
}

@keyframes float {
  from { transform: translate(0, 0); }
  to { transform: translate(100px, 50px); }
}

/* Card */
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 48px;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-box {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.login-header p {
  color: #94a3b8;
  font-size: 0.95rem;
}

.text-gradient {
  background: linear-gradient(to right, #818cf8, #c084fc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  margin-top: -8px;
}

.forgot-link {
  color: #818cf8;
  text-decoration: none;
  font-weight: 600;
}

.forgot-link:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  margin-top: 8px;
}

.auth-footer {
  text-align: center;
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 16px;
}

.auth-footer a {
  color: #818cf8;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Custom Checkbox */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #94a3b8;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 18px;
  width: 18px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: rgba(255, 255, 255, 0.1);
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #6366f1;
  border-color: #6366f1;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.legal-footer {
  position: absolute;
  bottom: 24px;
  z-index: 2;
  color: #475569;
  font-size: 0.8rem;
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    border: none;
    box-shadow: none;
    background: transparent;
  }
}
</style>
