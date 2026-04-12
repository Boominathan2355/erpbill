/* src/utils/formatters.ts */

/**
 * Format a number dynamically based on currency
 */
export const formatCurrency = (amount: number, currencyCode: string = 'INR'): string => {
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format date to string (DD-MM-YYYY)
 */
export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(timestamp))
}

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9)
}
