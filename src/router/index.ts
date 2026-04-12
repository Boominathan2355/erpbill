import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/DashboardLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardPage.vue')
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('../views/InvoicesPage.vue')
        },
        {
          path: 'clients',
          name: 'clients',
          component: () => import('../views/ClientsPage.vue')
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../views/ProductsPage.vue')
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('../views/ReportsPage.vue')
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/SettingsPage.vue')
        },
        {
          path: 'account',
          name: 'account',
          component: () => import('../views/AccountPage.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/UserManagementPage.vue')
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('../views/RoleMappingPage.vue')
        },
        {
          path: 'audit-logs',
          name: 'audit-logs',
          component: () => import('../views/AuditLogPage.vue')
        },
        {
          path: 'invoices/builder',
          name: 'invoice-builder',
          component: () => import('../views/InvoiceBuilderPage.vue')
        }
      ]
    }
  ]
})

export default router
