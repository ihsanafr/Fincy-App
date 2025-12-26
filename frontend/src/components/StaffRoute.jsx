/**
 * @fincy-doc
 * Ringkasan: Route guard untuk staff (educator dan super admin).
 * Manfaat: Membatasi akses halaman kontribusi (modul/materi) agar tidak bisa diakses user biasa.
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function StaffRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const isStaff = user && (user.role === 'super_admin' || user.role === 'educator')
  if (!isStaff) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default StaffRoute


