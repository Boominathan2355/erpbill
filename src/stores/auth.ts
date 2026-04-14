/* src/stores/auth.ts */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Role, PermissionRow, PermissionLevel, User, ClientType } from '../types'
import { readJSONStorage, writeJSONStorage, writeStringStorage, readStringStorage } from '../utils/browserStorage'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(
    readJSONStorage<User | null>('auth_user', null)
  )

  const currentUserRole = ref<string>(
    currentUser.value?.role || readStringStorage('auth_current_role', 'Super Admin')
  )

  const currentType = ref<ClientType>(
    readJSONStorage<ClientType>('auth_current_bill_type', 'b2b')
  )

  const isLoggedIn = ref<boolean>(!!readStringStorage('auth_token', ''))


  const permissionsMatrix = ref<PermissionRow[]>(
    readJSONStorage<PermissionRow[]>('auth_permissions_matrix', [
      { module: 'Dashboard', super: 'Full', client: 'Full', finance: 'Read' },
      { module: 'Invoices', super: 'Full', client: 'Full', finance: 'Full' },
      { module: 'Clients', super: 'Full', client: 'Full', finance: 'Read' },
      { module: 'Products', super: 'Full', client: 'Full', finance: 'Read' },
      { module: 'Settings', super: 'Full', client: 'Full', finance: 'None' },
      { module: 'Audit Logs', super: 'Full', client: 'None', finance: 'None' },
      { module: 'Role Management', super: 'Full', client: 'None', finance: 'None' },
      { module: 'Finance', super: 'Full', client: 'Full', finance: 'Full' },
    ])
  )

  const setRole = (roleName: string) => {
    currentUserRole.value = roleName
  }

  const setType = (type: ClientType) => {
    currentType.value = type
  }

  const logout = () => {
    currentUser.value = null;
    currentUserRole.value = 'Super Admin';
    isLoggedIn.value = false;
    writeStringStorage('auth_token', '');
    writeJSONStorage('auth_user', null);
  }

  const fetchProfile = async (): Promise<void> => {
    try {
      const response = await api.get('/auth/me');
      const { user } = response.data.data;
      currentUser.value = user;
      currentUserRole.value = user.role;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    }
  }

  const login = async (credentials: { username: string; password: string }): Promise<void> => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, accessToken } = response.data.data;
      
      currentUser.value = user;
      currentUserRole.value = user.role;
      isLoggedIn.value = true;
      
      writeStringStorage('auth_token', accessToken);
      writeJSONStorage('auth_user', user);
      writeStringStorage('auth_current_role', user.role);
      
      // Fetch fresh profile to ensure all data is in sync
      await fetchProfile();
    } catch (error: any) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  // Initial fetch if token exists
  if (readStringStorage('auth_token', '')) {
    fetchProfile();
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

  // watch logic removed in favor of direct updates in login/logout methods
  // currentType is transient for the session
  // currentUserRole is derived from user data or session storage

  return {
    currentUser,
    currentUserRole,
    currentType,
    isLoggedIn,
    permissionsMatrix,
    setRole,
    setType,
    login,
    logout,
    fetchProfile,
    updateMatrix,
    canAccess
  }
})
