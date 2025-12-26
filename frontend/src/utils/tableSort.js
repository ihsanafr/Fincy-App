/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
/**
 * Utility functions for table sorting and filtering
 */

/**
 * Sort array of objects by a specific field
 * @param {Array} array - Array to sort
 * @param {string} field - Field name to sort by (supports nested fields with dot notation)
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortArray = (array, field, direction = 'asc') => {
  if (!array || array.length === 0) return array

  const sorted = [...array].sort((a, b) => {
    let aValue = getNestedValue(a, field)
    let bValue = getNestedValue(b, field)

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1

    // Convert to comparable types
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
    }
    if (typeof bValue === 'string') {
      bValue = bValue.toLowerCase()
    }

    // Compare values
    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1
    }
    return 0
  })

  return sorted
}

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot notation path (e.g., 'user.name')
 * @returns {*} Value at path
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, prop) => {
    return current && current[prop] !== undefined ? current[prop] : null
  }, obj)
}

/**
 * Toggle sort direction
 * @param {string} currentDirection - Current sort direction
 * @param {string} currentField - Current sort field
 * @param {string} newField - New sort field
 * @returns {string} New sort direction ('asc' or 'desc')
 */
export const getSortDirection = (currentDirection, currentField, newField) => {
  if (currentField === newField) {
    // Toggle between asc -> desc -> asc
    return currentDirection === 'asc' ? 'desc' : 'asc'
  }
  // New field, start with ascending
  return 'asc'
}

