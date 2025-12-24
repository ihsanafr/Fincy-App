import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import AchievementBadge from './AchievementBadge'
import Skeleton from '../ui/Skeleton'

function AchievementsList({ userId = null }) {
  const [achievements, setAchievements] = useState([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [learningStreak, setLearningStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchAchievements()
  }, [userId])

  const fetchAchievements = async () => {
    setLoading(true)
    try {
      const response = await api.get('/achievements')
      setAchievements(response.data.achievements || [])
      setTotalPoints(response.data.total_points || 0)
      setLearningStreak(response.data.learning_streak || 0)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton count={3} height={100} />
      </div>
    )
  }

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.type]) {
      acc[achievement.type] = []
    }
    acc[achievement.type].push(achievement)
    return acc
  }, {})

  const typeLabels = {
    module: 'Module Achievements',
    quiz: 'Quiz Achievements',
    streak: 'Streak Achievements',
    certificate: 'Certificate Achievements',
    special: 'Special Achievements',
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Points</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                {totalPoints}
              </p>
            </div>
            <div className="w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center text-2xl">
              ⭐
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Learning Streak</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                {learningStreak} {learningStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="w-16 h-16 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center text-2xl">
              🔥
            </div>
          </div>
        </div>
      </div>

      {/* Achievements by Type */}
      {Object.keys(groupedAchievements).map((type) => (
        <div key={type} className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {typeLabels[type] || type}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {groupedAchievements[type].map((achievement) => (
              <div key={achievement.id} className="text-center">
                <AchievementBadge achievement={achievement} showProgress={!achievement.unlocked} />
                <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-2">
                  {achievement.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AchievementsList

