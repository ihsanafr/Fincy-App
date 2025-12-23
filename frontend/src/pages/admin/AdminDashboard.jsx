import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'
import DashboardMetrics from '../../components/dashboard/DashboardMetrics'
import RecentUsers from '../../components/dashboard/RecentUsers'
import RecentPayments from '../../components/dashboard/RecentPayments'
import QuickStats from '../../components/dashboard/QuickStats'

function AdminDashboard() {
  const { showAlert, showInput, showValidation } = useModal()
  const [statistics, setStatistics] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, paymentsRes] = await Promise.all([
        api.get('/admin/dashboard/statistics'),
        api.get('/admin/dashboard/recent-users'),
        api.get('/admin/dashboard/recent-payments'),
      ])

      setStatistics(statsRes.data)
      setRecentUsers(usersRes.data)
      setRecentPayments(paymentsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayment = async (id) => {
    try {
      await api.put(`/admin/payments/${id}/approve`)
      fetchDashboardData()
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
  }

  const handleRejectPayment = async (id) => {
    showInput({
      title: 'Reject Payment',
      message: 'Please provide a reason for rejection (optional):',
      placeholder: 'Enter rejection reason...',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      onConfirm: async (notes) => {
        try {
          await api.put(`/admin/payments/${id}/reject`, { notes })
          fetchDashboardData()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Metrics Cards */}
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <DashboardMetrics statistics={statistics} />
      </div>

      {/* Quick Stats Card */}
      <div className="col-span-12 xl:col-span-5">
        <QuickStats statistics={statistics} />
      </div>

      {/* Recent Users */}
      <div className="col-span-12 xl:col-span-7">
        <RecentUsers users={recentUsers} />
      </div>

      {/* Recent Payments */}
      <div className="col-span-12 xl:col-span-5">
        <RecentPayments
          payments={recentPayments}
          onApprove={handleApprovePayment}
          onReject={handleRejectPayment}
        />
      </div>
    </div>
  )
}

export default AdminDashboard

