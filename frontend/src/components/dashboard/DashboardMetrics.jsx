import Badge from '../ui/Badge'

// Simple SVG icon components as fallback
const GroupIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
)

const BoxIconLine = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
  </svg>
)

const DollarLineIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.09 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
  </svg>
)

const ShootingStarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const ArrowUpIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
  </svg>
)

const ArrowDownIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
  </svg>
)

const DashboardMetrics = ({ statistics }) => {
  const metrics = [
    {
      title: 'Total Users',
      value: statistics?.users?.total || 0,
      growth: statistics?.users?.growth || 0,
      icon: <GroupIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
    },
    {
      title: 'Learning Modules',
      value: statistics?.modules?.total || 0,
      growth: statistics?.modules?.growth || 0,
      icon: <BoxIconLine className="text-gray-800 w-6 h-6 dark:text-white/90" />,
    },
    {
      title: 'Total Payments',
      value: statistics?.payments?.total || 0,
      growth: null,
      icon: <DollarLineIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
    },
    {
      title: 'Certificates Issued',
      value: statistics?.certificates || 0,
      growth: null,
      icon: <ShootingStarIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {metric.icon}
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.title}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {metric.value.toLocaleString()}
              </h4>
            </div>
            {metric.growth !== null && (
              <Badge color={metric.growth >= 0 ? 'success' : 'error'}>
                {metric.growth >= 0 ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                {Math.abs(metric.growth).toFixed(2)}%
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardMetrics

