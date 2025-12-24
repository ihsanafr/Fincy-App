import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useModal } from '../../contexts/ModalContext'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs'
import { sortArray, getSortDirection } from '../../utils/tableSort'

function AdminUsers() {
  const { user: currentUser } = useAuth()
  const { showAlert, showConfirm, showValidation } = useModal()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const breadcrumbs = useBreadcrumbs()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      // Handle paginated response
      const usersData = response.data.data || response.data
      const usersArray = Array.isArray(usersData) ? usersData : []
      setUsers(usersArray)
      setFilteredUsers(usersArray)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort users
  useEffect(() => {
    let result = [...users]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((user) => {
        return (
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        )
      })
    }

    // Apply sorting
    if (sortField) {
      result = sortArray(result, sortField, sortDirection)
    }

    setFilteredUsers(result)
  }, [searchQuery, users, sortField, sortDirection])

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

  const handleDeleteUser = (user) => {
    showConfirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      type: 'warning',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          setDeletingId(user.id)
          await api.delete(`/admin/users/${user.id}`)
          setUsers((prev) => prev.filter((u) => u.id !== user.id))
          showAlert({
            type: 'success',
            title: 'Deleted',
            message: 'User has been deleted',
          })
        } catch (error) {
          console.error('Error deleting user:', error)
          showAlert({
            type: 'error',
            title: 'Error',
            message: error.response?.data?.message || 'Failed to delete user',
          })
        } finally {
          setDeletingId(null)
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
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Users</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage all registered users
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
            placeholder="Search users by name or email..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent relative z-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No users yet.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No users found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <SortableHeader field="name" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    User
                  </SortableHeader>
                  <SortableHeader field="email" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Email
                  </SortableHeader>
                  <SortableHeader field="role" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Role
                  </SortableHeader>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Subscription
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Certificates
                  </TableCell>
                  <SortableHeader field="created_at" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Joined
                  </SortableHeader>
                  <TableCell isHeader className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredUsers.map((user) => {
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
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-brand-500 dark:hover:border-brand-400 transition-colors cursor-pointer"
                            >
                              <option value="user">User</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={deletingId === user.id}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete User"
                            >
                              {deletingId === user.id ? (
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
                          </div>
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
