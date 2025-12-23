import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useModal } from '../contexts/ModalContext'
import Badge from '../components/ui/Badge'

function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showAlert, showValidation } = useModal()
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchQuiz()
  }, [id])

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/modules/${id}/quiz`)
      setQuestions(response.data.questions)
    } catch (error) {
      console.error('Error fetching quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (Object.keys(answers).length !== questions.length) {
      showAlert({
        type: 'warning',
        title: 'Incomplete Quiz',
        message: 'Please answer all questions before submitting',
      })
      return
    }

    setSubmitting(true)

    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: parseInt(questionId),
      answer,
    }))

    try {
      const response = await api.post(`/modules/${id}/quiz/submit`, {
        answers: answersArray,
      })
      setResult(response.data)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      if (error.response?.status === 422) {
        showValidation({
          title: 'Validation Error',
          error,
        })
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Failed to submit quiz',
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (result) {
    const passed = result.passed
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
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
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

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {passed && (
                  <button
                    onClick={() => navigate(`/modules/${id}/certificate`)}
                    className="flex-1 px-6 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors font-semibold"
                  >
                    View Certificate
                  </button>
                )}
                <Link
                  to={`/learning-modules/${id}`}
                  state={{ refresh: true }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-center"
                >
                  Back to Module
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-brand-500 to-brand-600 dark:from-brand-700 dark:to-brand-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={`/learning-modules/${id}`}
            className="inline-flex items-center gap-2 text-brand-100 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Module
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Module Quiz</h1>
          <p className="text-xl text-brand-100">
            Answer all {questions.length} questions. You need 70% to pass.
          </p>
        </div>
      </section>

      {/* Quiz Form */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                    {question.question}
                  </h3>
                </div>

                <div className="space-y-3 ml-14">
                  {['a', 'b', 'c', 'd'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        answers[question.id] === option
                          ? 'bg-brand-50 dark:bg-brand-900/20 border-2 border-brand-500 dark:border-brand-400'
                          : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleAnswerChange(question.id, option)}
                        className="w-5 h-5 text-brand-600 focus:ring-brand-500 focus:ring-2"
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">
                        {option.toUpperCase()}.
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {question[`option_${option}`]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Answered: {Object.keys(answers).length} / {questions.length}
                </p>
                {Object.keys(answers).length === questions.length && (
                  <Badge color="success" variant="light" size="sm">
                    All questions answered
                  </Badge>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting || Object.keys(answers).length !== questions.length}
                className="w-full px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Quiz
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default QuizPage
