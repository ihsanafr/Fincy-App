/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  actionLabel,
  illustration 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {illustration ? (
        <div className="mb-6 max-w-xs">
          {illustration}
        </div>
      ) : icon ? (
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          {typeof icon === 'string' ? (
            <span className="text-4xl">{icon}</span>
          ) : (
            icon
          )}
        </div>
      ) : (
        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && actionLabel && (
        <button
          onClick={action}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg transform hover:scale-105 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState

