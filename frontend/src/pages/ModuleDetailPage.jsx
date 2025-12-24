import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useModal } from '../contexts/ModalContext'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'
import Badge from '../components/ui/Badge'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../hooks/useBreadcrumbs'
import ModuleRating from '../components/modules/ModuleRating'
import SocialShare from '../components/sharing/SocialShare'

function ModuleDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showAlert } = useModal()
  const navigate = useNavigate()
  const location = useLocation()
  const [module, setModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasCertificate, setHasCertificate] = useState(false)
  const [activeContentId, setActiveContentId] = useState(null)
  const [quizHistory, setQuizHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)
  const contentRefs = useRef({})
  const breadcrumbs = useBreadcrumbs()
  const { showToast } = useToast()

  useEffect(() => {
    fetchModule()
    if (user) {
      checkBookmark()
    }
  }, [id, user])

  const checkBookmark = async () => {
    try {
      const response = await api.get(`/modules/${id}/bookmark`)
      setIsBookmarked(response.data.is_bookmarked)
    } catch (error) {
      console.error('Error checking bookmark:', error)
    }
  }

  const handleToggleBookmark = async () => {
    if (!user) {
      showToast({ type: 'warning', message: 'Please login to bookmark modules' })
      return
    }

    setBookmarking(true)
    try {
      const response = await api.post(`/modules/${id}/bookmark`)
      setIsBookmarked(response.data.is_bookmarked)
      showToast({
        type: 'success',
        message: response.data.is_bookmarked ? 'Module bookmarked!' : 'Bookmark removed',
      })
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to update bookmark' })
    } finally {
      setBookmarking(false)
    }
  }

  // Refresh module data when returning from quiz or certificate page
  useEffect(() => {
    if (location.state?.refresh) {
      fetchModule()
      // Clear the refresh flag
      navigate(location.pathname, { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  // Scroll to content when hash is present in URL
  useEffect(() => {
    if (module && window.location.hash) {
      const contentId = window.location.hash.replace('#', '')
      setTimeout(() => {
        const element = document.getElementById(contentId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // Add highlight effect
          element.classList.add('ring-4', 'ring-brand-500', 'ring-opacity-50')
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-brand-500', 'ring-opacity-50')
          }, 2000)
          setActiveContentId(contentId)
        }
      }, 300)
    }
  }, [module])

  // Track which content is in view
  useEffect(() => {
    if (!module || !module.contents) return

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveContentId(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all content elements
    module.contents.forEach((content) => {
      const element = document.getElementById(`content-${content.id}`)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [module])

  const fetchModule = async () => {
    try {
      setLoading(true)
      // Add timestamp to prevent caching
      const response = await api.get(`/modules/${id}`, {
        params: { _t: Date.now() }
      })
      console.log('Module data:', response.data) // Debug log
      setModule(response.data.module)
      
      // Set completion status from backend
      const backendIsCompleted = response.data.is_completed || false
      const backendHasCertificate = response.data.has_certificate || false
      
      setIsCompleted(backendIsCompleted)
      setHasCertificate(backendHasCertificate)
      
      // If backend says not completed but we have quiz history, check locally
      if (!backendIsCompleted && module?.quiz && user) {
        // Will be checked in useEffect when quizHistory loads
      }
    } catch (error) {
      console.error('Error fetching module:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizHistory = async () => {
    if (!user || !id) return
    
    setLoadingHistory(true)
    try {
      const response = await api.get(`/modules/${id}/quiz/history`)
      setQuizHistory(response.data)
    } catch (error) {
      console.error('Error fetching quiz history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  // Fetch quiz history when module and user are available
  useEffect(() => {
    if (module && user && module.quiz) {
      fetchQuizHistory()
    }
  }, [module, user, id])

  // Update isCompleted and hasCertificate when quizHistory changes (if user passed quiz)
  useEffect(() => {
    if (quizHistory.length > 0) {
      const hasPassedQuiz = quizHistory.some(attempt => attempt.passed === true)
      if (hasPassedQuiz) {
        setIsCompleted(true)
        // If user passed quiz, they should have certificate
        if (!hasCertificate) {
          setHasCertificate(true)
        }
      }
    }
  }, [quizHistory, hasCertificate])

  const handleComplete = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      await api.post(`/modules/${id}/complete`)
      setIsCompleted(true)
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Module marked as completed!',
      })
    } catch (error) {
      console.error('Error marking module as complete:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark module as complete',
      })
    }
  }

  const handleStartQuiz = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate(`/modules/${id}/quiz`)
  }

  const handleContentClick = (contentId) => {
    const element = document.getElementById(`content-${contentId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveContentId(`content-${contentId}`)
    }
  }

  const extractYouTubeId = (url) => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading module...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Module not found</h2>
          <Link to="/learning-modules" className="text-brand-600 dark:text-brand-400 hover:underline">
            Back to Modules
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-brand-500 to-brand-600 dark:from-brand-700 dark:to-brand-800 text-white py-12 overflow-hidden">
        {module.thumbnail_url && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={module.thumbnail_url}
              alt={module.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/90 to-brand-600/90 dark:from-brand-700/90 dark:to-brand-800/90"></div>
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumbs 
              items={[
                { path: '/', label: 'Home' },
                { path: '/learning-modules', label: 'Learning Modules' },
                { path: `/learning-modules/${id}`, label: module?.title || 'Module' }
              ]}
            />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Badge color="info" variant="light" className="bg-white/20 text-white border-white/30">
              {module.category || 'General'}
            </Badge>
            {module.quiz && (
              <Badge color="success" variant="light" className="bg-white/20 text-white border-white/30">
                Quiz Available
              </Badge>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{module.title}</h1>
          <p className="text-xl text-brand-100">{module.description}</p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Learning Materials
                </h2>
                {module.contents && module.contents.length > 0 ? (
                  <nav className="space-y-1">
                    {module.contents.map((content, index) => {
                      const contentId = `content-${content.id}`
                      const isActive = activeContentId === contentId
                      return (
                        <button
                          key={content.id}
                          onClick={() => handleContentClick(content.id)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-l-4 border-brand-600 dark:border-brand-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isActive
                                ? 'bg-brand-600 dark:bg-brand-400 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              <span className="text-sm font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                isActive
                                  ? 'text-brand-600 dark:text-brand-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {content.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {content.type === 'video' ? (
                                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {content.type === 'video' ? 'Video' : 'Article'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </nav>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No materials available</p>
                )}

                {/* Progress Info */}
                {user && module.contents && module.contents.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {module.contents.length} materials
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="mt-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-success-700 dark:text-success-300">
                            Module Completed
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz History */}
                {user && module.quiz && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Quiz History
                    </h3>
                    {loadingHistory ? (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600"></div>
                      </div>
                    ) : quizHistory.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {quizHistory.map((attempt) => {
                          const percentage = attempt.percentage
                          const passed = attempt.passed
                          return (
                            <div
                              key={attempt.id}
                              className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {passed ? (
                                    <svg className="w-4 h-4 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                  <span className={`text-xs font-medium ${passed ? 'text-success-700 dark:text-success-300' : 'text-red-700 dark:text-red-300'}`}>
                                    {percentage}%
                                  </span>
                                </div>
                                <Badge
                                  color={passed ? 'success' : 'error'}
                                  variant="light"
                                  size="sm"
                                >
                                  {passed ? 'Pass' : 'Fail'}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {attempt.score} / {attempt.total_questions} correct
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-1">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    passed
                                      ? 'bg-success-600 dark:bg-success-500'
                                      : 'bg-red-600 dark:bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {attempt.completed_at
                                  ? new Date(attempt.completed_at).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : '-'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                        No quiz attempts yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {module.contents && module.contents.length > 0 ? (
              <div className="space-y-6">
                {module.contents.map((content, index) => (
                  <div
                    key={content.id}
                    id={`content-${content.id}`}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 scroll-mt-8 hover:shadow-xl transform hover:-translate-y-1 animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {content.title}
                        </h3>
                        <Badge
                          color={content.type === 'video' ? 'error' : 'info'}
                          variant="light"
                          size="sm"
                          className="mt-1"
                        >
                          {content.type === 'video' ? 'Video' : 'Article'}
                        </Badge>
                      </div>
                    </div>

                    {content.type === 'video' && content.youtube_url && (
                      <div className="mt-4">
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${extractYouTubeId(content.youtube_url)}`}
                            title={content.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}

                    {content.type === 'text' && (
                      <div
                        className="mt-4 prose prose-brand dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No content available for this module.</p>
              </div>
            )}

            {/* Actions */}
            {user && (() => {
              // Check if user has passed quiz based on quiz history
              const hasPassedQuiz = quizHistory.some(attempt => attempt.passed === true)
              const shouldShowMarkComplete = !isCompleted && !hasCertificate && !hasPassedQuiz
              
              return (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                {shouldShowMarkComplete && (
                  <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Complete all materials to unlock the quiz
                    </p>
                    <button
                      onClick={handleComplete}
                      className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all duration-200 font-semibold transform hover:scale-105 active:scale-95"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}

                {isCompleted && module.quiz && !hasCertificate && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Module Completed!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Take the quiz to earn your certificate
                    </p>
                    <button
                      onClick={handleStartQuiz}
                      className="px-6 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-all duration-200 font-semibold transform hover:scale-105 active:scale-95"
                    >
                      Start Quiz
                    </button>
                  </div>
                )}

                {(hasCertificate || hasPassedQuiz) && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Congratulations!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {hasCertificate 
                        ? 'You have earned a certificate for completing this module'
                        : 'You have passed the quiz! Your certificate is ready.'}
                    </p>
                    <Link
                      to={`/modules/${id}/certificate`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 font-semibold transform hover:scale-105 active:scale-95"
                    >
                      View Certificate
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
              )
            })()}

            {/* Ratings & Reviews Section */}
            <div className="mt-8">
              <ModuleRating moduleId={id} />
            </div>

            {!user && (
              <div className="mt-8 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 rounded-xl p-6 shadow-lg border-2 border-brand-200 dark:border-brand-800 text-center">
                <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Login Required
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Please login to access module features, track your progress, take quizzes, and earn certificates.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/login"
                    state={{ returnTo: `/learning-modules/${id}` }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all duration-200 font-semibold transform hover:scale-105 active:scale-95"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    state={{ returnTo: `/learning-modules/${id}` }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 border-2 border-brand-600 dark:border-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-200 font-semibold transform hover:scale-105 active:scale-95"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default ModuleDetailPage
