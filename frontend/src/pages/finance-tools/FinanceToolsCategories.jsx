/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useEffect, useState, useCallback } from 'react'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'
import { useToast } from '../../contexts/ToastContext'
import Badge from '../../components/ui/Badge'
import CategoryModal from '../../components/ui/CategoryModal'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'

function FinanceToolsCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showAlert, showConfirm, showValidation } = useModal()
  const { showToast } = useToast()
  const breadcrumbs = useBreadcrumbs()

  const handleRefresh = useCallback(() => {
    if (!loading) {
      fetchCategories()
      showToast({ type: 'success', message: 'Categories refreshed!' })
    }
  }, [showToast, loading])

  const pullToRefreshRef = usePullToRefresh(handleRefresh, { disabled: loading })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await api.get('/finance-tools/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      if (error.response?.status === 403) {
        showAlert({
          type: 'error',
          title: 'Access Denied',
          message: 'You need an active subscription to access Finance Tools.',
        })
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch categories',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setShowModal(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    showConfirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? Categories with existing transactions cannot be deleted.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/finance-tools/categories/${id}`)
          fetchCategories()
          showAlert({
            type: 'success',
            title: 'Success',
            message: 'Category deleted successfully',
          })
        } catch (error) {
          showAlert({
            type: 'error',
            title: 'Error',
            message: error.response?.data?.message || 'Failed to delete category',
          })
        }
      },
    })
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (editingCategory) {
        await api.put(`/finance-tools/categories/${editingCategory.id}`, formData)
        showAlert({
          type: 'success',
          title: 'Success',
          message: 'Category updated successfully',
        })
      } else {
        await api.post('/finance-tools/categories', formData)
        showAlert({
          type: 'success',
          title: 'Success',
          message: 'Category created successfully',
        })
      }
      fetchCategories()
      setShowModal(false)
      setEditingCategory(null)
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
          message: error.response?.data?.message || 'Failed to save category',
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
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    )
  }

  const userCategories = categories.filter(cat => !cat.is_default)
  const defaultCategories = categories.filter(cat => cat.is_default)

  return (
    <div ref={pullToRefreshRef}>
      {/* Category Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingCategory(null)
        }}
        editingCategory={editingCategory}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Categories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your transaction categories
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* User Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Categories</h2>
        {userCategories.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No custom categories yet</p>
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Create Your First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: category.color || '#6366f1' }}
                    >
                      {category.icon || '💰'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <Badge
                        color={category.type === 'income' ? 'success' : category.type === 'expense' ? 'error' : 'info'}
                        variant="light"
                        size="sm"
                      >
                        {category.type === 'income' ? 'Income' : category.type === 'expense' ? 'Expense' : 'Both'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1"
                      title="Edit category"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                      title="Delete category"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Default Categories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultCategories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: category.color || '#6366f1' }}
                >
                  {category.icon || '💰'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <Badge
                    color={category.type === 'income' ? 'success' : category.type === 'expense' ? 'error' : 'info'}
                    variant="light"
                    size="sm"
                  >
                    {category.type === 'income' ? 'Income' : category.type === 'expense' ? 'Expense' : 'Both'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FinanceToolsCategories
