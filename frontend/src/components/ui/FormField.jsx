import { useState, useEffect } from 'react'

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  minLength,
  maxLength,
  pattern,
  validationMessage,
  className = '',
  ...props
}) {
  const [touched, setTouched] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (touched && value !== undefined) {
      validateField(value)
    }
  }, [value, touched])

  const validateField = (val) => {
    let errorMsg = ''

    if (required && (!val || val.trim() === '')) {
      errorMsg = `${label || name} is required`
    } else if (minLength && val && val.length < minLength) {
      errorMsg = `${label || name} must be at least ${minLength} characters`
    } else if (maxLength && val && val.length > maxLength) {
      errorMsg = `${label || name} must be no more than ${maxLength} characters`
    } else if (pattern && val && !new RegExp(pattern).test(val)) {
      errorMsg = validationMessage || `${label || name} format is invalid`
    } else if (type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      errorMsg = 'Please enter a valid email address'
    }

    setLocalError(errorMsg)
    return errorMsg === ''
  }

  const handleBlur = (e) => {
    setTouched(true)
    validateField(e.target.value)
    if (onBlur) onBlur(e)
  }

  const displayError = (touched && localError) || error

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 ${
          displayError
            ? 'border-red-500 dark:border-red-500'
            : 'border-gray-200 dark:border-gray-600'
        } ${props.className || ''}`}
        {...props}
      />
      {displayError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {displayError}
        </p>
      )}
    </div>
  )
}

export default FormField

