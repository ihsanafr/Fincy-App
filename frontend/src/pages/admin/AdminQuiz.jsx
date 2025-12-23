import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'

function AdminQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showAlert, showValidation } = useModal()
  const [module, setModule] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionCount, setQuestionCount] = useState(20)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchModule()
  }, [id])

  const fetchModule = async () => {
    try {
      const response = await api.get(`/admin/modules/${id}`)
      setModule(response.data)
      if (response.data.quiz?.questions) {
        setQuestions(response.data.quiz.questions)
        setQuestionCount(response.data.quiz.questions.length || 20)
      } else {
        // Initialize with empty questions
        initializeQuestions(20)
      }
    } catch (error) {
      console.error('Error fetching module:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeQuestions = (count) => {
    const newQuestions = Array.from({ length: count }, (_, index) => ({
      id: null,
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a',
      order: index,
    }))
    setQuestions(newQuestions)
  }

  const handleQuestionCountChange = (e) => {
    const count = parseInt(e.target.value) || 1
    setQuestionCount(count)
    
    if (count > questions.length) {
      // Add new empty questions
      const newQuestions = Array.from({ length: count - questions.length }, (_, index) => ({
        id: null,
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'a',
        order: questions.length + index,
      }))
      setQuestions([...questions, ...newQuestions])
    } else if (count < questions.length) {
      // Remove questions from the end
      setQuestions(questions.slice(0, count))
    }
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    }
    setQuestions(updatedQuestions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all questions are filled
    const incompleteQuestions = questions.filter(
      (q) => !q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d
    )
    
    if (incompleteQuestions.length > 0) {
      showAlert({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all questions and options',
      })
      return
    }

    setSaving(true)

    try {
      await api.put(`/admin/modules/${id}/quiz`, {
        questions: questions.map((q, index) => ({
          id: q.id,
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          order: index,
        })),
      })
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Quiz saved successfully!',
        onConfirm: () => navigate('/admin/modules'),
      })
    } catch (error) {
      console.error('Error saving quiz:', error)
      if (error.response?.status === 422) {
        showValidation({
          title: 'Validation Error',
          error,
        })
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Failed to save quiz',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/modules')}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modules
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Manage Quiz</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Module: {module?.title}
        </p>
      </div>

      {/* Quiz Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={questionCount}
              onChange={handleQuestionCountChange}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set the number of quiz questions. You can add or remove questions dynamically.
          </p>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Question {index + 1}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question *
                  </label>
                  <textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your question here..."
                  />
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['a', 'b', 'c', 'd'].map((option) => (
                    <div key={option}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Option {option.toUpperCase()} *
                      </label>
                      <input
                        type="text"
                        value={question[`option_${option}`]}
                        onChange={(e) => handleQuestionChange(index, `option_${option}`, e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Option ${option.toUpperCase()}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correct Answer *
                  </label>
                  <select
                    value={question.correct_answer}
                    onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/modules')}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save Quiz'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminQuiz

