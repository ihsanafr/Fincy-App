/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useModal } from '../contexts/ModalContext'
import { formatRupiah, formatRupiahInput, parseRupiahInput } from '../utils/currency'

function PaymentPage() {
  const [amount, setAmount] = useState('')
  const [paymentProof, setPaymentProof] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { showValidation, showAlert } = useModal()
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPaymentProof(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('amount', amount)
    formData.append('payment_proof', paymentProof)

    try {
      // Let the browser set multipart boundaries automatically
      await api.post('/finance-tools/subscribe', formData)
      setSuccess(true)
      setTimeout(() => {
        navigate('/finance-tools')
      }, 2000)
    } catch (err) {
      if (err.response?.status === 422) {
        showValidation({
          title: 'Validation Error',
          error: err,
        })
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: err.response?.data?.message || 'Failed to submit payment',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Submitted
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your payment proof has been submitted successfully. Please wait for admin approval.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to Finance Tools...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/5">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 dark:from-purple-700 dark:via-purple-800 dark:to-purple-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-2xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-300/20 rounded-full mix-blend-overlay filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              to="/finance-tools"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
          </div>

          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              💰 Subscription Payment
            </div>
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Subscribe to{' '}
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Finance Tools
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Payment is voluntary. Upload your payment proof and wait for admin approval.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Payment Info Card */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-75 transition-opacity blur-2xl"></div>
            <div className="relative">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Payment Information
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Bank:</span>
                  <span className="text-gray-900 dark:text-white">Bank Mantap</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Account Number:</span>
                  <span className="text-gray-900 dark:text-white">0123 4567 8901 2345</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Account Name:</span>
                  <span className="text-gray-900 dark:text-white">Ahmad Fulan</span>
                </div>
                <div className="flex items-center justify-between py-2 pt-3">
                  <span className="font-semibold text-gray-900 dark:text-white">Amount:</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">Voluntary (any amount)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Jumlah Pembayaran
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium pointer-events-none z-10">
                    Rp
                  </div>
                  <input
                    id="amount"
                    name="amount"
                    type="text"
                    required
                    value={amount ? formatRupiahInput(amount.toString()) : ''}
                    onChange={(e) => {
                      const parsed = parseRupiahInput(e.target.value)
                      setAmount(parsed > 0 ? parsed.toString() : '')
                    }}
                    onBlur={(e) => {
                      const parsed = parseRupiahInput(e.target.value)
                      if (parsed > 0) {
                        setAmount(parsed.toString())
                      }
                    }}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 font-medium relative z-0"
                    placeholder="0"
                  />
                </div>
                {amount && (
                  <p className="mt-3 text-sm font-medium text-purple-600 dark:text-purple-400">
                    {formatRupiah(amount)}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="paymentProof" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Payment Proof (Image)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group">
                  <label htmlFor="paymentProof" className="w-full cursor-pointer">
                    <div className="space-y-3 text-center">
                      {preview ? (
                        <div className="space-y-3">
                          <div className="relative inline-block">
                            <img src={preview} alt="Preview" className="mx-auto h-40 w-auto rounded-xl shadow-md" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setPreview(null)
                                setPaymentProof(null)
                              }}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{paymentProof?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Click to change image</p>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-16 w-16 text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center items-center gap-2">
                            <span className="font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                              Click to upload
                            </span>
                            <span>or drag and drop</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                        </>
                      )}
                    </div>
                    <input
                      id="paymentProof"
                      name="paymentProof"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link
                  to="/finance-tools"
                  className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || !amount || !paymentProof}
                  className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PaymentPage
