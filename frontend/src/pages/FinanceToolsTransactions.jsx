import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { useModal } from '../contexts/ModalContext'
import { formatRupiah, formatRupiahInput, parseRupiahInput } from '../utils/currency'
import Badge from '../components/ui/Badge'

function TransactionForm({ categories, editingTransaction, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    category_id: editingTransaction?.category_id || '',
    type: editingTransaction?.type || 'expense',
    amount: editingTransaction?.amount || '',
    description: editingTransaction?.description || '',
    transaction_date: editingTransaction?.transaction_date || new Date().toISOString().split('T')[0],
    notes: editingTransaction?.notes || '',
  })

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        category_id: editingTransaction.category_id || '',
        type: editingTransaction.type || 'expense',
        amount: editingTransaction.amount || '',
        description: editingTransaction.description || '',
        transaction_date: editingTransaction.transaction_date || new Date().toISOString().split('T')[0],
        notes: editingTransaction.notes || '',
      })
    } else {
      setFormData({
        category_id: '',
        type: 'expense',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
    }
  }, [editingTransaction])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const filteredCategories = categories.filter((cat) => {
    if (formData.type === 'income') return cat.type === 'income' || cat.type === 'both'
    if (formData.type === 'expense') return cat.type === 'expense' || cat.type === 'both'
    return true
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="income"
                checked={formData.type === 'income'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })}
                className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Income</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Expense</span>
            </label>
          </div>
        </div>

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
            {filteredCategories.map((cat) => (
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
            Date *
          </label>
          <input
            type="date"
            value={formData.transaction_date}
            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter description"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Additional notes..."
          />
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
          {editingTransaction ? 'Update Transaction' : 'Create Transaction'}
        </button>
      </div>
    </form>
  )
}

function FinanceToolsTransactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    start_date: '',
    end_date: '',
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const { showAlert, showConfirm, showValidation } = useModal()

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add') {
      setShowForm(true)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.category_id) params.append('category_id', filters.category_id)
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)

      const response = await api.get(`/finance-tools/transactions?${params.toString()}`)
      setTransactions(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch transactions',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/finance-tools/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDelete = async (id) => {
    showConfirm({
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/finance-tools/transactions/${id}`)
          fetchTransactions()
          showAlert({
            type: 'success',
            title: 'Success',
            message: 'Transaction deleted successfully',
          })
        } catch (error) {
          showAlert({
            type: 'error',
            title: 'Error',
            message: error.response?.data?.message || 'Failed to delete transaction',
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
      
      if (editingTransaction) {
        await api.put(`/finance-tools/transactions/${editingTransaction.id}`, submitData)
        showAlert({
          type: 'success',
          title: 'Success',
          message: 'Transaction updated successfully',
        })
      } else {
        await api.post('/finance-tools/transactions', submitData)
        showAlert({
          type: 'success',
          title: 'Success',
          message: 'Transaction created successfully',
        })
      }
      setShowForm(false)
      setEditingTransaction(null)
      fetchTransactions()
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
          message: error.response?.data?.message || 'Failed to save transaction',
        })
      }
    }
  }

  const filteredCategories = categories.filter((cat) => {
    if (filters.type === 'income') return cat.type === 'income' || cat.type === 'both'
    if (filters.type === 'expense') return cat.type === 'expense' || cat.type === 'both'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Transactions</h1>
          <p className="text-xl text-purple-100">Track your income and expenses</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Add Button */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <select
                value={filters.category_id}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Start Date"
              />

              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="End Date"
              />
            </div>

            <button
              onClick={() => {
                setEditingTransaction(null)
                setShowForm(!showForm)
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Cancel' : 'Add Transaction'}
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
            <TransactionForm
              categories={filteredCategories}
              editingTransaction={editingTransaction}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingTransaction(null)
              }}
            />
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No transactions found</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: transaction.category?.color || '#6366f1' }}
                          >
                            {transaction.category?.icon || '💰'}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {transaction.category?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          variant="light"
                        >
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${
                        transaction.type === 'income'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatRupiah(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingTransaction(transaction)
                              setShowForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


export default FinanceToolsTransactions

