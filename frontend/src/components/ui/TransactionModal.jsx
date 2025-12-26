/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useState, useEffect } from 'react'
import { formatRupiahInput, parseRupiahInput } from '../../utils/currency'

function TransactionModal({ isOpen, onClose, editingTransaction, categories, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    category_id: '',
    type: 'expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    if (editingTransaction && isOpen) {
      // Parse amount: pastikan selalu number murni (bukan string yang sudah diformat)
      let amountValue = ''
      if (editingTransaction.amount !== null && editingTransaction.amount !== undefined) {
        // Konversi ke number dulu, kemudian ke string number murni
        // Ini untuk memastikan tidak ada formatting yang tersisa
        const rawAmount = Number(editingTransaction.amount)
        if (!isNaN(rawAmount) && rawAmount > 0) {
          // Simpan sebagai string number murni (tanpa formatting)
          amountValue = String(Math.floor(Math.abs(rawAmount)))
        }
      }
      
      // Format tanggal untuk input date (yyyy-mm-dd)
      let formattedDate = new Date().toISOString().split('T')[0]
      if (editingTransaction.transaction_date) {
        try {
          // Konversi berbagai format tanggal ke yyyy-mm-dd
          const date = new Date(editingTransaction.transaction_date)
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0]
          }
        } catch (e) {
          // Jika gagal parse, gunakan tanggal hari ini
          formattedDate = new Date().toISOString().split('T')[0]
        }
      }
      
      setFormData({
        category_id: editingTransaction.category_id || '',
        type: editingTransaction.type || 'expense',
        amount: amountValue,
        description: editingTransaction.description || '',
        transaction_date: formattedDate,
        notes: editingTransaction.notes || '',
      })
    } else if (!editingTransaction && isOpen) {
      // Reset form saat modal dibuka tanpa editingTransaction
      setFormData({
        category_id: '',
        type: 'expense',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
    }
  }, [editingTransaction?.id, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const filteredCategories = categories.filter((cat) => {
    if (formData.type === 'income') return cat.type === 'income' || cat.type === 'both'
    if (formData.type === 'expense') return cat.type === 'expense' || cat.type === 'both'
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop with smooth animation */}
        <div
          className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300 ease-out animate-[fadeIn_0.3s_ease-out]"
          onClick={onClose}
        ></div>

        {/* Modal Panel with smooth animation */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-out sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-[slideUp_0.3s_ease-out]">
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: scale(0);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
          <div className="bg-white dark:bg-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 px-6 py-6">
              <div className="space-y-6">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative cursor-pointer group">
                      <input
                        type="radio"
                        value="income"
                        checked={formData.type === 'income'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })}
                        className="sr-only peer"
                      />
                      <div className={`relative p-5 border-2 rounded-xl transition-all duration-300 ${
                        formData.type === 'income'
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20 shadow-lg shadow-green-500/20 scale-105'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-gray-50 dark:hover:bg-gray-600/50'
                      }`}>
                        {/* Selected indicator */}
                        {formData.type === 'income' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-[scaleIn_0.2s_ease-out]">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-3">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            formData.type === 'income'
                              ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50 scale-110'
                              : 'bg-green-100 dark:bg-green-900/30 group-hover:scale-105'
                          }`}>
                            <svg className={`w-7 h-7 transition-colors ${
                              formData.type === 'income' ? 'text-white' : 'text-green-600 dark:text-green-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className={`font-bold text-base transition-colors ${
                              formData.type === 'income'
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              Income
                            </p>
                            <p className={`text-xs mt-1 transition-colors ${
                              formData.type === 'income'
                                ? 'text-green-600 dark:text-green-400 font-medium'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              Money received
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                    <label className="relative cursor-pointer group">
                      <input
                        type="radio"
                        value="expense"
                        checked={formData.type === 'expense'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })}
                        className="sr-only peer"
                      />
                      <div className={`relative p-5 border-2 rounded-xl transition-all duration-300 ${
                        formData.type === 'expense'
                          ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20 shadow-lg shadow-red-500/20 scale-105'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-gray-50 dark:hover:bg-gray-600/50'
                      }`}>
                        {/* Selected indicator */}
                        {formData.type === 'expense' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-[scaleIn_0.2s_ease-out]">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-3">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            formData.type === 'expense'
                              ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50 scale-110'
                              : 'bg-red-100 dark:bg-red-900/30 group-hover:scale-105'
                          }`}>
                            <svg className={`w-7 h-7 transition-colors ${
                              formData.type === 'expense' ? 'text-white' : 'text-red-600 dark:text-red-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className={`font-bold text-base transition-colors ${
                              formData.type === 'expense'
                                ? 'text-red-700 dark:text-red-300'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              Expense
                            </p>
                            <p className={`text-xs mt-1 transition-colors ${
                              formData.type === 'expense'
                                ? 'text-red-600 dark:text-red-400 font-medium'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              Money spent
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Category</option>
                      {filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount (Rp) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium pointer-events-none z-10">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={formData.amount ? formatRupiahInput(String(formData.amount)) : ''}
                        onChange={(e) => {
                          // Parse input yang sudah diformat, simpan sebagai string number murni
                          const inputValue = e.target.value
                          // Pastikan parse hanya sekali, tidak double parse
                          // parseRupiahInput akan remove semua non-numeric dan return number
                          const parsed = parseRupiahInput(inputValue)
                          // Validasi: pastikan tidak ada double parsing dan pastikan integer
                          const finalAmount = parsed > 0 ? Math.floor(parsed) : 0
                          // Simpan sebagai string number murni (tanpa formatting) - ini penting!
                          // Jangan simpan sebagai formatted string, karena akan double format
                          setFormData(prev => {
                            // Pastikan tidak ada double format dengan memastikan amount selalu number murni
                            const newAmount = finalAmount > 0 ? String(finalAmount) : ''
                            // Hanya update jika berbeda untuk mencegah unnecessary re-render
                            if (prev.amount !== newAmount) {
                              return { ...prev, amount: newAmount }
                            }
                            return prev
                          })
                        }}
                        onBlur={(e) => {
                          // Pastikan value selalu number murni saat blur
                          const inputValue = e.target.value
                          const parsed = parseRupiahInput(inputValue)
                          const finalAmount = parsed > 0 ? Math.floor(parsed) : 0
                          // Pastikan tidak ada double format
                          setFormData(prev => {
                            const newAmount = finalAmount > 0 ? String(finalAmount) : ''
                            if (prev.amount !== newAmount) {
                              return { ...prev, amount: newAmount }
                            }
                            return prev
                          })
                        }}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all relative z-0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.transaction_date}
                      onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter description"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    {editingTransaction ? 'Update Transaction' : 'Create Transaction'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TransactionModal

