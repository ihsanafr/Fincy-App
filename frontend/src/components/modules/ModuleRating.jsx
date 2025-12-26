/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useModal } from '../../contexts/ModalContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import Skeleton from '../ui/Skeleton'

function ModuleRating({ moduleId }) {
  const { user } = useAuth()
  const { showAlert, showConfirm } = useModal()
  const { showToast } = useToast()
  const [ratings, setRatings] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [ratingCounts, setRatingCounts] = useState({})
  const [userRating, setUserRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')

  useEffect(() => {
    fetchRatings()
  }, [moduleId])

  const fetchRatings = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/modules/${moduleId}/ratings`)
      setRatings(response.data.ratings || [])
      setAverageRating(response.data.average_rating || 0)
      setTotalRatings(response.data.total_ratings || 0)
      setRatingCounts(response.data.rating_counts || {})
      setUserRating(response.data.user_rating || null)
      
      if (response.data.user_rating) {
        setRating(response.data.user_rating.rating)
        setReview(response.data.user_rating.review || '')
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!user) {
      showAlert({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login to submit a rating',
      })
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/modules/${moduleId}/ratings`, {
        rating,
        review: review.trim() || null,
      })
      showToast({ type: 'success', message: 'Rating submitted successfully!' })
      setShowRatingForm(false)
      fetchRatings()
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to submit rating',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRating = async () => {
    if (!userRating) return

    showConfirm({
      title: 'Hapus Rating',
      message: 'Yakin ingin menghapus rating kamu?',
      type: 'warning',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        try {
          await api.delete(`/modules/${moduleId}/ratings`)
          showToast({ type: 'success', message: 'Rating berhasil dihapus!' })
          setUserRating(null)
          setShowRatingForm(false)
          fetchRatings()
        } catch (error) {
          showAlert({
            type: 'error',
            title: 'Error',
            message: 'Gagal menghapus rating',
          })
        }
      },
    })
  }

  const isModerator = user && (user.role === 'super_admin' || user.role === 'educator')

  const handleModerateDelete = async (ratingId) => {
    if (!isModerator) return
    showConfirm({
      title: 'Hapus Komentar',
      message: 'Komentar ini akan dihapus dari modul. Lanjutkan?',
      type: 'warning',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        try {
          await api.delete(`/modules/${moduleId}/ratings/${ratingId}`)
          showToast({ type: 'success', message: 'Komentar berhasil dihapus!' })
          fetchRatings()
        } catch (error) {
          showAlert({
            type: 'error',
            title: 'Error',
            message: error.response?.data?.message || 'Gagal menghapus komentar',
          })
        }
      },
    })
  }

  const renderStars = (value, interactive = false, size = 'md') => {
    const stars = []
    const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform ${
            i <= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          <svg className={sizeClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      )
    }
    return stars
  }

  if (loading) {
    return <Skeleton count={3} height={100} />
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ratings & Reviews
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(averageRating), false, 'lg')}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                </p>
              </div>
            </div>
          </div>
          {user && (
            <button
              onClick={() => setShowRatingForm(!showRatingForm)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              {userRating ? 'Edit Rating' : 'Add Rating'}
            </button>
          )}
        </div>

        {/* Rating Distribution */}
        {Object.keys(ratingCounts).length > 0 && (
          <div className="space-y-2 mt-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                  {star}★
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalRatings > 0 ? (ratingCounts[star] || 0) / totalRatings * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                  {ratingCounts[star] || 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Form */}
      {showRatingForm && user && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {userRating ? 'Edit Your Rating' : 'Rate This Module'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-1">
                {renderStars(rating, true)}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {rating} out of 5
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Share your thoughts about this module..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {review.length}/1000 characters
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitRating}
                disabled={submitting}
                className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
              {userRating && (
                <button
                  onClick={handleDeleteRating}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Rating
                </button>
              )}
              <button
                onClick={() => {
                  setShowRatingForm(false)
                  if (!userRating) {
                    setRating(5)
                    setReview('')
                  }
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {ratings.length > 0 ? (
        <div className="space-y-4">
          {ratings.map((ratingItem) => (
            <div
              key={ratingItem.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {ratingItem.user?.profile_photo ? (
                    <img
                      src={ratingItem.user.profile_photo}
                      alt={ratingItem.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg">
                      {ratingItem.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {ratingItem.user?.name || 'Anonymous'}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(ratingItem.rating, false, 'sm')}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(ratingItem.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {isModerator && (
                      <button
                        onClick={() => handleModerateDelete(ratingItem.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Hapus komentar (moderasi)"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  {ratingItem.review && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      {ratingItem.review}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No ratings yet. Be the first to rate this module!
          </p>
        </div>
      )}
    </div>
  )
}

export default ModuleRating

