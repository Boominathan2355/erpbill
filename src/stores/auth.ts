import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { Role, PermissionRow, PermissionLevel } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'

export const useAuthStore = defineStore('auth', () => {
  const currentUserRole = ref<string>(
    readJSONStorage<string>('auth_current_role', 'Super Admin')
  )

  const roles = ref<Role[]>([
    { id: 1, name: 'Super Admin', desc: 'Can manage billing platform and create new client tenants.' },
    { id: 2, name: 'Client Admin (Billing)', desc: 'Full access to a specific clients billing modules.' },
    { id: 3, name: 'Finance Agent', desc: 'Read/Write access to invoices, no access to settings.' }
  ])

  const permissionsMatrix = ref<PermissionRow[]>(
    readJSONStorage<PermissionRow[]>('auth_permissions_matrix', [
      { module: 'Dashboard', super: 'Full', client: 'Full', finance: 'Read' },
      { module: 'Invoices', super: 'Full', client: 'Full', finance: 'Full' },
      { module: 'Clients', super: 'Full', client: 'Full', finance: 'Read' },
      { module: 'Products', super: 'Full', client: 'Full', finance: 'Read' },
      { module: 'Settings', super: 'Full', client: 'Full', finance: 'None' },
      { module: 'Audit Logs', super: 'Full', client: 'None', finance: 'None' },
      { module: 'Role Management', super: 'Full', client: 'None', finance: 'None' },
    ])
  )

  const setRole = (roleName: string) => {
    currentUserRole.value = roleName
  }

  const updateMatrix = (newMatrix: PermissionRow[]) => {
    permissionsMatrix.value = [...newMatrix]
  }

  const canAccess = (moduleName: string): boolean => {
    const row = permissionsMatrix.value.find(r => r.module === moduleName)
    if (!row) return true // Default allow if module not in matrix

    let level: PermissionLevel = 'None'
    
    if (currentUserRole.value === 'Super Admin') level = row.super
    else if (currentUserRole.value.includes('Client Admin')) level = row.client
    else if (currentUserRole.value.includes('Finance Agent')) level = row.finance

    return level !== 'None'
  }

  // Watch for changes and persist
  watch(currentUserRole, (newRole) => {
    writeJSONStorage('auth_current_role', newRole)
  })

  watch(permissionsMatrix, (newMatrix) => {
    writeJSONStorage('auth_permissions_matrix', newMatrix)
  }, { deep: true })

  return {
    currentUserRole,
    roles,
    permissionsMatrix,
    setRole,
    updateMatrix,
    canAccess
  }
})
