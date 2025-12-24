import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'

function QuizResults({ result, questions, answers, onRetake, onViewHistory }) {
  const [showDetails, setShowDetails] = useState(false)

  if (!result) return null

  const passed = result.passed
  const detailedResults = result.detailed_results || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className={`bg-gradient-to-r ${passed ? 'from-success-500 to-success-600 dark:from-success-700 dark:to-success-800' : 'from-red-500 to-red-600 dark:from-red-700 dark:to-red-800'} text-white py-12`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`w-20 h-20 ${passed ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6`}>
            {passed ? (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {passed ? 'Congratulations!' : 'Quiz Completed'}
          </h1>
          <p className="text-xl opacity-90">
            {passed ? 'You passed the quiz!' : 'Unfortunately, you did not pass this time.'}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Score Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {result.percentage}%
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your Score
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {result.score} out of {result.total_questions} questions correct
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Score</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {result.score} / {result.total_questions}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Percentage</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {result.percentage}%
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Status</span>
                <Badge color={passed ? 'success' : 'error'} variant="light">
                  {passed ? 'Passed' : 'Failed'}
                </Badge>
              </div>
            </div>

            {passed && (
              <div className="mt-8 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                <p className="text-sm text-success-700 dark:text-success-300 text-center">
                  🎉 Great job! You can now view your certificate.
                </p>
              </div>
            )}
          </div>

          {/* Detailed Results */}
          {detailedResults.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detailed Results
                </h2>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="space-y-6">
                  {detailedResults.map((item, index) => {
                    const isCorrect = item.is_correct
                    const userAnswerKey = `option_${String(item.user_answer || '')}`
                    const correctAnswerKey = `option_${String(item.correct_answer || '')}`
                    const userAnswerText = String(item[userAnswerKey] || '')
                    const correctAnswerText = String(item[correctAnswerKey] || '')

                    return (
                      <div
                        key={item.question_id}
                        className={`p-6 rounded-lg border-2 ${
                          isCorrect
                            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isCorrect
                              ? 'bg-success-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {isCorrect ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Question {index + 1}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                              {String(item.question || '')}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className={`p-3 rounded-lg ${
                            item.user_answer === 'a' 
                              ? (isCorrect ? 'bg-success-100 dark:bg-success-900/40' : 'bg-red-100 dark:bg-red-900/40')
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">A.</span>
                              <span>{String(item.option_a || '')}</span>
                              {item.correct_answer === 'a' && (
                                <Badge color="success" size="sm" variant="light">Correct</Badge>
                              )}
                              {item.user_answer === 'a' && !isCorrect && (
                                <Badge color="error" size="sm" variant="light">Your Answer</Badge>
                              )}
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg ${
                            item.user_answer === 'b' 
                              ? (isCorrect ? 'bg-success-100 dark:bg-success-900/40' : 'bg-red-100 dark:bg-red-900/40')
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">B.</span>
                              <span>{String(item.option_b || '')}</span>
                              {item.correct_answer === 'b' && (
                                <Badge color="success" size="sm" variant="light">Correct</Badge>
                              )}
                              {item.user_answer === 'b' && !isCorrect && (
                                <Badge color="error" size="sm" variant="light">Your Answer</Badge>
                              )}
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg ${
                            item.user_answer === 'c' 
                              ? (isCorrect ? 'bg-success-100 dark:bg-success-900/40' : 'bg-red-100 dark:bg-red-900/40')
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">C.</span>
                              <span>{String(item.option_c || '')}</span>
                              {item.correct_answer === 'c' && (
                                <Badge color="success" size="sm" variant="light">Correct</Badge>
                              )}
                              {item.user_answer === 'c' && !isCorrect && (
                                <Badge color="error" size="sm" variant="light">Your Answer</Badge>
                              )}
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg ${
                            item.user_answer === 'd' 
                              ? (isCorrect ? 'bg-success-100 dark:bg-success-900/40' : 'bg-red-100 dark:bg-red-900/40')
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">D.</span>
                              <span>{String(item.option_d || '')}</span>
                              {item.correct_answer === 'd' && (
                                <Badge color="success" size="sm" variant="light">Correct</Badge>
                              )}
                              {item.user_answer === 'd' && !isCorrect && (
                                <Badge color="error" size="sm" variant="light">Your Answer</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {item.explanation && item.explanation.trim() && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">Explanation:</p>
                                <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{String(item.explanation || '')}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {passed && (
              <button
                onClick={() => window.location.href = `/modules/${result.module_id || ''}/certificate`}
                className="flex-1 px-6 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors font-semibold"
              >
                View Certificate
              </button>
            )}
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View Quiz History
              </button>
            )}
            {onRetake && (
              <button
                onClick={onRetake}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Retake Quiz
              </button>
            )}
            <Link
              to={`/learning-modules/${result.module_id || ''}`}
              state={{ refresh: true }}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-center"
            >
              Back to Module
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default QuizResults

