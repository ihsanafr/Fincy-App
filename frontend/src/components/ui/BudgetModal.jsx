/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useState, useEffect } from 'react'
import { formatRupiahInput, parseRupiahInput } from '../../utils/currency'

function BudgetModal({ isOpen, onClose, editingBudget, categories, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    period: 'monthly',
  })

  useEffect(() => {
    if (editingBudget && isOpen) {
      // Parse amount: pastikan selalu number murni (bukan string yang sudah diformat)
      let amountValue = ''
      if (editingBudget.amount !== null && editingBudget.amount !== undefined) {
        // Konversi ke number dulu, kemudian ke string number murni
        const rawAmount = Number(editingBudget.amount)
        if (!isNaN(rawAmount) && rawAmount > 0) {
          // Simpan sebagai string number murni (tanpa formatting)
          amountValue = String(Math.floor(Math.abs(rawAmount)))
        }
      }
      
      // Format tanggal untuk input date (yyyy-mm-dd)
      let formattedStartDate = new Date().toISOString().split('T')[0]
      let formattedEndDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      
      if (editingBudget.start_date) {
        try {
          const date = new Date(editingBudget.start_date)
          if (!isNaN(date.getTime())) {
            formattedStartDate = date.toISOString().split('T')[0]
          }
        } catch (e) {
          formattedStartDate = new Date().toISOString().split('T')[0]
        }
      }
      
      if (editingBudget.end_date) {
        try {
          const date = new Date(editingBudget.end_date)
          if (!isNaN(date.getTime())) {
            formattedEndDate = date.toISOString().split('T')[0]
          }
        } catch (e) {
          formattedEndDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
        }
      }
      
      setFormData({
        category_id: editingBudget.category_id || '',
        amount: amountValue,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        period: editingBudget.period || 'monthly',
      })
    } else if (!editingBudget && isOpen) {
      // Reset form saat modal dibuka tanpa editingBudget
      setFormData({
        category_id: '',
        amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        period: 'monthly',
      })
    }
  }, [editingBudget?.id, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

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
          `}</style>
          <div className="bg-white dark:bg-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
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
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Budget Amount (Rp) *
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
                          const parsed = parseRupiahInput(inputValue)
                          const finalAmount = parsed > 0 ? Math.floor(parsed) : 0
                          // Simpan sebagai string number murni (tanpa formatting)
                          setFormData(prev => {
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

                  {/* Period */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Period
                    </label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                      min={formData.start_date}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Budget Tips</p>
                      <p>Set a realistic budget amount based on your spending history. You'll be notified when you're close to or exceed your budget limit.</p>
                    </div>
                  </div>
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
                    {editingBudget ? 'Update Budget' : 'Create Budget'}
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

export default BudgetModal

