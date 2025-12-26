/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'
import { useToast } from '../../contexts/ToastContext'
import { formatRupiah } from '../../utils/currency'
import Badge from '../../components/ui/Badge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs'

function FinanceToolsDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [previousMonthData, setPreviousMonthData] = useState(null)
  const [budgetAlerts, setBudgetAlerts] = useState([])
  const { showAlert } = useModal()
  const { showToast } = useToast()
  const breadcrumbs = useBreadcrumbs()

  useEffect(() => {
    fetchDashboard()
    fetchChartData()
    fetchPreviousMonthData()
    checkBudgetAlerts()
  }, [])

  const checkBudgetAlerts = async () => {
    try {
      const response = await api.get('/finance-tools/budgets')
      const budgets = response.data
      const now = new Date()
      const alerts = []

      budgets.forEach(budget => {
        const startDate = new Date(budget.start_date)
        const endDate = new Date(budget.end_date)
        
        if (now >= startDate && now <= endDate) {
          const spent = parseFloat(budget.spent || 0)
          const amount = parseFloat(budget.amount)
          const percentage = (spent / amount) * 100
          const remaining = amount - spent

          if (percentage >= 100) {
            alerts.push({
              type: 'danger',
              message: `Budget "${budget.category?.name || 'Uncategorized'}" exceeded by ${formatRupiah(Math.abs(remaining))}`,
              budget: budget
            })
          } else if (percentage >= 80) {
            alerts.push({
              type: 'warning',
              message: `Budget "${budget.category?.name || 'Uncategorized'}" is ${percentage.toFixed(0)}% used. Only ${formatRupiah(remaining)} remaining.`,
              budget: budget
            })
          }
        }
      })

      setBudgetAlerts(alerts)
      
      // Show toast for critical alerts
      alerts.forEach(alert => {
        if (alert.type === 'danger') {
          showToast({ type: 'error', message: alert.message, duration: 5000 })
        } else if (alert.type === 'warning') {
          showToast({ type: 'warning', message: alert.message, duration: 4000 })
        }
      })
    } catch (error) {
      console.error('Error checking budget alerts:', error)
    }
  }

  const fetchPreviousMonthData = async () => {
    try {
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      
      const params = new URLSearchParams()
      params.append('start_date', lastMonth.toISOString().split('T')[0])
      params.append('end_date', lastMonthEnd.toISOString().split('T')[0])
      
      const response = await api.get(`/finance-tools/reports?${params.toString()}`)
      const data = response.data
      
      const prevIncome = data.income_by_category?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0
      const prevExpense = data.expenses_by_category?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0
      
      setPreviousMonthData({
        income: prevIncome,
        expense: prevExpense,
        balance: prevIncome - prevExpense
      })
    } catch (error) {
      console.error('Error fetching previous month data:', error)
    }
  }

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { percentage: 0, isPositive: true, isNeutral: true }
    const change = ((current - previous) / previous) * 100
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0,
      isNeutral: change === 0
    }
  }

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

  const fetchChartData = async () => {
    try {
      const response = await api.get('/finance-tools/reports')
      const data = response.data.income_expense_over_time || []
      setChartData(data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
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

  // Prepare pie chart data for top expense categories
  const pieData = (dashboard.top_expense_categories || []).map((cat) => ({
    name: cat.category?.name || 'Uncategorized',
    value: parseFloat(cat.total),
    color: cat.category?.color || '#6366f1',
  }))

  const COLORS = pieData.map((item) => item.color)

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance Tools Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Overview of your financial activities and balance.
        </p>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-2">
          {budgetAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 ${
                alert.type === 'danger'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  alert.type === 'danger'
                    ? 'bg-red-100 dark:bg-red-900/40'
                    : 'bg-yellow-100 dark:bg-yellow-900/40'
                }`}>
                  {alert.type === 'danger' ? (
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    alert.type === 'danger'
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hero Balance Card */}
      <div className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-xl ${
        isPositive
          ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 dark:from-purple-800 dark:via-purple-900 dark:to-indigo-900'
          : 'bg-gradient-to-br from-red-600 via-red-700 to-pink-700 dark:from-red-800 dark:via-red-900 dark:to-pink-900'
      }`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0 flex-1 pr-2 sm:pr-4">
              <p className="text-white/80 text-xs sm:text-sm font-medium mb-2">Current Balance</p>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 break-words leading-tight">
                {formatRupiah(Math.abs(balance))}
              </h1>
              <p className={`text-white/90 text-xs sm:text-sm ${isPositive ? '' : 'font-semibold'}`}>
                {isPositive ? '💰 Surplus this month' : '⚠️ Deficit this month'}
              </p>
            </div>
            <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm flex-shrink-0 ${
              isPositive ? 'animate-pulse' : ''
            }`}>
              <svg className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white ${isPositive ? '' : 'animate-bounce'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isPositive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/20 pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatRupiah(dashboard.total_income).replace('Rp ', '')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This month</p>
              {previousMonthData && (() => {
                const trend = calculateTrend(dashboard.total_income, previousMonthData.income)
                return (
                  <div className={`mt-3 flex items-center text-xs ${
                    trend.isNeutral 
                      ? 'text-gray-500 dark:text-gray-400' 
                      : trend.isPositive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                  }`}>
                    {trend.isNeutral ? (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                    ) : trend.isPositive ? (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    {trend.isNeutral ? 'No change' : `${trend.percentage.toFixed(1)}% ${trend.isPositive ? 'increase' : 'decrease'} from last month`}
                  </div>
                )
              })()}
            </div>
            <div className="w-11 h-11 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-900/20 pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expense</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatRupiah(dashboard.total_expense).replace('Rp ', '')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This month</p>
              {previousMonthData && (() => {
                const trend = calculateTrend(dashboard.total_expense, previousMonthData.expense)
                // For expenses, lower is better, so we reverse the logic
                return (
                  <div className={`mt-3 flex items-center text-xs ${
                    trend.isNeutral 
                      ? 'text-gray-500 dark:text-gray-400' 
                      : !trend.isPositive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                  }`}>
                    {trend.isNeutral ? (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                    ) : !trend.isPositive ? (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    {trend.isNeutral ? 'No change' : `${trend.percentage.toFixed(1)}% ${!trend.isPositive ? 'decrease' : 'increase'} from last month`}
                  </div>
                )
              })()}
            </div>
            <div className="w-11 h-11 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border p-5 ${
          isPositive 
            ? 'border-purple-200 dark:border-purple-800' 
            : 'border-red-200 dark:border-red-800'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
            isPositive
              ? 'from-purple-50/50 to-transparent dark:from-purple-900/20'
              : 'from-red-50/50 to-transparent dark:from-red-900/20'
          }`} />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
              <p className={`mt-2 text-3xl font-bold ${
                isPositive 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatRupiah(Math.abs(balance)).replace('Rp ', '')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isPositive ? 'Surplus' : 'Deficit'} this month
              </p>
              {previousMonthData && (() => {
                const trend = calculateTrend(Math.abs(balance), Math.abs(previousMonthData.balance))
                return (
                  <div className={`mt-3 flex items-center text-xs ${
                    trend.isNeutral 
                      ? 'text-gray-500 dark:text-gray-400' 
                      : trend.isPositive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                  }`}>
                    {trend.isNeutral ? (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                    ) : trend.isPositive ? (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    {trend.isNeutral ? 'No change from last month' : `${trend.percentage.toFixed(1)}% ${trend.isPositive ? 'increase' : 'decrease'} from last month`}
                  </div>
                )
              })()}
            </div>
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${
              isPositive 
                ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/40' 
                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/40'
            }`}>
              <svg className={`w-5 h-5 ${
                isPositive 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Income vs Expense</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly trend</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  formatter={(value) => formatRupiah(value)}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No chart data available</p>
            </div>
          )}
        </div>

        {/* Expense by Category Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense by Category</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Top categories</p>
            </div>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  formatter={(value) => formatRupiah(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No expense data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Latest activity</p>
              </div>
              <Link
                to="/finance-tools/transactions"
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {dashboard.recent_transactions && dashboard.recent_transactions.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recent_transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/50 dark:to-transparent rounded-lg hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-600/50 transition-all duration-200 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shadow-md"
                        style={{ backgroundColor: transaction.category?.color || '#6366f1' }}
                      >
                        {transaction.category?.icon || '💰'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
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
                        className={`font-bold text-lg ${
                          transaction.type === 'income'
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatRupiah(transaction.amount)}
                      </p>
                      <Badge 
                        color={transaction.type === 'income' ? 'success' : 'error'} 
                        variant="light" 
                        className="text-xs mt-1"
                      >
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </Badge>
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
                  to="/finance-tools/transactions?action=add"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
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
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-200 group border border-purple-200 dark:border-purple-800"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">Add Transaction</span>
              </Link>
              <Link
                to="/finance-tools/budgets"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-200 group border border-blue-200 dark:border-blue-800"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">Manage Budgets</span>
              </Link>
              <Link
                to="/finance-tools/reports"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transition-all duration-200 group border border-green-200 dark:border-green-800"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">View Reports</span>
              </Link>
            </div>
          </div>

          {/* Active Budgets */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Budgets</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
              </div>
              <Link
                to="/finance-tools/budgets"
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors flex items-center gap-1"
              >
                Manage
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {dashboard.active_budgets && dashboard.active_budgets.length > 0 ? (
              <div className="space-y-4">
                {dashboard.active_budgets.slice(0, 3).map((budget) => (
                  <div key={budget.id} className="p-4 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/50 dark:to-transparent rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{budget.category}</p>
                      <span className={`text-sm font-bold ${
                        budget.percentage_used > 100
                          ? 'text-red-600 dark:text-red-400'
                          : budget.percentage_used > 80
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-purple-600 dark:text-purple-400'
                      }`}>
                        {budget.percentage_used.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          budget.percentage_used > 100
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : budget.percentage_used > 80
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : 'bg-gradient-to-r from-purple-500 to-purple-600'
                        }`}
                        style={{ width: `${Math.min(100, budget.percentage_used)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {formatRupiah(budget.spent)} / {formatRupiah(budget.amount)}
                      </span>
                      <span className={`font-semibold ${
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
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No active budgets</p>
                <Link
                  to="/finance-tools/budgets"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
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
