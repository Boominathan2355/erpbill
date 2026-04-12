/* src/utils/taxUtils.ts */

import type { ClientType } from '../types'

export interface TaxBreakdown {
  cgst: number
  sgst: number
  igst: number
  totalTax: number
}

/**
 * Calculate GST breakdown based on amount, rate, client type, and inter-state status
 * @param amount The base amount
 * @param rate Total GST rate (e.g. 18 for 18%)
 * @param clientType 'b2b', 'b2c', or 'b2e'
 * @param isInterState Whether it's an inter-state sale (IGST) or intra-state (CGST/SGST)
 */
export const calculateGST = (
  amount: number, 
  rate: number, 
  clientType: ClientType = 'b2b',
  isInterState: boolean = false
): TaxBreakdown => {
  // Export (B2E) is zero-rated under LUT unless configured otherwise
  if (clientType === 'b2e') {
    return {
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalTax: 0
    }
  }

  const totalTax = (amount * rate) / 100
  
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      totalTax
    }
  }

  // Intra-state split (50/50)
  const halfTax = totalTax / 2
  return {
    cgst: halfTax,
    sgst: halfTax,
    igst: 0,
    totalTax
  }
}

/**
 * Simple calculation for non-GST taxes
 */
export const calculateTax = (amount: number, rate: number): number => {
  return (amount * rate) / 100
}
