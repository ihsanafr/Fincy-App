import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useModal } from '../contexts/ModalContext'
import api from '../services/api'
import { Link } from 'react-router-dom'

function ProfilePage() {
  const { user, setUser } = useAuth()
  const { showAlert } = useModal()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBannerColor, setEditBannerColor] = useState('#3b82f6')
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile')
      setProfile(response.data)
      setEditName(response.data.user.name)
      setEditBannerColor(response.data.user.banner_color || '#3b82f6')
    } catch (error) {
      console.error('Error fetching profile:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load profile data'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      showAlert({
        type: 'error',
        title: 'Validation Error',
        message: 'Name cannot be empty'
      })
      return
    }

    setUpdatingProfile(true)
    try {
      const response = await api.put('/profile', {
        name: editName.trim(),
        banner_color: editBannerColor,
      })

      // Update profile in state
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...response.data.user
        }
      }))

      // Update user in auth context
      setUser(prev => ({
        ...prev,
        name: response.data.user.name,
        slug: response.data.user.slug,
        banner_color: response.data.user.banner_color,
      }))

      setIsEditing(false)
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Profile updated successfully'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update profile'
      })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showAlert({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select an image file'
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showAlert({
        type: 'error',
        title: 'File Too Large',
        message: 'Image must be less than 2MB'
      })
      return
    }

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await api.post('/profile/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update profile photo in state
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          profile_photo: response.data.profile_photo
        }
      }))

      // Update user in auth context
      setUser(prev => ({
        ...prev,
        profile_photo: response.data.profile_photo
      }))

      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Profile photo uploaded successfully'
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to upload profile photo'
      })
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Unable to load profile data
          </p>
        </div>
      </div>
    )
  }

  const allPortfolioItems = [
    ...profile.portfolio.certificates.map(cert => ({
      ...cert,
      type: 'certificate',
      date: cert.issued_at
    })),
    ...profile.portfolio.completed_modules
      .filter(module => !profile.portfolio.certificates.some(cert => cert.module_id === module.module_id))
      .map(module => ({
        ...module,
        type: 'completed',
        date: module.completed_at
      })),
    ...profile.portfolio.passed_quizzes
      .filter(quiz => !profile.portfolio.certificates.some(cert => cert.module_id === quiz.module_id))
      .map(quiz => ({
        ...quiz,
        type: 'quiz',
        date: quiz.passed_at
      }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div 
            className="h-32 transition-colors duration-300"
            style={{ 
              background: profile?.user.banner_color 
                ? `linear-gradient(to right, ${profile.user.banner_color}, ${profile.user.banner_color}dd)`
                : 'linear-gradient(to right, #3b82f6, #2563eb)'
            }}
          ></div>
          <div className="px-8 pb-8 -mt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-lg">
                  {profile.user.profile_photo ? (
                    <img
                      src={profile.user.profile_photo}
                      alt={profile.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
                      {profile.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingPhoto ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        id="edit-name"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-banner-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Banner Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          id="edit-banner-color"
                          type="color"
                          value={editBannerColor}
                          onChange={(e) => setEditBannerColor(e.target.value)}
                          className="w-16 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editBannerColor}
                          onChange={(e) => setEditBannerColor(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors font-mono text-sm"
                          placeholder="#3b82f6"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={updatingProfile}
                        className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditName(profile.user.name)
                          setEditBannerColor(profile.user.banner_color || '#3b82f6')
                        }}
                        disabled={updatingProfile}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {profile.user.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {profile.user.email}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">
                          Joined {new Date(profile.user.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              {!isEditing && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                  <Link
                    to={`/profile/${profile.user.slug || profile.user.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    View Public Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {profile.stats.total_certificates}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Modules</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {profile.stats.total_completed_modules}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Passed Quizzes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {profile.stats.total_passed_quizzes}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {allPortfolioItems.length} Achievements
            </div>
          </div>

          {allPortfolioItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Achievements Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start learning modules to build your portfolio
              </p>
              <Link
                to="/learning-modules"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold"
              >
                Browse Modules
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPortfolioItems.map((item, index) => (
                <Link
                  key={`${item.type}-${item.module_id || item.id}-${index}`}
                  to={`/learning-modules/${item.module_id}`}
                  className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'certificate' && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                            Certificate
                          </span>
                        )}
                        {item.type === 'completed' && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                            Completed
                          </span>
                        )}
                        {item.type === 'quiz' && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                            Quiz Passed
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2">
                        {item.module_title}
                      </h3>
                      {item.module_description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                          {item.module_description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {item.type === 'quiz' && item.score && (
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        Score: {item.score}%
                      </span>
                    )}
                    {item.type === 'certificate' && item.certificate_number && (
                      <span className="font-mono text-xs text-gray-400">
                        {item.certificate_number.substring(0, 12)}...
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

