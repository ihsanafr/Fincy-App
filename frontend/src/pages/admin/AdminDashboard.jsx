/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs'
import DashboardMetrics from '../../components/dashboard/DashboardMetrics'
import RecentUsers from '../../components/dashboard/RecentUsers'
import RecentPayments from '../../components/dashboard/RecentPayments'
import QuickStats from '../../components/dashboard/QuickStats'
import DashboardCharts from '../../components/dashboard/DashboardCharts'
import RatingsModerationPanel from '../../components/dashboard/RatingsModerationPanel'

function AdminDashboard() {
  const { showAlert, showInput, showValidation } = useModal()
  const [statistics, setStatistics] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const breadcrumbs = useBreadcrumbs()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, paymentsRes, chartRes] = await Promise.all([
        api.get('/admin/dashboard/statistics'),
        api.get('/admin/dashboard/recent-users'),
        api.get('/admin/dashboard/recent-payments'),
        api.get('/admin/dashboard/chart-data'),
      ])

      setStatistics(statsRes.data)
      setRecentUsers(usersRes.data)
      setRecentPayments(paymentsRes.data)
      setChartData(chartRes.data)
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
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Ringkasan sistem dan aktivitas terbaru untuk memantau platform.
        </p>
      </div>
      {/* Metrics Cards - Full Width */}
      <DashboardMetrics statistics={statistics} />

      {/* Engagement Trend - Full Width, Larger */}
      <DashboardCharts chartData={chartData} showEngagementOnly={true} />

      {/* Payments Insight and Quick Stats - Side by Side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
        {/* Payments Insight */}
        <div className="lg:col-span-1 h-full">
          <DashboardCharts chartData={chartData} showPaymentsOnly={true} />
        </div>

        {/* Quick Stats Card */}
        <div className="lg:col-span-1 h-full">
          <QuickStats statistics={statistics} />
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-1">
          <RecentUsers users={recentUsers} />
        </div>

        {/* Recent Payments */}
        <div className="lg:col-span-1">
          <RecentPayments
            payments={recentPayments}
            onApprove={handleApprovePayment}
            onReject={handleRejectPayment}
          />
        </div>
      </div>

      {/* Ratings Moderation */}
      <RatingsModerationPanel />
    </div>
  )
}

export default AdminDashboard

