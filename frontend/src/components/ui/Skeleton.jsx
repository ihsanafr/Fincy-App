function Skeleton({ className = '', variant = 'default' }) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded'
  
  const variants = {
    default: baseClasses,
    text: `${baseClasses} h-4`,
    title: `${baseClasses} h-8`,
    avatar: `${baseClasses} rounded-full`,
    card: `${baseClasses} h-full`,
    button: `${baseClasses} h-10`,
  }
  
  return <div className={`${variants[variant]} ${className}`}></div>
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="avatar" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton variant="title" className="w-3/4 mb-2" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full mb-2" />
      <Skeleton variant="text" className="w-5/6" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} variant="text" className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonModuleCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-auto self-start">
      <Skeleton variant="card" className="h-48 w-full" />
      <div className="p-6">
        <Skeleton variant="title" className="w-3/4 mb-3" />
        <Skeleton variant="text" className="w-full mb-2" />
        <Skeleton variant="text" className="w-5/6 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton variant="button" className="w-20" />
          <Skeleton variant="button" className="w-20" />
        </div>
        <Skeleton variant="text" className="w-1/3" />
      </div>
    </div>
  )
}

export function SkeletonDashboardCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="avatar" className="w-12 h-12" />
        <Skeleton variant="text" className="w-16 h-6" />
      </div>
      <Skeleton variant="title" className="w-2/3 mb-2" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  )
}

export default Skeleton

