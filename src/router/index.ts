import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
      meta: { title: 'Login' }
    },
    {
      path: '/',
      component: () => import('../layouts/DashboardLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardPage.vue'),
          meta: { title: 'Dashboard', module: 'Dashboard' }
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('../views/InvoicesPage.vue'),
          meta: { title: 'Invoices', module: 'Invoices' }
        },
        {
          path: 'clients',
          name: 'clients',
          component: () => import('../views/ClientsPage.vue'),
          meta: { title: 'Clients', module: 'Clients' }
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../views/ProductsPage.vue'),
          meta: { title: 'Products', module: 'Products' }
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('../views/ReportsPage.vue'),
          meta: { title: 'Reports', module: 'Reports' }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/SettingsPage.vue'),
          meta: { title: 'Settings', module: 'Settings' }
        },
        {
          path: 'account',
          name: 'account',
          component: () => import('../views/AccountPage.vue'),
          meta: { title: 'My Account' }
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/UserManagementPage.vue'),
          meta: { title: 'User Management', module: 'Role Management' }
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('../views/RoleMappingPage.vue'),
          meta: { title: 'Role Mapping', module: 'Role Management' }
        },
        {
          path: 'audit-logs',
          name: 'audit-logs',
          component: () => import('../views/AuditLogPage.vue'),
          meta: { title: 'Audit Logs', module: 'Audit Logs' }
        },
        {
          path: 'invoices/builder',
          name: 'invoice-builder',
          component: () => import('../views/InvoiceBuilderPage.vue'),
          meta: { title: 'Create Invoice', module: 'Invoices' }
        },
        {
          path: 'books',
          name: 'books',
          component: () => import('../views/BooksDashboardPage.vue'),
          meta: { title: 'Books & Finance', module: 'Finance' }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 1. Auth Guard: Redirect to login if not authenticated
  if (to.name !== 'login' && !authStore.isLoggedIn) {
    return next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    })
  }

  // 2. Prevent logged-in users from seeing the login page
  if (to.name === 'login' && authStore.isLoggedIn) {
    return next({ name: 'dashboard' })
  }

  // 3. Permission Guard: If route requires a specific module permission
  if (to.meta.module && !authStore.canAccess(to.meta.module as string)) {
    return next({ name: 'dashboard' })
  }
  
  next()
})

export default router
