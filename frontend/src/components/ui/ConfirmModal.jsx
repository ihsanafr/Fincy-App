import Modal from './Modal'

function ConfirmModal({ 
  isOpen, 
  onClose, 
  title = 'Confirm Action', 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  type = 'warning',
  isLoading = false
}) {
  const typeConfig = {
    danger: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: 'bg-error-100 dark:bg-error-900/20',
      iconColor: 'text-error-600 dark:text-error-400',
      confirmButtonColor: 'bg-error-600 hover:bg-error-700',
    },
    warning: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: 'bg-warning-100 dark:bg-warning-900/20',
      iconColor: 'text-warning-600 dark:text-warning-400',
      confirmButtonColor: 'bg-warning-600 hover:bg-warning-700',
    },
    info: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-brand-100 dark:bg-brand-900/20',
      iconColor: 'text-brand-600 dark:text-brand-400',
      confirmButtonColor: 'bg-brand-600 hover:bg-brand-700',
    },
  }

  const config = typeConfig[type] || typeConfig.warning

  const handleConfirm = async () => {
    if (onConfirm) {
      try {
        const result = onConfirm()
        if (result instanceof Promise) {
          await result
        }
      } catch (error) {
        // Swallow errors to ensure modal closes
      }
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? undefined : onClose} size="sm" showCloseButton={!isLoading}>
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${config.bgColor} mb-4`}>
          <div className={config.iconColor}>
            {config.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 ${config.confirmButtonColor} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal

