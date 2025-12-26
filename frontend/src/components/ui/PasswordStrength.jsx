/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
function PasswordStrength({ password }) {
  const calculateStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    let feedback = []

    // Length check
    if (pwd.length >= 8) strength++
    else feedback.push('At least 8 characters')
    
    if (pwd.length >= 12) strength++

    // Character variety checks
    if (/[a-z]/.test(pwd)) strength++
    else feedback.push('lowercase letter')
    
    if (/[A-Z]/.test(pwd)) strength++
    else feedback.push('uppercase letter')
    
    if (/[0-9]/.test(pwd)) strength++
    else feedback.push('number')
    
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    else feedback.push('special character')

    // Determine label and color
    let label = ''
    let color = ''
    
    if (strength <= 2) {
      label = 'Weak'
      color = 'red'
    } else if (strength <= 4) {
      label = 'Fair'
      color = 'yellow'
    } else if (strength <= 5) {
      label = 'Good'
      color = 'blue'
    } else {
      label = 'Strong'
      color = 'green'
    }

    return { strength: Math.min(strength, 6), label, color, feedback }
  }

  const { strength, label, color, feedback } = calculateStrength(password)
  const percentage = (strength / 6) * 100

  if (!password) return null

  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  }

  const textColorClasses = {
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold ${textColorClasses[color]}`}>
          Password Strength: {label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {strength}/6
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {feedback.length > 0 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Add: {feedback.slice(0, 2).join(', ')}
        </p>
      )}
    </div>
  )
}

export default PasswordStrength

