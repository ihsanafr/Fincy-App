import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useModal } from '../contexts/ModalContext'
import { formatRupiah } from '../utils/currency'
import Badge from '../components/ui/Badge'

function FinanceToolsDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showAlert } = useModal()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/finance-tools/dashboard')
      setDashboard(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      if (error.response?.status === 403) {
        showAlert({
          type: 'error',
          title: 'Access Denied',
          message: 'You need an active subscription to access Finance Tools.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  const balance = dashboard.balance
  const isPositive = balance >= 0

  return (
    <div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <Badge color="success" variant="light">Income</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatRupiah(dashboard.total_income)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          </div>

          {/* Total Expense */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <Badge color="error" variant="light">Expense</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatRupiah(dashboard.total_expense)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          </div>

          {/* Balance */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border ${
            isPositive 
              ? 'border-purple-200 dark:border-purple-800' 
              : 'border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isPositive 
                  ? 'bg-purple-100 dark:bg-purple-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                <svg className={`w-6 h-6 ${
                  isPositive 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <Badge color={isPositive ? 'success' : 'error'} variant="light">Balance</Badge>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${
              isPositive 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatRupiah(Math.abs(balance))}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isPositive ? 'Surplus' : 'Deficit'} this month
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                <Link
                  to="/finance-tools/transactions"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
              {dashboard.recent_transactions && dashboard.recent_transactions.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.recent_transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                          style={{ backgroundColor: transaction.category?.color || '#6366f1' }}
                        >
                          {transaction.category?.icon || '💰'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.category?.name || 'Uncategorized'} •{' '}
                            {new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === 'income'
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatRupiah(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No transactions yet</p>
                  <Link
                    to="/finance-tools/transactions"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Add Transaction
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Budgets */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/finance-tools/transactions?action=add"
                  className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Add Transaction</span>
                </Link>
                <Link
                  to="/finance-tools/budgets"
                  className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Manage Budgets</span>
                </Link>
                <Link
                  to="/finance-tools/reports"
                  className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">View Reports</span>
                </Link>
              </div>
            </div>

            {/* Active Budgets */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Budgets</h2>
                <Link
                  to="/finance-tools/budgets"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                >
                  Manage →
                </Link>
              </div>
              {dashboard.active_budgets && dashboard.active_budgets.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.active_budgets.slice(0, 3).map((budget) => (
                    <div key={budget.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">{budget.category}</p>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {budget.percentage_used.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            budget.percentage_used > 100
                              ? 'bg-red-600 dark:bg-red-500'
                              : budget.percentage_used > 80
                              ? 'bg-yellow-600 dark:bg-yellow-500'
                              : 'bg-purple-600 dark:bg-purple-500'
                          }`}
                          style={{ width: `${Math.min(100, budget.percentage_used)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          {formatRupiah(budget.spent)} / {formatRupiah(budget.amount)}
                        </span>
                        <span className={`font-medium ${
                          budget.remaining >= 0
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {budget.remaining >= 0 ? 'Remaining' : 'Over'} {formatRupiah(Math.abs(budget.remaining))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No active budgets</p>
                  <Link
                    to="/finance-tools/budgets"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                  >
                    Create Budget
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  )
}

export default FinanceToolsDashboard

