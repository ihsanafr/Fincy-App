<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Models\ModuleProgress;
use App\Models\QuizAttempt;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AchievementController extends Controller
{
    public function getUserAchievements()
    {
        $user = Auth::user();

        $achievements = Achievement::where('is_active', true)
            ->with(['users' => function($query) use ($user) {
                $query->where('users.id', $user->id);
            }])
            ->get()
            ->map(function($achievement) use ($user) {
                $unlocked = $achievement->users->isNotEmpty();
                $unlockedAt = $unlocked ? $achievement->users->first()->pivot->unlocked_at : null;
                
                return [
                    'id' => $achievement->id,
                    'code' => $achievement->code,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'color' => $achievement->color,
                    'type' => $achievement->type,
                    'requirement' => $achievement->requirement,
                    'points' => $achievement->points,
                    'unlocked' => $unlocked,
                    'unlocked_at' => $unlockedAt,
                    'progress' => $this->calculateProgress($user, $achievement),
                ];
            });

        return response()->json([
            'achievements' => $achievements,
            'total_points' => $user->total_points ?? 0,
            'learning_streak' => $user->learning_streak ?? 0,
        ]);
    }

    private function calculateProgress($user, $achievement)
    {
        switch ($achievement->type) {
            case 'module':
                $completed = ModuleProgress::where('user_id', $user->id)
                    ->whereNotNull('completed_at')
                    ->count();
                return min(100, ($completed / $achievement->requirement) * 100);
            
            case 'quiz':
                if ($achievement->code === 'perfect_score') {
                    $perfectScores = QuizAttempt::where('user_id', $user->id)
                        ->whereRaw('score = total_questions')
                        ->count();
                    return min(100, ($perfectScores / $achievement->requirement) * 100);
                } else {
                    $completed = QuizAttempt::where('user_id', $user->id)
                        ->where('passed', true)
                        ->count();
                    return min(100, ($completed / $achievement->requirement) * 100);
                }
            
            case 'streak':
                $currentStreak = $user->learning_streak ?? 0;
                return min(100, ($currentStreak / $achievement->requirement) * 100);
            
            case 'certificate':
                $certificates = Certificate::where('user_id', $user->id)->count();
                return min(100, ($certificates / $achievement->requirement) * 100);
            
            default:
                return 0;
        }
    }

    public function checkAndUnlockAchievements()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return;
            }

            $unlockedAchievements = [];
            $achievements = Achievement::where('is_active', true)->get();

            foreach ($achievements as $achievement) {
                // Skip if already unlocked
                if ($user->achievements()->where('achievements.id', $achievement->id)->exists()) {
                    continue;
                }

                $unlocked = false;

                switch ($achievement->type) {
                    case 'module':
                        $completed = ModuleProgress::where('user_id', $user->id)
                            ->whereNotNull('completed_at')
                            ->count();
                        $unlocked = $completed >= $achievement->requirement;
                        break;

                    case 'quiz':
                        if ($achievement->code === 'perfect_score') {
                            $perfectScores = QuizAttempt::where('user_id', $user->id)
                                ->whereRaw('score = total_questions')
                                ->count();
                            $unlocked = $perfectScores >= $achievement->requirement;
                        } else {
                            $completed = QuizAttempt::where('user_id', $user->id)
                                ->where('passed', true)
                                ->count();
                            $unlocked = $completed >= $achievement->requirement;
                        }
                        break;

                    case 'streak':
                        $currentStreak = $user->learning_streak ?? 0;
                        $unlocked = $currentStreak >= $achievement->requirement;
                        break;

                    case 'certificate':
                        $certificates = Certificate::where('user_id', $user->id)->count();
                        $unlocked = $certificates >= $achievement->requirement;
                        break;

                    case 'special':
                        // Special achievements are manually unlocked
                        break;
                }

                if ($unlocked) {
                    try {
                        $user->achievements()->attach($achievement->id, [
                            'unlocked_at' => now(),
                        ]);

                        // Add points
                        $user->increment('total_points', $achievement->points);

                        $unlockedAchievements[] = $achievement;
                    } catch (\Exception $e) {
                        Log::error('Failed to unlock achievement: ' . $e->getMessage());
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to check and unlock achievements: ' . $e->getMessage());
        }
    }

    public function updateLearningStreak()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return;
            }

            $today = Carbon::today();
            $yesterday = Carbon::yesterday();

            // Check if user has activity today
            $hasActivityToday = ModuleProgress::where('user_id', $user->id)
                ->whereDate('completed_at', $today)
                ->exists() || 
                QuizAttempt::where('user_id', $user->id)
                ->whereDate('completed_at', $today)
                ->exists();

            if (!$hasActivityToday) {
                return;
            }

            $lastActivityDate = $user->last_activity_date 
                ? Carbon::parse($user->last_activity_date) 
                : null;

            $newStreak = 1;

            if ($lastActivityDate) {
                if ($lastActivityDate->isSameDay($yesterday)) {
                    // Continue streak
                    $newStreak = ($user->learning_streak ?? 0) + 1;
                } elseif ($lastActivityDate->isSameDay($today)) {
                    // Already updated today
                    $newStreak = $user->learning_streak ?? 0;
                } else {
                    // Streak broken, start over
                    $newStreak = 1;
                }
            }

            $user->update([
                'learning_streak' => $newStreak,
                'last_activity_date' => $today,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update learning streak: ' . $e->getMessage());
        }
    }
}
