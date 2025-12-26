/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import Badge from '../ui/Badge'

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

function StatCard({ title, value, icon, accent = 'brand', growth = null }) {
  const accentMap = {
    brand: {
      bg: 'from-brand-500/15 to-brand-500/0',
      text: 'text-brand-700 dark:text-brand-300',
      border: 'border-brand-200 dark:border-brand-800',
    },
    purple: {
      bg: 'from-purple-500/15 to-purple-500/0',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
    },
    amber: {
      bg: 'from-amber-500/15 to-amber-500/0',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
    },
    emerald: {
      bg: 'from-emerald-500/15 to-emerald-500/0',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
  }

  const a = accentMap[accent] || accentMap.brand

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${a.bg} pointer-events-none`} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{Number(value || 0).toLocaleString()}</p>
        </div>

        <div className={`w-11 h-11 rounded-xl border ${a.border} bg-white/70 dark:bg-gray-900/40 flex items-center justify-center`}>
          <span className={a.text}>{icon}</span>
        </div>
      </div>

      {growth !== null && (
        <div className="relative mt-4">
          <Badge color={growth >= 0 ? 'success' : 'error'}>
            {growth >= 0 ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            {Math.abs(growth).toFixed(2)}%
          </Badge>
        </div>
      )}
    </div>
  )
}

const DashboardMetrics = ({ statistics }) => {
  const metrics = [
    {
      title: 'Total Users',
      value: statistics?.users?.total || 0,
      growth: statistics?.users?.growth || 0,
      accent: 'brand',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M16 3.13a4 4 0 010 7.75M20 21v-2a4 4 0 00-3-3.87M9 7a4 4 0 110 8 4 4 0 010-8z" />
        </svg>
      ),
    },
    {
      title: 'Learning Modules',
      value: statistics?.modules?.total || 0,
      growth: statistics?.modules?.growth || 0,
      accent: 'purple',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Total Payments',
      value: statistics?.payments?.total || 0,
      growth: null,
      accent: 'amber',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Certificates Issued',
      value: statistics?.certificates || 0,
      growth: null,
      accent: 'emerald',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.89a1 1 0 00-.364 1.118l1.52 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.89a1 1 0 00-1.175 0l-3.976 2.89c-.783.57-1.838-.197-1.538-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.56 9.101c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {metrics.map((metric, index) => (
        <StatCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          accent={metric.accent}
          growth={metric.growth}
        />
      ))}
    </div>
  )
}

export default DashboardMetrics

