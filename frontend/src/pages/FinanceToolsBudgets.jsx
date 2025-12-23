import { useEffect, useState } from 'react'
import api from '../services/api'
import { useModal } from '../contexts/ModalContext'
import { formatRupiah, formatRupiahInput, parseRupiahInput } from '../utils/currency'
import Badge from '../components/ui/Badge'

function FinanceToolsBudgets() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const { showAlert, showConfirm, showValidation } = useModal()

  useEffect(() => {
    fetchCategories()
    fetchBudgets()
  }, [])

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
      setShowForm(false)
      setEditingBudget(null)
      fetchBudgets()
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
            setShowForm(!showForm)
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? 'Cancel' : 'Add Budget'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <BudgetForm
            categories={categories}
            editingBudget={editingBudget}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingBudget(null)
            }}
          />
        </div>
      )}

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
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
                        setShowForm(true)
                      }}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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
  )
}

function BudgetForm({ categories, editingBudget, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    category_id: editingBudget?.category_id || '',
    amount: editingBudget?.amount || '',
    start_date: editingBudget?.start_date || new Date().toISOString().split('T')[0],
    end_date: editingBudget?.end_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    period: editingBudget?.period || 'monthly',
  })

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        category_id: editingBudget.category_id || '',
        amount: editingBudget.amount || '',
        start_date: editingBudget.start_date || new Date().toISOString().split('T')[0],
        end_date: editingBudget.end_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        period: editingBudget.period || 'monthly',
      })
    }
  }, [editingBudget])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {editingBudget ? 'Edit Budget' : 'Add New Budget'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount (Rp) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
              Rp
            </span>
            <input
              type="text"
              value={formData.amount ? formatRupiahInput(formData.amount.toString()) : ''}
              onChange={(e) => {
                const parsed = parseRupiahInput(e.target.value)
                setFormData({ ...formData, amount: parsed > 0 ? parsed.toString() : '' })
              }}
              onBlur={(e) => {
                const parsed = parseRupiahInput(e.target.value)
                if (parsed > 0) {
                  setFormData({ ...formData, amount: parsed.toString() })
                }
              }}
              required
              className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date *
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Period
          </label>
          <select
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          {editingBudget ? 'Update Budget' : 'Create Budget'}
        </button>
      </div>
    </form>
  )
}

export default FinanceToolsBudgets

