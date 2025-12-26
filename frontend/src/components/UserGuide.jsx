/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'

function UserGuide({ type = 'admin' }) {
  const [isOpen, setIsOpen] = useState(false)
  const guidePath = type === 'finance' ? '/finance-tools/guide' : '/admin/guide'

  const adminGuide = [
    {
      title: 'Dashboard Overview',
      content: 'View statistics, recent users, and payment requests. Monitor system activity with interactive charts.',
    },
    {
      title: 'Learning Modules',
      content: 'Create and manage learning modules. Add materials (videos/articles) and create quizzes. Use search bar to find modules quickly.',
    },
    {
      title: 'Payment Requests',
      content: 'Review and approve/reject subscription payments. Click column headers to sort. Search by user name or status.',
    },
    {
      title: 'User Management',
      content: 'View all registered users. Change user roles or delete users. Sort by name, email, or join date.',
    },
    {
      title: 'Tips',
      content: '• Use search bar to filter data quickly\n• Click column headers to sort tables\n• Hover over charts for detailed information\n• Notifications show pending payments and new users',
    },
  ]

  const financeGuide = [
    {
      title: 'Dashboard',
      content: 'View your financial overview with income, expenses, and balance. Track your spending patterns with interactive charts.',
    },
    {
      title: 'Transactions',
      content: 'Record all your income and expenses. Categorize transactions and add notes for better tracking.',
    },
    {
      title: 'Budgets',
      content: 'Set monthly budgets for different categories. Monitor your spending against budget limits.',
    },
    {
      title: 'Reports',
      content: 'Generate detailed financial reports. Analyze your spending patterns and income trends over time.',
    },
    {
      title: 'Categories',
      content: 'Manage transaction categories. Create custom categories to organize your finances better.',
    },
    {
      title: 'Tips',
      content: '• Record transactions regularly for accurate tracking\n• Set realistic budgets to avoid overspending\n• Review reports monthly to identify trends\n• Use categories to organize expenses',
    },
  ]

  const guideItems = type === 'finance' ? financeGuide : adminGuide
  const iconColor =
    type === 'finance'
      ? 'text-purple-600 dark:text-purple-400'
      : type === 'educator'
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-brand-600 dark:text-brand-400'
  const bgColor =
    type === 'finance'
      ? 'bg-purple-50 dark:bg-purple-900/20'
      : type === 'educator'
        ? 'bg-emerald-50 dark:bg-emerald-900/20'
        : 'bg-brand-50 dark:bg-brand-900/20'
  const borderColor =
    type === 'finance'
      ? 'border-purple-200 dark:border-purple-800'
      : type === 'educator'
        ? 'border-emerald-200 dark:border-emerald-800'
        : 'border-brand-200 dark:border-brand-800'

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 mt-auto">
      <Link
        to={guidePath}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800`}
      >
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="flex-1 text-left text-gray-700 dark:text-gray-300">User Guide</span>
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

export default UserGuide

