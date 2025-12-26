/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useEffect, useState, useCallback } from 'react'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'
import { useToast } from '../../contexts/ToastContext'
import { formatRupiah } from '../../utils/currency'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'
import { exportToCSV, exportToPDF } from '../../utils/export'

function FinanceToolsReports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const { showAlert } = useModal()
  const { showToast } = useToast()
  const breadcrumbs = useBreadcrumbs()

  const handleRefresh = useCallback(() => {
    if (!loading) {
      fetchReports()
      showToast({ type: 'success', message: 'Reports refreshed!' })
    }
  }, [showToast, loading])

  const pullToRefreshRef = usePullToRefresh(handleRefresh, { disabled: loading })

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange.start_date) params.append('start_date', dateRange.start_date)
      if (dateRange.end_date) params.append('end_date', dateRange.end_date)

      const response = await api.get(`/finance-tools/reports?${params.toString()}`)
      setReports(response.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch reports',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (!reports) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  const totalExpenses = reports.expenses_by_category?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0
  const totalIncome = reports.income_by_category?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0

  return (
    <div ref={pullToRefreshRef}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Financial Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analyze your income and expenses
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="text-gray-500 dark:text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csvData = [
                  ...(reports.expenses_by_category || []).map(item => ({
                    Category: item.category?.name || 'Uncategorized',
                    Type: 'Expense',
                    Amount: item.total,
                    Percentage: totalExpenses > 0 ? `${((parseFloat(item.total) / totalExpenses) * 100).toFixed(1)}%` : '0%'
                  })),
                  ...(reports.income_by_category || []).map(item => ({
                    Category: item.category?.name || 'Uncategorized',
                    Type: 'Income',
                    Amount: item.total,
                    Percentage: totalIncome > 0 ? `${((parseFloat(item.total) / totalIncome) * 100).toFixed(1)}%` : '0%'
                  }))
                ]
                exportToCSV(csvData, 'financial_report')
                showToast({ type: 'success', message: 'Report exported to CSV successfully!' })
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => {
                const tableContent = `
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(reports.expenses_by_category || []).map(item => `
                        <tr>
                          <td>${item.category?.name || 'Uncategorized'}</td>
                          <td>Expense</td>
                          <td>${formatRupiah(item.total)}</td>
                          <td>${totalExpenses > 0 ? ((parseFloat(item.total) / totalExpenses) * 100).toFixed(1) : 0}%</td>
                        </tr>
                      `).join('')}
                      ${(reports.income_by_category || []).map(item => `
                        <tr>
                          <td>${item.category?.name || 'Uncategorized'}</td>
                          <td>Income</td>
                          <td>${formatRupiah(item.total)}</td>
                          <td>${totalIncome > 0 ? ((parseFloat(item.total) / totalIncome) * 100).toFixed(1) : 0}%</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `
                exportToPDF('Financial Report', tableContent, 'financial_report')
                showToast({ type: 'success', message: 'Report opened for printing!' })
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatRupiah(totalIncome)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatRupiah(totalExpenses)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              totalIncome - totalExpenses >= 0
                ? 'bg-purple-100 dark:bg-purple-900/20'
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              <svg className={`w-6 h-6 ${
                totalIncome - totalExpenses >= 0
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-red-600 dark:text-red-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className={`text-2xl font-bold mb-1 ${
            totalIncome - totalExpenses >= 0
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatRupiah(Math.abs(totalIncome - totalExpenses))}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalIncome - totalExpenses >= 0 ? 'Net Income' : 'Net Loss'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Expenses by Category</h2>
          {reports.expenses_by_category && reports.expenses_by_category.length > 0 ? (
            <div className="space-y-4">
              {reports.expenses_by_category.map((item) => {
                const percentage = (parseFloat(item.total) / totalExpenses) * 100
                return (
                  <div key={item.category_id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                          style={{ backgroundColor: item.category?.color || '#6366f1' }}
                        >
                          {item.category?.icon || '💰'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.category?.name || 'Uncategorized'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatRupiah(item.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-red-600 dark:bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No expense data</p>
          )}
        </div>

        {/* Income by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Income by Category</h2>
          {reports.income_by_category && reports.income_by_category.length > 0 ? (
            <div className="space-y-4">
              {reports.income_by_category.map((item) => {
                const percentage = totalIncome > 0 ? (parseFloat(item.total) / totalIncome) * 100 : 0
                return (
                  <div key={item.category_id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                          style={{ backgroundColor: item.category?.color || '#6366f1' }}
                        >
                          {item.category?.icon || '💰'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.category?.name || 'Uncategorized'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatRupiah(item.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No income data</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FinanceToolsReports

