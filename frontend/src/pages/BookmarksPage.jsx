/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../hooks/useBreadcrumbs'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'

function BookmarksPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const breadcrumbs = useBreadcrumbs()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBookmarks()
    }
  }, [user])

  const fetchBookmarks = async () => {
    setLoading(true)
    try {
      const response = await api.get('/bookmarks')
      setBookmarks(response.data)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      showToast({ type: 'error', message: 'Failed to load bookmarks' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async (moduleId) => {
    try {
      await api.post(`/modules/${moduleId}/bookmark`)
      showToast({ type: 'success', message: 'Bookmark removed' })
      fetchBookmarks()
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to remove bookmark' })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to view your bookmarks
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton count={6} height={200} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Bookmarks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved learning modules
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="No Bookmarks Yet"
            message="Start bookmarking modules you want to learn later!"
          >
            <Link
              to="/learning-modules"
              className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold inline-block"
            >
              Browse Modules
            </Link>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200 group"
              >
                {bookmark.module?.thumbnail && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={bookmark.module.thumbnail}
                      alt={bookmark.module.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.module_id)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
                        title="Remove bookmark"
                      >
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge color="info" variant="light" size="sm">
                      {bookmark.module?.category || 'General'}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {bookmark.module?.title || 'Module'}
                  </h3>
                  {bookmark.module?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {bookmark.module.description}
                    </p>
                  )}
                  <Link
                    to={`/learning-modules/${bookmark.module_id}`}
                    className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium text-sm"
                  >
                    Continue Learning
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookmarksPage

