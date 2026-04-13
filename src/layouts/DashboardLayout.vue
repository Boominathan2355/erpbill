<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { useBusinessStore } from '../stores/business'
import { useClientStore } from '../stores/clients'
import { useProductStore } from '../stores/products'
import { useInvoiceStore } from '../stores/invoices'
import { useTransactionStore } from '../stores/transactions'
import AppIcon from '../components/atoms/AppIcon.vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import CommandPalette from '../components/organisms/CommandPalette.vue'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const businessStore = useBusinessStore()
const router = useRouter()
const isCollapsed = ref(false)
const isCommandPaletteOpen = ref(false)
const isAccountMenuOpen = ref(false)
const isBusinessMenuOpen = ref(false)
const accountMenuRef = ref<HTMLElement | null>(null)
const businessMenuRef = ref<HTMLElement | null>(null)

const toggleTheme = () => themeStore.toggleTheme()
const toggleAccountMenu = () => {
  isAccountMenuOpen.value = !isAccountMenuOpen.value
}

const handleLogout = () => {
  authStore.logout()
  isAccountMenuOpen.value = false
  router.push('/login')
}

const handleClickOutside = (event: MouseEvent) => {
  if (accountMenuRef.value && !accountMenuRef.value.contains(event.target as Node)) {
    isAccountMenuOpen.value = false
  }
  if (businessMenuRef.value && !businessMenuRef.value.contains(event.target as Node)) {
    isBusinessMenuOpen.value = false
  }
}

const openCommandPalette = () => {
  isCommandPaletteOpen.value = true
}

const closeCommandPalette = () => {
  isCommandPaletteOpen.value = false
}

const handleCommandSelect = (action: { to?: string; run?: () => void }) => {
  if (action.run) {
    action.run()
  } else if (action.to) {
    router.push(action.to)
  }

  closeCommandPalette()
}

const commandActions = computed(() => {
  const allActions = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      description: 'View key metrics and recent activity',
      icon: 'home' as const,
      group: 'Navigation',
      keywords: ['home', 'overview', 'summary'],
      to: '/',
      module: 'Dashboard'
    },
    {
      id: 'invoice-builder',
      label: 'Create Invoice',
      description: 'Open the invoice builder for a new bill',
      icon: 'invoice' as const,
      group: 'Create',
      keywords: ['new invoice', 'builder', 'billing'],
      to: '/invoices/builder',
      module: 'Invoices'
    },
    {
      id: 'invoices',
      label: 'Open Invoices',
      description: 'Review drafts, paid invoices, and overdue items',
      icon: 'invoice' as const,
      group: 'Navigation',
      keywords: ['bills', 'sales', 'documents'],
      to: '/invoices',
      module: 'Invoices'
    },
    {
      id: 'clients',
      label: 'Open Clients',
      description: 'Manage B2B, B2C, and export customer records',
      icon: 'users' as const,
      group: 'Navigation',
      keywords: ['customer', 'party', 'contacts'],
      to: '/clients',
      module: 'Clients'
    },
    {
      id: 'products',
      label: 'Open Products',
      description: 'Review services, items, and rate cards',
      icon: 'box' as const,
      group: 'Navigation',
      keywords: ['items', 'catalog', 'stock'],
      to: '/products',
      module: 'Products'
    },
    {
      id: 'books',
      label: 'Open Books & Finance',
      description: 'Review income, expenses, and cash flow analytics',
      icon: 'file-text' as const,
      group: 'Navigation',
      keywords: ['finance', 'accounting', 'ledger', 'profit'],
      to: '/books',
      module: 'Finance'
    },
    {
      id: 'reports',
      label: 'Open Reports',
      description: 'Inspect tax, revenue, and aging reports',
      icon: 'file-text' as const,
      group: 'Insights',
      keywords: ['gstr', 'analytics', 'charts'],
      to: '/reports',
      module: 'Reports'
    },
    {
      id: 'settings',
      label: 'Open Settings',
      description: 'Adjust billing, profile, and system preferences',
      icon: 'settings' as const,
      group: 'System',
      keywords: ['preferences', 'profile', 'configuration'],
      to: '/settings',
      module: 'Settings'
    },
    {
      id: 'users',
      label: 'Open Users & Tenants',
      description: 'Manage LDAP-backed users and tenant admins',
      icon: 'users' as const,
      group: 'Super Admin',
      keywords: ['ldap', 'tenants', 'admins'],
      to: '/users',
      module: 'Role Management'
    },
    {
      id: 'roles',
      label: 'Open Role Mapping',
      description: 'Tune module access and permission mapping',
      icon: 'check' as const,
      group: 'Super Admin',
      keywords: ['permissions', 'access', 'rbac'],
      to: '/roles',
      module: 'Role Management'
    },
    {
      id: 'audit-logs',
      label: 'Open Audit Logs',
      description: 'Trace user actions, edits, and security events',
      icon: 'search' as const,
      group: 'Super Admin',
      keywords: ['history', 'events', 'tracking'],
      to: '/audit-logs',
      module: 'Audit Logs'
    },
    {
      id: 'account',
      label: 'Open Account',
      description: 'View profile, access, and billing owner details',
      icon: 'users' as const,
      group: 'System',
      keywords: ['profile', 'identity', 'owner'],
      to: '/account'
    },
    {
      id: 'theme',
      label: themeStore.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode',
      description: 'Toggle the application color mode',
      icon: themeStore.theme === 'light' ? ('moon' as const) : ('sun' as const),
      group: 'System',
      keywords: ['theme', 'appearance', 'dark', 'light'],
      run: toggleTheme
    }
  ]

  return allActions.filter(action => !action.module || authStore.canAccess(action.module))
})

const handleGlobalShortcut = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openCommandPalette()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalShortcut)
  window.addEventListener('click', handleClickOutside)

  // Initial Data Fetch
  if (authStore.isLoggedIn) {
    businessStore.fetchBusinesses()
    useClientStore().fetchClients()
    useProductStore().fetchProducts()
    useInvoiceStore().fetchInvoices()
    useTransactionStore().fetchTransactions()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalShortcut)
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="app-layout">
    <aside :class="['sidebar', 'glass-card', { 'collapsed': isCollapsed }]">
      <div class="sidebar-header">
        <div class="brand" v-if="!isCollapsed">
          <h1>BillSoft</h1>
        </div>
        <button class="toggle-btn" @click="isCollapsed = !isCollapsed">
          <AppIcon name="menu" :size="22" />
        </button>
      </div>

      
      <nav class="nav-menu">
        <router-link v-if="authStore.canAccess('Dashboard')" to="/" class="nav-item" exact-active-class="active" title="Dashboard">
          <AppIcon name="home" />
          <span v-show="!isCollapsed">Dashboard</span>
        </router-link>
        <router-link v-if="authStore.canAccess('Invoices')" to="/invoices" class="nav-item" active-class="active" title="Invoices">
          <AppIcon name="invoice" />
          <span v-show="!isCollapsed">Invoices</span>
        </router-link>
        <router-link v-if="authStore.canAccess('Clients')" to="/clients" class="nav-item" active-class="active" title="Clients">
          <AppIcon name="users" />
          <span v-show="!isCollapsed">Clients</span>
        </router-link>
        <router-link v-if="authStore.canAccess('Products')" to="/products" class="nav-item" active-class="active" title="Products">
          <AppIcon name="box" />
          <span v-show="!isCollapsed">Products</span>
        </router-link>
        <router-link v-if="authStore.canAccess('Finance')" to="/books" class="nav-item" active-class="active" title="Books & Finance">
          <AppIcon name="file-text" />
          <span v-show="!isCollapsed">Books</span>
        </router-link>
        <router-link v-if="authStore.canAccess('Reports')" to="/reports" class="nav-item" active-class="active" title="Reports">
          <AppIcon name="file-text" />
          <span v-show="!isCollapsed">Reports</span>
        </router-link>

        <template v-if="authStore.canAccess('Audit Logs') || authStore.canAccess('Role Management')">
          <div class="sidebar-section-header" v-show="!isCollapsed" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: bold; margin: 16px 16px 8px;">Super Admin</div>
          
          <router-link v-if="authStore.canAccess('Role Management')" to="/users" class="nav-item" active-class="active" title="User Management (LDAP)">
            <AppIcon name="users" />
            <span v-show="!isCollapsed">Users & Tenants</span>
          </router-link>
          <router-link v-if="authStore.canAccess('Role Management')" to="/roles" class="nav-item" active-class="active" title="Role Mapping">
            <AppIcon name="check" />
            <span v-show="!isCollapsed">Role Mapping</span>
          </router-link>
          <router-link v-if="authStore.canAccess('Audit Logs')" to="/audit-logs" class="nav-item" active-class="active" title="Audit Logs">
            <AppIcon name="search" />
            <span v-show="!isCollapsed">Audit Logs</span>
          </router-link>
        </template>

        <router-link v-if="authStore.canAccess('Settings')" to="/settings" class="nav-item mt-auto" active-class="active" title="Settings">
          <AppIcon name="settings" />
          <span v-show="!isCollapsed">Settings</span>
        </router-link>
      </nav>
    </aside>

    <div class="main-container">

      <header class="app-header glass-card">
        <div class="header-left">
          <div v-if="authStore.currentUserRole.includes('Client Admin')" class="business-selector-container" ref="businessMenuRef">
            <button 
              class="business-selector-btn glass-card" 
              :class="{ active: isBusinessMenuOpen }"
              @click="isBusinessMenuOpen = !isBusinessMenuOpen"
            >
              <div class="biz-icon">
                <AppIcon name="home" :size="16" />
              </div>
              <div class="biz-info">
                <span class="biz-name">{{ businessStore.activeBusiness?.name }}</span>
                <span class="biz-label">Active Business</span>
              </div>
              <AppIcon name="menu" :size="16" class="chevron" />
            </button>

            <transition name="dropdown-fade">
              <div v-if="isBusinessMenuOpen" class="business-dropdown glass-card">
                <div class="dropdown-header">
                  <span class="dropdown-title">Switch Business</span>
                </div>
                <div class="biz-list">
                  <button 
                    v-for="biz in businessStore.businesses" 
                    :key="biz.id"
                    class="biz-item"
                    :class="{ active: biz.id === businessStore.activeBusinessId }"
                    @click="businessStore.switchBusiness(biz.id)"
                  >
                    <div class="biz-item-icon">
                      <AppIcon :name="biz.id === businessStore.activeBusinessId ? 'check' : 'home'" :size="14" />
                    </div>
                    <span>{{ biz.name }}</span>
                  </button>
                </div>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item add-biz" @click="router.push('/settings')">
                  <AppIcon name="plus" :size="16" />
                  <span>Manage Businesses</span>
                </button>
              </div>
            </transition>
          </div>

          <h2 class="page-title">{{ $route.meta.title || 'Dashboard' }}</h2>
        </div>

        <button class="command-trigger header-search" type="button" @click="openCommandPalette">
          <AppIcon name="search" :size="16" />
          <span class="command-trigger-label">Quick Search</span>
          <kbd class="command-trigger-hint">Ctrl K</kbd>
        </button>

        <div class="header-right">
          <div class="header-account-container" ref="accountMenuRef">
            <button 
              class="header-account-card" 
              :class="{ active: isAccountMenuOpen }"
              @click.stop="toggleAccountMenu"
            >
              <div class="user-info">
                <span class="user-name">{{ authStore.currentUser?.name || 'System User' }}</span>
                <span class="user-role">{{ authStore.currentUserRole }}</span>
              </div>
              <div class="avatar-sm">
                <AppIcon name="users" :size="16" />
              </div>
            </button>

            <transition name="dropdown-fade">
              <div v-if="isAccountMenuOpen" class="account-dropdown glass-card">
                <div class="dropdown-header">
                  <span class="dropdown-title">System Settings</span>
                </div>
                
                <div class="dropdown-menu-items">
                  <router-link to="/account" class="dropdown-item" @click="isAccountMenuOpen = false">
                    <AppIcon name="users" :size="18" />
                    <span>My Profile</span>
                  </router-link>

                  <div class="dropdown-divider"></div>

                  <button class="dropdown-item" @click="toggleTheme">
                    <AppIcon :name="themeStore.theme === 'light' ? 'moon' : 'sun'" :size="18" />
                    <span>{{ themeStore.theme === 'light' ? 'Dark Mode' : 'Light Mode' }}</span>
                  </button>

                  <div class="dropdown-divider"></div>

                  <button class="dropdown-item logout-item" @click="handleLogout">
                    <AppIcon name="box" :size="18" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <CommandPalette
      :show="isCommandPaletteOpen"
      :actions="commandActions"
      @close="closeCommandPalette"
      @select="handleCommandSelect"
    />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-app);
}

.sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  gap: var(--spacing-xl);
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar.collapsed {
  width: 80px;
  padding: var(--spacing-lg) var(--spacing-md);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  width: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  white-space: nowrap;
}

.logo-box {
  background: var(--color-primary);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-box-mini {
  background: var(--color-primary);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: auto;
}

.toggle-btn:hover {
  background: var(--bg-app);
  color: var(--color-primary);
}

.command-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--bg-app);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.command-trigger:hover {
  color: var(--text-main);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

.header-search {
  padding: 0;
  height: 42px;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-sm);
  width: 320px;
  justify-content: space-between;
}

.command-trigger-label {
  flex: 1;
  text-align: left;
  font-weight: 600;
  color: var(--text-main);
}

.command-trigger-hint {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 700;
}

.brand h1 {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.collapsed .nav-item {
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.nav-item:hover {
  background: var(--bg-app);
  color: var(--text-main);
}

.nav-item.active {
  background: var(--color-primary-glow);
  color: var(--color-primary);
}

.main-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 0;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-lg);
  height: 64px;
  flex-shrink: 0;
  position: relative;
  z-index: 2000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.business-selector-container {
  position: relative;
}

.business-selector-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 6px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
  text-align: left;
}

.business-selector-btn:hover, .business-selector-btn.active {
  border-color: var(--color-primary);
  background: var(--bg-app);
}

.biz-icon {
  width: 32px;
  height: 32px;
  background: var(--color-primary-glow);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.biz-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.biz-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

.biz-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.business-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 240px;
  z-index: 2100;
  padding: var(--spacing-sm);
  background: var(--bg-surface);
  box-shadow: var(--shadow-lg);
}

.biz-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.biz-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.biz-item:hover {
  background: var(--bg-app);
  color: var(--color-primary);
}

.biz-item.active {
  background: var(--color-primary-glow);
  color: var(--color-primary);
}

.biz-item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.add-biz {
  color: var(--color-primary) !important;
}

.chevron {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.active .chevron {
  transform: rotate(180deg);
}

.page-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-action-btn {
  font-weight: 600;
  font-size: 0.875rem;
}

.header-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border-color);
}

.header-account-container {
  position: relative;
}

.header-account-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  cursor: pointer;
  color: inherit;
  font-family: inherit;
}

.header-account-card:hover, .header-account-card.active {
  border-color: var(--color-primary);
  background: var(--bg-surface);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.header-account-card .user-info {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.account-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  z-index: 2100;
  padding: var(--spacing-sm);
  transform-origin: top right;
  background-color: var(--bg-surface);
  box-shadow: var(--shadow-lg);
}

.dropdown-header {
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-xs);
}

.dropdown-title {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.dropdown-menu-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0.75rem var(--spacing-md);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-app);
  color: var(--color-primary);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--spacing-xs) var(--spacing-sm);
}

.logout-item {
  color: #ef4444;
}

.logout-item:hover {
  background: #fef2f2;
  color: #dc2626;
}

[data-theme="dark"] .logout-item:hover {
  background: #450a0a;
  color: #f87171;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

.user-role {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-weight: 600;
}

.footer-btn {
  width: 100%;
  justify-content: flex-start;
}

.collapsed .footer-btn {
  justify-content: center;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  margin: 0;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

/* Page Transitions */
.page-fade-enter-active, .page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-fade-enter-from { opacity: 0; transform: translateY(10px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* Dropdown Transitions */
.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
