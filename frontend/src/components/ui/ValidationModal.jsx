/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import Modal from './Modal'

function ValidationModal({ isOpen, onClose, title = 'Validation Error', errors, fields = {} }) {
  const hasFieldErrors = Object.keys(fields).length > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={true}>
      <div>
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error-100 dark:bg-error-900/20 mb-4">
          <div className="text-error-600 dark:text-error-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
          {title}
        </h3>

        {/* Error Messages */}
        <div className="mb-6">
          {hasFieldErrors ? (
            <div className="space-y-3">
              {Object.keys(fields).map((field) => (
                <div key={field} className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-3">
                  <div className="text-sm font-medium text-error-800 dark:text-error-300 mb-1 capitalize">
                    {field.replace(/_/g, ' ')}
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {Array.isArray(fields[field]) ? (
                      fields[field].map((msg, index) => (
                        <li key={index} className="text-sm text-error-700 dark:text-error-400">
                          {msg}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-error-700 dark:text-error-400">{fields[field]}</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
              <p className="text-sm text-error-700 dark:text-error-400 whitespace-pre-line">
                {errors || 'Please check your input and try again.'}
              </p>
            </div>
          )}
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg font-medium transition-colors"
        >
          OK
        </button>
      </div>
    </Modal>
  )
}

export default ValidationModal

