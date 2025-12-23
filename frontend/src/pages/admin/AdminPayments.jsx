import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { formatRupiah } from '../../utils/currency'

function AdminPayments() {
  const { showAlert, showConfirm, showInput, showValidation } = useModal()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await api.get('/admin/payments')
      setPayments(response.data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    showConfirm({
      title: 'Approve Payment',
      message: 'Are you sure you want to approve this payment?',
      type: 'info',
      onConfirm: async () => {
        try {
          await api.put(`/admin/payments/${id}/approve`)
          fetchPayments()
          showAlert({
            type: 'success',
            title: 'Success',
            message: 'Payment approved successfully',
          })
        } catch (error) {
          console.error('Error approving payment:', error)
          if (error.response?.status === 422) {
            showValidation({
              title: 'Validation Error',
              error,
            })
          } else {
            showAlert({
              type: 'error',
              title: 'Error',
              message: error.response?.data?.message || 'Failed to approve payment',
            })
          }
        }
      },
    })
  }

  const handleReject = async (id) => {
    showInput({
      title: 'Reject Payment',
      message: 'Please provide a reason for rejection (optional):',
      placeholder: 'Enter rejection reason...',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      onConfirm: async (notes) => {
        try {
          await api.put(`/admin/payments/${id}/reject`, { notes })
          fetchPayments()
          showAlert({
            type: 'success',
            title: 'Success',
            message: 'Payment rejected successfully',
          })
        } catch (error) {
          console.error('Error rejecting payment:', error)
          if (error.response?.status === 422) {
            showValidation({
              title: 'Validation Error',
              error,
            })
          } else {
            showAlert({
              type: 'error',
              title: 'Error',
              message: error.response?.data?.message || 'Failed to reject payment',
            })
          }
        }
      },
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' },
    }
    const config = statusConfig[status] || { color: 'light', label: status }
    return <Badge color={config.color} variant="light">{config.label}</Badge>
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Payment Requests</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review and manage payment subscription requests
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No payment requests yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    User
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Amount
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Proof
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white/90">
                          {payment.user?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.user?.email || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white/90">
                        {formatRupiah(payment.amount || 0)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {payment.payment_proof ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${payment.payment_proof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(payment.id)}
                            className="px-3 py-1.5 text-success-600 bg-success-50 rounded-lg hover:bg-success-100 dark:bg-success-500/15 dark:text-success-400 dark:hover:bg-success-500/20 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            className="px-3 py-1.5 text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/15 dark:text-error-400 dark:hover:bg-error-500/20 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {payment.status !== 'pending' && (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPayments
