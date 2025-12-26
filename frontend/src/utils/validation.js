/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
/**
 * Format validation errors from Laravel API response
 * @param {Object} error - Axios error object
 * @returns {Object} Formatted error object with message and fields
 */
export const formatValidationErrors = (error) => {
  const response = error?.response
  if (!response) {
    return {
      message: error?.message || 'An error occurred',
      fields: {},
    }
  }

  // Laravel validation errors format
  if (response.status === 422 && response.data?.errors) {
    const errors = response.data.errors
    const fields = {}
    let allMessages = []

    // Format field errors
    Object.keys(errors).forEach((field) => {
      const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
      fields[field] = fieldErrors
      allMessages.push(...fieldErrors)
    })

    return {
      message: response.data?.message || 'Validation failed',
      fields,
      allMessages,
    }
  }

  // General error message
  return {
    message: response.data?.message || response.data?.error || 'An error occurred',
    fields: {},
    allMessages: [],
  }
}

/**
 * Format validation errors into a readable message for modal
 * @param {Object} error - Axios error object
 * @returns {string} Formatted error message
 */
export const formatValidationMessage = (error) => {
  const validation = formatValidationErrors(error)
  
  if (validation.allMessages.length > 0) {
    // Show all validation messages
    return validation.allMessages.join('\n')
  }
  
  return validation.message
}

