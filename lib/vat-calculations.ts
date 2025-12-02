/**
 * VAT calculation utilities for HMRC compliance
 * UK Standard VAT Rate: 20%
 */

const UK_STANDARD_VAT_RATE = 20.0;

/**
 * Calculate VAT amount from subtotal
 * @param subtotal - Amount before VAT
 * @param vatRate - VAT rate percentage (default 20%)
 * @returns VAT amount
 */
export function calculateVAT(subtotal: number, vatRate: number = UK_STANDARD_VAT_RATE): number {
  // Round to 2 decimal places for currency
  return Math.round((subtotal * vatRate / 100) * 100) / 100;
}

/**
 * Calculate subtotal from total (including VAT)
 * @param total - Total amount including VAT
 * @param vatRate - VAT rate percentage (default 20%)
 * @returns Subtotal before VAT
 */
export function calculateSubtotal(total: number, vatRate: number = UK_STANDARD_VAT_RATE): number {
  // Formula: subtotal = total / (1 + vatRate/100)
  return Math.round((total / (1 + vatRate / 100)) * 100) / 100;
}

/**
 * Calculate total including VAT
 * @param subtotal - Amount before VAT
 * @param vatRate - VAT rate percentage (default 20%)
 * @returns Total including VAT
 */
export function calculateTotalWithVAT(subtotal: number, vatRate: number = UK_STANDARD_VAT_RATE): number {
  const vatAmount = calculateVAT(subtotal, vatRate);
  return Math.round((subtotal + vatAmount) * 100) / 100;
}

/**
 * Format VAT rate for display
 * @param rate - VAT rate percentage
 * @returns Formatted string (e.g., "20%")
 */
export function formatVATRate(rate: number): string {
  return `${rate}%`;
}

/**
 * Get UK standard VAT rate
 */
export function getStandardVATRate(): number {
  return UK_STANDARD_VAT_RATE;
}

