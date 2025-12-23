import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useModal } from '../../contexts/ModalContext'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'

function AdminUsers() {
  const { user: currentUser } = useAuth()
  const { showAlert, showConfirm, showValidation } = useModal()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      // Handle paginated response
      const usersData = response.data.data || response.data
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    showConfirm({
      title: 'Change User Role',
      message: `Are you sure you want to change this user's role to ${newRole === 'super_admin' ? 'Super Admin' : 'User'}?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.put(`/admin/users/${userId}/role`, { role: newRole })
          fetchUsers()
          showAlert({
            type: 'success',
            title: 'Success',
            message: 'User role updated successfully',
          })
        } catch (error) {
          console.error('Error updating user role:', error)
          if (error.response?.status === 422) {
            showValidation({
              title: 'Validation Error',
              error,
            })
          } else {
            showAlert({
              type: 'error',
              title: 'Error',
              message: error.response?.data?.message || 'Failed to update user role',
            })
          }
        }
      },
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getSubscriptionStatus = (user) => {
    if (!user.subscription) return { color: 'light', label: 'No Subscription' }
    const status = user.subscription.status
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      approved: { color: 'success', label: 'Active' },
      rejected: { color: 'error', label: 'Rejected' },
    }
    return statusConfig[status] || { color: 'light', label: status }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Users</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and manage all registered users
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No users yet.</p>
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
                    Email
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Role
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Subscription
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Certificates
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Joined
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user) => {
                  const subscriptionStatus = getSubscriptionStatus(user)
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white/90">
                            {user.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          color={user.role === 'super_admin' ? 'error' : 'light'}
                          variant="light"
                        >
                          {user.role === 'super_admin' ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge color={subscriptionStatus.color} variant="light">
                          {subscriptionStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.certificates?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {currentUser && currentUser.id !== user.id ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-brand-500 dark:hover:border-brand-400 transition-colors cursor-pointer"
                          >
                            <option value="user">User</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
