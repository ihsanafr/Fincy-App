/**
 * @fincy-doc
 * Ringkasan: Halaman khusus untuk moderasi rating & review (staff: educator/super admin).
 * Manfaat: Review bisa dikelola dari menu sidebar tanpa harus lewat dashboard.
 */
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import RatingsModerationPanel from '../../components/dashboard/RatingsModerationPanel'
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs'

function AdminRatings() {
  const breadcrumbs = useBreadcrumbs()

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ratings & Reviews</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Kelola review terbaru dan hapus yang tidak pantas.
        </p>
      </div>

      <RatingsModerationPanel limit={20} />
    </div>
  )
}

export default AdminRatings


