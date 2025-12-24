import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import { useModal } from '../contexts/ModalContext'
import { useToast } from '../contexts/ToastContext'
import { formatRupiah } from '../utils/currency'
import Badge from '../components/ui/Badge'
import BudgetModal from '../components/ui/BudgetModal'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../hooks/useBreadcrumbs'
import { usePullToRefresh } from '../hooks/usePullToRefresh'

function FinanceToolsBudgets() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [budgetSuggestions, setBudgetSuggestions] = useState([])
  const { showAlert, showConfirm, showValidation } = useModal()
  const { showToast } = useToast()
  const breadcrumbs = useBreadcrumbs()

  const handleRefresh = useCallback(() => {
    if (!loading) {
      fetchBudgets()
      fetchBudgetSuggestions()
      showToast({ type: 'success', message: 'Budgets refreshed!' })
    }
  }, [showToast, loading])

  const pullToRefreshRef = usePullToRefresh(handleRefresh, { disabled: loading })

  useEffect(() => {
    fetchCategories()
    fetchBudgets()
  }, [])

  useEffect(() => {
    if (budgets.length >= 0 && categories.length > 0) {
      fetchBudgetSuggestions()
    }
  }, [budgets, categories])

  const fetchBudgetSuggestions = async () => {
    try {
      // Get spending history by category
      const transactionsResponse = await api.get('/finance-tools/transactions')
      const transactions = transactionsResponse.data.data || transactionsResponse.data || []
      
      // Calculate average spending per category for last 3 months
      const now = new Date()
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      
      const expenseTransactions = transactions.filter(t => 
        t.type === 'expense' && 
        new Date(t.transaction_date) >= threeMonthsAgo
      )
      
      const categorySpending = {}
      expenseTransactions.forEach(transaction => {
        const categoryId = transaction.category_id
        const categoryName = transaction.category?.name || 'Uncategorized'
        
        if (!categorySpending[categoryId]) {
          categorySpending[categoryId] = {
            category_id: categoryId,
            category_name: categoryName,
            total: 0,
            count: 0,
            color: transaction.category?.color || '#6366f1',
            icon: transaction.category?.icon || '💰'
          }
        }
        
        categorySpending[categoryId].total += parseFloat(transaction.amount)
        categorySpending[categoryId].count += 1
      })
      
      // Get existing budgets
      const existingBudgets = budgets.map(b => b.category_id)
      
      // Generate suggestions (average spending * 1.2 for buffer)
      const suggestions = Object.values(categorySpending)
        .filter(cat => !existingBudgets.includes(cat.category_id) && cat.count >= 3) // At least 3 transactions
        .map(cat => ({
          category_id: cat.category_id,
          category_name: cat.category_name,
          suggested_amount: Math.ceil((cat.total / 3) * 1.2), // Average per month * 1.2
          average_spending: Math.ceil(cat.total / 3),
          color: cat.color,
          icon: cat.icon
        }))
        .sort((a, b) => b.suggested_amount - a.suggested_amount)
        .slice(0, 3) // Top 3 suggestions
      
      setBudgetSuggestions(suggestions)
    } catch (error) {
      console.error('Error fetching budget suggestions:', error)
    }
  }

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const response = await api.get('/finance-tools/budgets')
      setBudgets(response.data)
    } catch (error) {
      console.error('Error fetching budgets:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch budgets',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/finance-tools/categories')
      setCategories(response.data.filter(cat => cat.type === 'expense' || cat.type === 'both'))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDelete = async (id) => {
    showConfirm({
      title: 'Delete Budget',
      message: 'Are you sure you want to delete this budget? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/finance-tools/budgets/${id}`)
          fetchBudgets()
          showAlert({
            type: 'success',
            title: 'Success',
            message: 'Budget deleted successfully',
          })
        } catch (error) {
          showAlert({
            type: 'error',
            title: 'Error',
            message: error.response?.data?.message || 'Failed to delete budget',
          })
        }
      },
    })
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      // Ensure amount is a number
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
      }
      
      if (editingBudget) {
        await api.put(`/finance-tools/budgets/${editingBudget.id}`, submitData)
        showAlert({
          type: 'success',
          title: 'Success',
          message: 'Budget updated successfully',
        })
      } else {
        await api.post('/finance-tools/budgets', submitData)
        showAlert({
          type: 'success',
          title: 'Success',
          message: 'Budget created successfully',
        })
      }
      setShowModal(false)
      setEditingBudget(null)
      fetchBudgets()
      return true
    } catch (error) {
      if (error.response?.status === 422) {
        showValidation({
          title: 'Validation Error',
          error,
        })
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Failed to save budget',
        })
      }
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading budgets...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Budget Modal */}
      <BudgetModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingBudget(null)
        }}
        editingBudget={editingBudget}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <div ref={pullToRefreshRef}>
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Budget Suggestions */}
        {budgetSuggestions.length > 0 && (
          <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  💡 Budget Suggestions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on your spending history
                </p>
              </div>
              <button
                onClick={() => setBudgetSuggestions([])}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {budgetSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={() => {
                    const category = categories.find(c => c.id === suggestion.category_id)
                    if (category) {
                      setEditingBudget({
                        category_id: suggestion.category_id,
                        amount: suggestion.suggested_amount,
                      })
                      setShowModal(true)
                    }
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: suggestion.color }}
                    >
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {suggestion.category_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Avg: {formatRupiah(suggestion.average_spending)}/month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Suggested:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {formatRupiah(suggestion.suggested_amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Budgets</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your spending budgets by category
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBudget(null)
              setShowModal(true)
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Budget
          </button>
        </div>

        {/* Budgets List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No budgets yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg"
            >
              Create Your First Budget
            </button>
          </div>
        ) : (
          budgets.map((budget) => (
            <div
              key={budget.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {budget.category}
                </h3>
                <div className="flex items-center gap-2">
                  {budget.is_active && (
                    <Badge color="success" variant="light" size="sm">Active</Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBudget(budget)
                        setShowModal(true)
                      }}
                      className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Edit budget"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete budget"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {formatRupiah(budget.spent)} / {formatRupiah(budget.amount)}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {budget.percentage_used.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      budget.percentage_used > 100
                        ? 'bg-red-600 dark:bg-red-500'
                        : budget.percentage_used > 80
                        ? 'bg-yellow-600 dark:bg-yellow-500'
                        : 'bg-purple-600 dark:bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(100, budget.percentage_used)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${
                  budget.remaining >= 0
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {budget.remaining >= 0 ? 'Remaining' : 'Over'} {formatRupiah(Math.abs(budget.remaining))}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(budget.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(budget.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  )
}

export default FinanceToolsBudgets

