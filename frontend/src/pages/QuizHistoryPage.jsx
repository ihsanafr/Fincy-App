/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useModal } from '../contexts/ModalContext'
import Badge from '../components/ui/Badge'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../hooks/useBreadcrumbs'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

function QuizHistoryPage() {
  const [searchParams] = useSearchParams()
  const moduleId = searchParams.get('module')
  const navigate = useNavigate()
  const { showAlert } = useModal()
  const breadcrumbs = useBreadcrumbs()
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAttempt, setSelectedAttempt] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [moduleId])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const endpoint = moduleId 
        ? `/modules/${moduleId}/quiz/history`
        : '/quiz/history'
      const response = await api.get(endpoint)
      setAttempts(response.data)
    } catch (error) {
      console.error('Error fetching quiz history:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load quiz history',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAttemptDetails = async (attemptId) => {
    if (selectedAttempt?.id === attemptId && selectedAttempt.detailed_results) {
      setSelectedAttempt(null)
      return
    }

    setLoadingDetails(true)
    try {
      const response = await api.get(`/quiz/attempts/${attemptId}`)
      setSelectedAttempt(response.data)
    } catch (error) {
      console.error('Error fetching attempt details:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load attempt details',
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton count={5} height={120} className="mb-4" />
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
            Quiz History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your past quiz attempts and detailed results
          </p>
        </div>

        {attempts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No Quiz History"
            message="You haven't taken any quizzes yet. Start learning to see your quiz history here."
          >
            <Link
              to="/learning-modules"
              className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold inline-block"
            >
              Browse Modules
            </Link>
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {attempt.module_title || 'Module Quiz'}
                      </h3>
                      {attempt.module_category && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {attempt.module_category}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {attempt.percentage}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {attempt.score} / {attempt.total_questions}
                        </div>
                      </div>
                      <Badge
                        color={attempt.passed ? 'success' : 'error'}
                        variant="light"
                      >
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>
                      {new Date(attempt.completed_at).toLocaleString('id-ID', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </span>
                    <button
                      onClick={() => fetchAttemptDetails(attempt.id)}
                      className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium flex items-center gap-1"
                      disabled={loadingDetails}
                    >
                      {selectedAttempt?.id === attempt.id && selectedAttempt.detailed_results
                        ? 'Hide Details'
                        : 'View Details'}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          selectedAttempt?.id === attempt.id && selectedAttempt.detailed_results
                            ? 'rotate-180'
                            : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {loadingDetails && selectedAttempt?.id === attempt.id && (
                    <div className="py-4">
                      <Skeleton count={1} height={40} />
                    </div>
                  )}

                  {selectedAttempt?.id === attempt.id &&
                    selectedAttempt.detailed_results && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                          Detailed Results
                        </h4>
                        <div className="space-y-4">
                          {selectedAttempt.detailed_results.map((item, index) => {
                            const isCorrect = item.is_correct

                            return (
                              <div
                                key={item.question_id}
                                className={`p-4 rounded-lg border-2 ${
                                  isCorrect
                                    ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                      isCorrect
                                        ? 'bg-success-500 text-white'
                                        : 'bg-red-500 text-white'
                                    }`}
                                  >
                                    {isCorrect ? (
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                                      Question {index + 1}
                                    </h5>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                      {item.question}
                                    </p>
                                    <div className="space-y-1">
                                      {['a', 'b', 'c', 'd'].map((option) => {
                                        const optionKey = `option_${option}`
                                        const isUserAnswer = item.user_answer === option
                                        const isCorrectAnswer = item.correct_answer === option

                                        return (
                                          <div
                                            key={option}
                                            className={`p-2 rounded text-sm ${
                                              isUserAnswer
                                                ? isCorrect
                                                  ? 'bg-success-100 dark:bg-success-900/40'
                                                  : 'bg-red-100 dark:bg-red-900/40'
                                                : isCorrectAnswer
                                                ? 'bg-green-50 dark:bg-green-900/20'
                                                : 'bg-gray-100 dark:bg-gray-700'
                                            }`}
                                          >
                                            <span className="font-medium">
                                              {option.toUpperCase()}.
                                            </span>{' '}
                                            {item[optionKey]}
                                            {isCorrectAnswer && (
                                              <Badge
                                                color="success"
                                                size="sm"
                                                variant="light"
                                                className="ml-2"
                                              >
                                                Correct
                                              </Badge>
                                            )}
                                            {isUserAnswer && !isCorrect && (
                                              <Badge
                                                color="error"
                                                size="sm"
                                                variant="light"
                                                className="ml-2"
                                              >
                                                Your Answer
                                              </Badge>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                    {item.explanation && (
                                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                                          Explanation:
                                        </p>
                                        <p className="text-xs text-blue-800 dark:text-blue-300">
                                          {item.explanation}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizHistoryPage
