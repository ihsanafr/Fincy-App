import Modal from './Modal'

function AlertModal({ isOpen, onClose, type = 'info', title, message, onConfirm }) {
  const typeConfig = {
    success: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-success-100 dark:bg-success-900/20',
      iconColor: 'text-success-600 dark:text-success-400',
      buttonColor: 'bg-success-600 hover:bg-success-700',
    },
    error: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-error-100 dark:bg-error-900/20',
      iconColor: 'text-error-600 dark:text-error-400',
      buttonColor: 'bg-error-600 hover:bg-error-700',
    },
    warning: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: 'bg-warning-100 dark:bg-warning-900/20',
      iconColor: 'text-warning-600 dark:text-warning-400',
      buttonColor: 'bg-warning-600 hover:bg-warning-700',
    },
    info: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-brand-100 dark:bg-brand-900/20',
      iconColor: 'text-brand-600 dark:text-brand-400',
      buttonColor: 'bg-brand-600 hover:bg-brand-700',
    },
  }

  const config = typeConfig[type] || typeConfig.info

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${config.bgColor} mb-4`}>
          <div className={config.iconColor}>
            {config.icon}
          </div>
        </div>

        {/* Title */}
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
        )}

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>

        {/* Button */}
        <button
          onClick={handleConfirm}
          className={`w-full px-4 py-2 ${config.buttonColor} text-white rounded-lg font-medium transition-colors`}
        >
          OK
        </button>
      </div>
    </Modal>
  )
}

export default AlertModal

