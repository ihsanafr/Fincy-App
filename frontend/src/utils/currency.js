/**
 * Format number to Indonesian Rupiah currency
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "Rp 20.000,00")
 */
export const formatRupiah = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return 'Rp 0,00'
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return 'Rp 0,00'
  }

  // Format with Indonesian locale
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

/**
 * Format number to Indonesian Rupiah currency with decimals
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string with decimals (e.g., "Rp 20.000,00")
 */
export const formatRupiahWithDecimals = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return 'Rp 0,00'
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return 'Rp 0,00'
  }

  // Format with Indonesian locale and 2 decimal places
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

/**
 * Format input value to Rupiah format (for input fields)
 * Formats with thousand separators (dots) as user types
 * @param {string} value - The input value (can be formatted or plain number)
 * @returns {string} Formatted string (e.g., "20.000")
 */
export const formatRupiahInput = (value) => {
  if (!value) return ''
  
  // Remove all non-numeric characters (including dots and commas)
  const numericValue = value.toString().replace(/[^\d]/g, '')
  
  if (!numericValue) return ''
  
  // Format with thousand separators (dots)
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Parse Rupiah formatted input back to number
 * Removes thousand separators (dots) to get the actual number
 * @param {string} value - The formatted input value
 * @returns {number} Parsed number
 */
export const parseRupiahInput = (value) => {
  if (!value) return 0
  
  // Remove all non-numeric characters (dots are thousand separators)
  const numericString = value.toString().replace(/[^\d]/g, '')
  
  if (!numericString) return 0
  
  const parsed = parseFloat(numericString)
  return isNaN(parsed) ? 0 : parsed
}

