import { useState } from 'react'
import Badge from '../ui/Badge'

function AchievementBadge({ achievement, showProgress = false }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <div
        className={`relative w-20 h-20 rounded-xl flex items-center justify-center text-3xl cursor-pointer transition-all duration-200 ${
          achievement.unlocked
            ? 'bg-gradient-to-br opacity-100 shadow-lg hover:scale-110'
            : 'bg-gray-200 dark:bg-gray-700 opacity-50 grayscale'
        }`}
        style={achievement.unlocked ? {
          background: `linear-gradient(135deg, ${achievement.color}15, ${achievement.color}30)`,
          border: `2px solid ${achievement.color}`,
        } : {}}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span>{achievement.icon}</span>
        {achievement.unlocked && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-xl">
          <div className="font-semibold mb-1">{achievement.name}</div>
          <div className="text-gray-300 text-xs mb-2">{achievement.description}</div>
          {showProgress && !achievement.unlocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{achievement.progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${achievement.progress}%`,
                    backgroundColor: achievement.color,
                  }}
                />
              </div>
            </div>
          )}
          {achievement.unlocked && achievement.unlocked_at && (
            <div className="text-xs text-gray-400 mt-2">
              Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
            </div>
          )}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AchievementBadge

