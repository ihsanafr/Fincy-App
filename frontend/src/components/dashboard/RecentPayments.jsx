import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/Table'
import { formatRupiah } from '../../utils/currency'

const RecentPayments = ({ payments, onApprove, onReject }) => {
  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return <Badge color="success">Approved</Badge>
    }
    if (status === 'pending') {
      return <Badge color="warning">Pending</Badge>
    }
    return <Badge color="error">Rejected</Badge>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Payments
          </h3>
        </div>
        <Link
          to="/admin/payments"
          className="text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          View All
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                User
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {payments && payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {payment.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {payment.user?.name || 'Unknown'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatRupiah(payment.amount || 0)}
                  </TableCell>
                  <TableCell className="py-3">
                    {getStatusBadge(payment.status)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-3">
                    {payment.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprove(payment.id)}
                          className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(payment.id)}
                          className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="py-8 text-center text-theme-sm text-gray-500">
                  No payments yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default RecentPayments

