import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs'
import { formatRupiah } from '../../utils/currency'
import { sortArray, getSortDirection } from '../../utils/tableSort'

function AdminPayments() {
  const { showAlert, showConfirm, showInput, showValidation } = useModal()
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const breadcrumbs = useBreadcrumbs()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await api.get('/admin/payments')
      setPayments(response.data)
      setFilteredPayments(response.data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort payments
  useEffect(() => {
    let result = [...payments]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((payment) => {
        return (
          payment.user?.name?.toLowerCase().includes(query) ||
          payment.user?.email?.toLowerCase().includes(query) ||
          payment.status?.toLowerCase().includes(query)
        )
      })
    }

    // Apply sorting
    if (sortField) {
      result = sortArray(result, sortField, sortDirection)
    }

    setFilteredPayments(result)
  }, [searchQuery, payments, sortField, sortDirection])

  const handleSort = (field) => {
    const newDirection = getSortDirection(sortDirection, sortField, field)
    setSortField(field)
    setSortDirection(newDirection)
  }

  const SortableHeader = ({ field, children, className = '' }) => {
    const isActive = sortField === field
    return (
      <TableCell
        isHeader
        className={`${className} cursor-pointer select-none group`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleSort(field)
        }}
        style={{ userSelect: 'none' }}
      >
        <div className="flex items-center gap-2">
          <span>{children}</span>
          <div className="flex items-center">
            {isActive ? (
              <svg
                className={`w-4 h-4 text-brand-600 dark:text-brand-400 ${
                  sortDirection === 'asc' ? '' : 'rotate-180'
                } transition-transform`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </div>
        </div>
      </TableCell>
    )
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

  const handleDelete = async (payment) => {
    showConfirm({
      title: 'Delete Payment Request',
      message: `Are you sure you want to delete payment request from ${payment.user?.name || 'this user'}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          setDeletingId(payment.id)
          await api.delete(`/admin/payments/${payment.id}`)
          setPayments((prev) => prev.filter((p) => p.id !== payment.id))
          showAlert({
            type: 'success',
            title: 'Deleted',
            message: 'Payment request has been deleted',
          })
        } catch (error) {
          console.error('Error deleting payment:', error)
          showAlert({
            type: 'error',
            title: 'Error',
            message: error.response?.data?.message || 'Failed to delete payment request',
          })
        } finally {
          setDeletingId(null)
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
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Payment Requests</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review and manage payment subscription requests
          </p>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name, email, or status..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent relative z-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No payment requests yet.</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No payment requests found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <SortableHeader field="user.name" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    User
                  </SortableHeader>
                  <SortableHeader field="amount" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Amount
                  </SortableHeader>
                  <SortableHeader field="status" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </SortableHeader>
                  <SortableHeader field="created_at" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </SortableHeader>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Proof
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredPayments.map((payment) => (
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
                          className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all duration-200 inline-block"
                          title="View Payment Proof"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(payment.id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-all duration-200"
                            title="Approve Payment"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            title="Reject Payment"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      {/* Only show delete button for pending or rejected payments */}
                      {payment.status !== 'approved' && (
                        <button
                          onClick={() => handleDelete(payment)}
                          disabled={deletingId === payment.id}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Payment"
                        >
                          {deletingId === payment.id ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
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
