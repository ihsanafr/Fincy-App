import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Badge from '../components/ui/Badge'

function QuizHistoryPage() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizHistory()
  }, [])

  const fetchQuizHistory = async () => {
    try {
      const response = await api.get('/quiz/history')
      setAttempts(response.data)
    } catch (error) {
      console.error('Error fetching quiz history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading quiz history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-brand-500 to-brand-600 dark:from-brand-700 dark:to-brand-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Quiz History</h1>
          <p className="text-xl text-brand-100">
            View all your quiz attempts and results
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {attempts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No quiz attempts yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Complete a module and take the quiz to see your results here
              </p>
              <Link
                to="/learning-modules"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold"
              >
                Browse Learning Modules
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left Section - Module Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          attempt.passed
                            ? 'bg-success-100 dark:bg-success-900/20'
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          {attempt.passed ? (
                            <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {attempt.module_title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge color="info" variant="light" size="sm">
                              {attempt.module_category || 'General'}
                            </Badge>
                            <Badge
                              color={attempt.passed ? 'success' : 'error'}
                              variant="light"
                              size="sm"
                            >
                              {attempt.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Completed on {formatDate(attempt.completed_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Score Info */}
                    <div className="flex items-center gap-6 md:flex-col md:items-end">
                      <div className="text-center md:text-right">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {attempt.percentage}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {attempt.score} / {attempt.total_questions} correct
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {attempt.passed && (
                          <Link
                            to={`/modules/${attempt.module_id}/certificate`}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-sm text-center"
                          >
                            View Certificate
                          </Link>
                        )}
                        <Link
                          to={`/learning-modules/${attempt.module_id}`}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm text-center"
                        >
                          View Module
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Score</span>
                      <span>{attempt.score} / {attempt.total_questions}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          attempt.passed
                            ? 'bg-success-600 dark:bg-success-500'
                            : 'bg-red-600 dark:bg-red-500'
                        }`}
                        style={{ width: `${attempt.percentage}%` }}
                      ></div>
                    </div>
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

export default QuizHistoryPage

