const QuickStats = ({ statistics }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Quick Stats
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Overview of your platform
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5 mt-6">
          <div>
            <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Pending Payments
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {statistics?.payments?.pending || 0}
            </p>
          </div>

          <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

          <div>
            <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Approved Payments
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {statistics?.payments?.approved || 0}
            </p>
          </div>

          <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

          <div>
            <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Completions
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {statistics?.progress || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickStats

