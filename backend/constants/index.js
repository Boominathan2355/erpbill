/* backend/constants/index.js */

export const CLIENT_TYPES = ['b2b', 'b2c', 'b2e'];

export const INVOICE_STATUSES = ['draft', 'paid', 'overdue', 'cancelled'];

export const DISCOUNT_TYPES = ['percentage', 'fixed'];

export const TRANSACTION_TYPES = ['income', 'expense'];

export const PAYMENT_METHODS = ['Cash', 'Bank', 'UPI', 'Card'];

export const TRANSACTION_STATUSES = ['completed', 'pending'];

export const PERMISSION_LEVELS = ['Full', 'Read', 'None'];

export const INCOME_CATEGORIES = [
  'Sales',
  'Services',
  'Interests',
  'Refunds',
  'Other Income'
];

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salary',
  'Office Supplies',
  'Travel',
  'Marketing',
  'Software/Subscriptions',
  'Taxes',
  'Other Expenses'
];

export const MODULES = [
  'Dashboard',
  'Invoices',
  'Clients',
  'Products',
  'Settings',
  'Audit Logs',
  'Role Management',
  'Finance'
];

export const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    desc: 'Can manage billing platform and create new client tenants.',
    permissions: MODULES.map(m => ({ module: m, level: 'Full' }))
  },
  {
    name: 'Client Admin',
    desc: 'Full access to a specific clients billing modules.',
    permissions: MODULES.map(m => ({ 
      module: m, 
      level: m === 'Audit Logs' || m === 'Role Management' ? 'None' : 'Full' 
    }))
  },
  {
    name: 'Finance Agent',
    desc: 'Read/Write access to invoices, no access to settings.',
    permissions: MODULES.map(m => ({ 
      module: m, 
      level: m === 'Invoices' || m === 'Finance' ? 'Full' : (['Settings', 'Audit Logs', 'Role Management'].includes(m) ? 'None' : 'Read')
    }))
  }
];
