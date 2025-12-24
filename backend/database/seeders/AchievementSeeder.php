<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Achievement;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            // Module Achievements
            [
                'code' => 'first_module',
                'name' => 'First Steps',
                'description' => 'Complete your first learning module',
                'icon' => '🎯',
                'color' => '#10b981',
                'type' => 'module',
                'requirement' => 1,
                'points' => 10,
            ],
            [
                'code' => 'five_modules',
                'name' => 'Knowledge Seeker',
                'description' => 'Complete 5 learning modules',
                'icon' => '📚',
                'color' => '#3b82f6',
                'type' => 'module',
                'requirement' => 5,
                'points' => 50,
            ],
            [
                'code' => 'ten_modules',
                'name' => 'Learning Master',
                'description' => 'Complete 10 learning modules',
                'icon' => '🎓',
                'color' => '#8b5cf6',
                'type' => 'module',
                'requirement' => 10,
                'points' => 100,
            ],
            [
                'code' => 'twenty_modules',
                'name' => 'Expert Learner',
                'description' => 'Complete 20 learning modules',
                'icon' => '👑',
                'color' => '#f59e0b',
                'type' => 'module',
                'requirement' => 20,
                'points' => 200,
            ],

            // Quiz Achievements
            [
                'code' => 'first_quiz',
                'name' => 'Quiz Taker',
                'description' => 'Complete your first quiz',
                'icon' => '✏️',
                'color' => '#10b981',
                'type' => 'quiz',
                'requirement' => 1,
                'points' => 10,
            ],
            [
                'code' => 'perfect_score',
                'name' => 'Perfect Score',
                'description' => 'Get 100% on a quiz',
                'icon' => '💯',
                'color' => '#ef4444',
                'type' => 'quiz',
                'requirement' => 1,
                'points' => 50,
            ],
            [
                'code' => 'five_perfect',
                'name' => 'Perfectionist',
                'description' => 'Get 100% on 5 quizzes',
                'icon' => '⭐',
                'color' => '#f59e0b',
                'type' => 'quiz',
                'requirement' => 5,
                'points' => 250,
            ],

            // Streak Achievements
            [
                'code' => 'three_day_streak',
                'name' => 'On Fire',
                'description' => 'Maintain a 3-day learning streak',
                'icon' => '🔥',
                'color' => '#ef4444',
                'type' => 'streak',
                'requirement' => 3,
                'points' => 30,
            ],
            [
                'code' => 'week_streak',
                'name' => 'Week Warrior',
                'description' => 'Maintain a 7-day learning streak',
                'icon' => '🔥',
                'color' => '#f59e0b',
                'type' => 'streak',
                'requirement' => 7,
                'points' => 70,
            ],
            [
                'code' => 'month_streak',
                'name' => 'Streak Master',
                'description' => 'Maintain a 30-day learning streak',
                'icon' => '🔥',
                'color' => '#8b5cf6',
                'type' => 'streak',
                'requirement' => 30,
                'points' => 300,
            ],

            // Certificate Achievements
            [
                'code' => 'first_certificate',
                'name' => 'Certified',
                'description' => 'Earn your first certificate',
                'icon' => '🏆',
                'color' => '#10b981',
                'type' => 'certificate',
                'requirement' => 1,
                'points' => 25,
            ],
            [
                'code' => 'five_certificates',
                'name' => 'Certified Expert',
                'description' => 'Earn 5 certificates',
                'icon' => '🏆',
                'color' => '#3b82f6',
                'type' => 'certificate',
                'requirement' => 5,
                'points' => 125,
            ],
            [
                'code' => 'ten_certificates',
                'name' => 'Master Certified',
                'description' => 'Earn 10 certificates',
                'icon' => '👑',
                'color' => '#f59e0b',
                'type' => 'certificate',
                'requirement' => 10,
                'points' => 250,
            ],

            // Special Achievements
            [
                'code' => 'early_adopter',
                'name' => 'Early Adopter',
                'description' => 'Join Fincy in the early days',
                'icon' => '🌟',
                'color' => '#8b5cf6',
                'type' => 'special',
                'requirement' => 1,
                'points' => 100,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['code' => $achievement['code']],
                $achievement
            );
        }
    }
}
