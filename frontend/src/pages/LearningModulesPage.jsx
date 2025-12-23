import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useModal } from '../contexts/ModalContext'
import api from '../services/api'
import Badge from '../components/ui/Badge'

function LearningModulesPage() {
  const { user } = useAuth()
  const { showConfirm } = useModal()
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDropdowns, setOpenDropdowns] = useState({})

  useEffect(() => {
    fetchModules()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdowns({})
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchModules = async () => {
    try {
      const response = await api.get('/modules')
      setModules(response.data)
    } catch (error) {
      console.error('Error fetching modules:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDropdown = (moduleId) => {
    setOpenDropdowns((prev) => {
      // If this dropdown is already open, close it
      if (prev[moduleId]) {
        return {}
      }
      // Otherwise, close all and open only this one
      return { [moduleId]: true }
    })
  }

  const handleStartLearning = (moduleId, e) => {
    if (!user) {
      e.preventDefault()
      showConfirm({
        title: 'Login Required',
        message: 'You need to login first to start learning. Would you like to login now?',
        type: 'info',
        confirmText: 'Login',
        cancelText: 'Cancel',
        onConfirm: () => {
          navigate('/login', { state: { returnTo: `/learning-modules/${moduleId}` } })
        },
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50 dark:from-gray-900 dark:via-gray-800 dark:to-brand-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading modules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50 dark:from-gray-900 dark:via-gray-800 dark:to-brand-900/20 overflow-x-hidden">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 dark:from-brand-700 dark:via-brand-800 dark:to-purple-800">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-2xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-300/20 rounded-full mix-blend-overlay filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              📚 Learning Center
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Learning Modules
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Choose a module to start your financial literacy journey and earn certificates
            </p>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {modules.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/20 dark:to-purple-900/20 rounded-3xl flex items-center justify-center">
                <svg className="w-12 h-12 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No modules available yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Check back later for new learning modules
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 relative dropdown-container animate-fadeInUp hover:-translate-y-2 overflow-hidden h-auto self-start ${
                    openDropdowns[module.id] ? 'overflow-visible' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-100/50 to-transparent dark:from-brand-900/20 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-75 transition-opacity blur-2xl"></div>
                  
                  <div className="relative flex flex-col">
                    {/* Thumbnail or Icon */}
                    <div className="mb-4">
                      {module.thumbnail_url ? (
                        <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={module.thumbnail_url}
                            alt={module.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge color="info" variant="light" size="sm">
                          {module.category || 'General'}
                        </Badge>
                        {module.contents && module.contents.length > 0 && (
                          <button
                            onClick={() => toggleDropdown(module.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="View learning materials"
                          >
                            <svg
                              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                                openDropdowns[module.id] ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors break-words">
                      {module.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 break-words">
                      {module.description || 'No description available'}
                    </p>

                    {/* Dropdown Menu */}
                    {openDropdowns[module.id] && module.contents && module.contents.length > 0 && (
                      <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-brand-50/50 dark:from-gray-700/50 dark:to-brand-900/20 rounded-2xl border border-gray-200 dark:border-gray-600 animate-slideDown overflow-hidden">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                          Learning Materials ({module.contents.length})
                        </p>
                        <div className="space-y-2 max-h-64 overflow-y-auto overflow-x-hidden custom-scrollbar">
                          {module.contents.map((content, index) => (
                            <Link
                              key={content.id}
                              to={`/learning-modules/${module.id}#content-${content.id}`}
                              onClick={() => setOpenDropdowns({})}
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 group/item transform hover:translate-x-1 overflow-hidden"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                                <span className="text-xs font-bold text-white">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover/item:text-brand-600 dark:group-hover/item:text-brand-400 break-words">
                                  {content.title}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                {content.type === 'video' ? (
                                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>{module.contents?.length || 0} materials</span>
                      </div>
                      {module.quiz && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          <span>Quiz available</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/learning-modules/${module.id}`}
                      onClick={(e) => handleStartLearning(module.id, e)}
                      className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-200 font-semibold shadow-lg group-hover:shadow-xl transform group-hover:scale-105"
                    >
                      Start Learning
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default LearningModulesPage
