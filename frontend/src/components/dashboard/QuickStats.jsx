const QuickStats = ({ statistics }) => {
  const stats = [
    {
      label: 'Pending Payments',
      value: statistics?.payments?.pending || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-brand-50 dark:bg-brand-500/10',
      iconColor: 'text-brand-600 dark:text-brand-400',
      textColor: 'text-brand-700 dark:text-brand-300',
    },
    {
      label: 'Approved Payments',
      value: statistics?.payments?.approved || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300',
    },
    {
      label: 'Completions',
      value: statistics?.progress || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-700 dark:text-purple-300',
    },
  ]

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col">
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Quick Stats
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your platform
          </p>
        </div>

        <div className="space-y-4 flex-1">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-xl ${stat.bgColor} transition-all hover:scale-[1.02] cursor-default`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} ${stat.iconColor}`}>
                {stat.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickStats

