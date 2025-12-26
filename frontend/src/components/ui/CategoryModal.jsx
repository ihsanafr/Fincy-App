/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useState, useEffect } from 'react'
import Modal from './Modal'

function CategoryModal({ isOpen, onClose, editingCategory, onSubmit, isLoading }) {
  const defaultIcons = ['💰', '🍔', '🚗', '🛒', '🎬', '🏥', '📚', '💳', '🏠', '👕', '☕', '🍕', '🎮', '✈️', '🎁', '💵', '📈', '💼', '🎓', '🏋️']
  const colorPresets = [
    '#6366f1', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b'
  ]

  const [formData, setFormData] = useState({
    name: '',
    icon: '💰',
    color: '#6366f1',
    type: 'both',
  })

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        icon: editingCategory.icon || '💰',
        color: editingCategory.color || '#6366f1',
        type: editingCategory.type || 'both',
      })
    } else {
      setFormData({
        name: '',
        icon: '💰',
        color: '#6366f1',
        type: 'both',
      })
    }
  }, [editingCategory, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await onSubmit(formData)
    if (success) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Makanan, Transportasi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon (Emoji)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
                className="w-20 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-xl"
                placeholder="💰"
              />
              <div className="flex-1 overflow-x-auto pb-2">
                <div className="flex gap-2">
                  {defaultIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        formData.icon === icon
                          ? 'bg-purple-100 dark:bg-purple-900/20 ring-2 ring-purple-500'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
              />
              <div className="flex gap-2 flex-1">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      formData.color === color
                        ? 'ring-2 ring-gray-400 ring-offset-2'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon || '💰'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.name || 'Preview'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Category preview</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {editingCategory ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CategoryModal

