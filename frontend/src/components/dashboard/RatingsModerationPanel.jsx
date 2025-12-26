/**
 * @fincy-doc
 * Ringkasan: Panel moderasi rating/review untuk staff (educator/super admin).
 * Manfaat: Memudahkan staff menghapus review yang tidak pantas langsung dari dashboard.
 */
import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'

function StarRow({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0))
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < v ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.964a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.373 2.452a1 1 0 00-.364 1.118l1.286 3.964c.3.921-.755 1.688-1.538 1.118l-3.373-2.452a1 1 0 00-1.176 0l-3.373 2.452c-.783.57-1.838-.197-1.538-1.118l1.286-3.964a1 1 0 00-.364-1.118L2.05 9.391c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69l1.286-3.964z" />
        </svg>
      ))}
    </div>
  )
}

function RatingsModerationPanel({ limit = 6 }) {
  const { showConfirm, showAlert } = useModal()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const fetchRatings = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/ratings?per_page=${encodeURIComponent(limit)}`)
      const data = res.data?.data || res.data || []
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRatings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = (rating) => {
    if (!rating?.id || !rating?.module_id) return
    showConfirm({
      title: 'Hapus Review',
      message: 'Yakin ingin menghapus rating/review ini? Tindakan ini tidak bisa dibatalkan.',
      type: 'danger',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        try {
          setDeletingId(rating.id)
          await api.delete(`/modules/${rating.module_id}/ratings/${rating.id}`)
          setItems((prev) => prev.filter((x) => x.id !== rating.id))
          showAlert({
            type: 'success',
            title: 'Berhasil',
            message: 'Review berhasil dihapus.',
          })
        } catch (e) {
          showAlert({
            type: 'error',
            title: 'Gagal',
            message: e?.response?.data?.message || 'Tidak bisa menghapus review.',
          })
        } finally {
          setDeletingId(null)
        }
      },
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Moderasi Rating & Review</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Review terbaru yang bisa kamu hapus jika tidak pantas.</p>
        </div>
        <button
          onClick={fetchRatings}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 9a9 9 0 00-15.5-5.5L4 10m16 4l-.5 1.5A9 9 0 013.5 19.5" />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-gray-600 dark:text-gray-400">Memuat review...</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-sm text-gray-600 dark:text-gray-400">Belum ada review.</div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((r) => (
            <div key={r.id} className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                {r.user?.profile_photo ? (
                  <img src={r.user.profile_photo} alt={r.user?.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {(r.user?.name || 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {r.user?.name || 'User'}{' '}
                      <span className="font-normal text-gray-500 dark:text-gray-400">
                        • {r.module?.title || 'Modul'}
                      </span>
                    </p>
                    <div className="mt-1">
                      <StarRow value={r.rating} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(r)}
                    disabled={deletingId === r.id}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deletingId === r.id ? 'Menghapus...' : 'Hapus'}
                  </button>
                </div>

                {r.review ? (
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {String(r.review)}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">Tanpa komentar.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RatingsModerationPanel


