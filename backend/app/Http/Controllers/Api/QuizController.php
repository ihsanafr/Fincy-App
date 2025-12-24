<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAnswer;
use App\Models\Certificate;
use App\Models\ModuleProgress;
use App\Http\Controllers\Api\AchievementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    public function getQuiz($moduleId)
    {
        $module = Module::with(['quiz.questions' => function($query) {
            $query->orderBy('order');
        }])->findOrFail($moduleId);

        if (!$module->quiz) {
            return response()->json(['message' => 'Quiz not found for this module'], 404);
        }

        // Sanitize strings to prevent JSON encoding issues
        $sanitizeString = function($str) {
            if ($str === null || $str === false) return '';
            // Convert to string and remove problematic characters
            $str = (string)$str;
            // Remove null bytes
            $str = str_replace("\0", '', $str);
            // Remove control characters except newlines and tabs
            $str = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $str);
            // Ensure valid UTF-8
            if (!mb_check_encoding($str, 'UTF-8')) {
                $str = mb_convert_encoding($str, 'UTF-8', 'UTF-8');
            }
            return $str;
        };
        
        // Return questions without correct answers
        $questions = $module->quiz->questions->map(function($question) use ($sanitizeString) {
            return [
                'id' => (int)$question->id,
                'question' => $sanitizeString($question->question ?? ''),
                'option_a' => $sanitizeString($question->option_a ?? ''),
                'option_b' => $sanitizeString($question->option_b ?? ''),
                'option_c' => $sanitizeString($question->option_c ?? ''),
                'option_d' => $sanitizeString($question->option_d ?? ''),
            ];
        });

        return response()->json([
            'quiz_id' => $module->quiz->id,
            'questions' => $questions,
        ]);
    }

    public function submitQuiz(Request $request, $moduleId)
    {
        $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:quiz_questions,id',
            'answers.*.answer' => 'required|in:a,b,c,d',
        ]);

        $user = Auth::user();
        $module = Module::with('quiz.questions')->findOrFail($moduleId);

        if (!$module->quiz) {
            return response()->json(['message' => 'Quiz not found'], 404);
        }

        $questions = $module->quiz->questions;
        $totalQuestions = $questions->count();
        $score = 0;

        DB::beginTransaction();
        try {
            $attempt = QuizAttempt::create([
                'user_id' => $user->id,
                'quiz_id' => $module->quiz->id,
                'total_questions' => $totalQuestions,
                'completed_at' => now(),
            ]);

            foreach ($request->answers as $answerData) {
                $question = $questions->find($answerData['question_id']);
                if (!$question) continue;

                $isCorrect = $question->isCorrect($answerData['answer']);
                if ($isCorrect) {
                    $score++;
                }

                QuizAnswer::create([
                    'quiz_attempt_id' => $attempt->id,
                    'quiz_question_id' => $question->id,
                    'answer' => $answerData['answer'],
                    'is_correct' => $isCorrect,
                ]);
            }

            // Pass if score >= 70% (14 out of 20)
            $passed = $score >= ($totalQuestions * 0.7);

            $attempt->update([
                'score' => $score,
                'passed' => $passed,
            ]);

            // Generate certificate if passed
            if ($passed) {
                $certificate = Certificate::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'module_id' => $module->id,
                    ],
                    [
                        'certificate_number' => Certificate::generateCertificateNumber(),
                        'issued_at' => now(),
                        'public_share_token' => Certificate::generateShareToken(),
                        'is_public' => true, // Sertifikat selalu public
                    ]
                );
                
                // Pastikan sertifikat yang sudah ada juga public dan punya token
                if (!$certificate->is_public || !$certificate->public_share_token) {
                    $certificate->is_public = true;
                    if (!$certificate->public_share_token) {
                        $certificate->public_share_token = Certificate::generateShareToken();
                    }
                    $certificate->save();
                }

                // Mark module as completed when quiz is passed
                $progress = ModuleProgress::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'module_id' => $module->id,
                    ],
                    [
                        'completed_at' => now(),
                    ]
                );
            }

            DB::commit();

            // Get detailed results with explanations
            $detailedResults = [];
            foreach ($request->answers as $answerData) {
                $question = $questions->find($answerData['question_id']);
                if (!$question) continue;

                $isCorrect = $question->isCorrect($answerData['answer']);
                
                // Sanitize strings to prevent JSON encoding issues
                $sanitizeString = function($str) {
                    if ($str === null || $str === false) return '';
                    // Convert to string and remove problematic characters
                    $str = (string)$str;
                    // Remove null bytes
                    $str = str_replace("\0", '', $str);
                    // Remove control characters except newlines and tabs
                    $str = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $str);
                    // Ensure valid UTF-8
                    if (!mb_check_encoding($str, 'UTF-8')) {
                        $str = mb_convert_encoding($str, 'UTF-8', 'UTF-8');
                    }
                    return $str;
                };
                
                $detailedResults[] = [
                    'question_id' => (int)$question->id,
                    'question' => $sanitizeString($question->question ?? ''),
                    'option_a' => $sanitizeString($question->option_a ?? ''),
                    'option_b' => $sanitizeString($question->option_b ?? ''),
                    'option_c' => $sanitizeString($question->option_c ?? ''),
                    'option_d' => $sanitizeString($question->option_d ?? ''),
                    'correct_answer' => $sanitizeString($question->correct_answer ?? ''),
                    'user_answer' => $sanitizeString($answerData['answer'] ?? ''),
                    'is_correct' => (bool)$isCorrect,
                    'explanation' => $sanitizeString($question->explanation ?? ''),
                ];
            }

            // Update learning streak and check achievements (outside transaction, don't fail quiz if this fails)
            if ($passed) {
                try {
                    $achievementController = new AchievementController();
                    $achievementController->updateLearningStreak();
                    $achievementController->checkAndUnlockAchievements();
                } catch (\Exception $e) {
                    // Log error but don't fail the quiz submission
                    \Log::error('Failed to update achievements after quiz submission: ' . $e->getMessage());
                }
            }

            // Ensure all data is JSON-safe
            $responseData = [
                'score' => (int)$score,
                'total_questions' => (int)$totalQuestions,
                'percentage' => round(($score / $totalQuestions) * 100, 2),
                'passed' => (bool)$passed,
                'certificate' => $passed ? $certificate : null,
                'attempt_id' => (int)$attempt->id,
                'detailed_results' => $detailedResults,
            ];
            
            // Validate JSON encoding before sending
            $jsonTest = json_encode($responseData);
            if ($jsonTest === false) {
                \Log::error('JSON encoding failed: ' . json_last_error_msg());
                \Log::error('Data: ' . print_r($responseData, true));
                return response()->json([
                    'message' => 'Error processing quiz results',
                    'error' => 'Data encoding error'
                ], 500);
            }
            
            return response()->json($responseData);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Quiz submission failed: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to submit quiz',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function getCertificate($moduleId)
    {
        $user = Auth::user();
        $module = Module::findOrFail($moduleId);

        $certificate = Certificate::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->first();

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        // Generate public link if token doesn't exist
        if (!$certificate->public_share_token) {
            $certificate->public_share_token = Certificate::generateShareToken();
            $certificate->save();
        }

        // Pastikan sertifikat public dan punya token
        if (!$certificate->is_public || !$certificate->public_share_token) {
            $certificate->is_public = true;
            if (!$certificate->public_share_token) {
                $certificate->public_share_token = Certificate::generateShareToken();
            }
            $certificate->save();
        }
        
        return response()->json([
            'certificate' => $certificate,
            'module' => $module,
            'user' => $user,
            'public_link' => $certificate->generatePublicLink(),
        ]);
    }

    public function getQuizHistory()
    {
        $user = Auth::user();
        
        $attempts = QuizAttempt::with(['quiz.module'])
            ->where('user_id', $user->id)
            ->orderBy('completed_at', 'desc')
            ->get()
            ->map(function($attempt) {
                $percentage = $attempt->total_questions > 0 
                    ? round(($attempt->score / $attempt->total_questions) * 100, 2) 
                    : 0;
                
                return [
                    'id' => $attempt->id,
                    'module_id' => $attempt->quiz->module_id,
                    'module_title' => $attempt->quiz->module->title,
                    'module_category' => $attempt->quiz->module->category,
                    'score' => $attempt->score,
                    'total_questions' => $attempt->total_questions,
                    'percentage' => $percentage,
                    'passed' => $attempt->passed,
                    'completed_at' => $attempt->completed_at,
                    'created_at' => $attempt->created_at,
                ];
            });

        return response()->json($attempts);
    }

    public function getModuleQuizHistory($moduleId)
    {
        $user = Auth::user();
        $module = Module::with('quiz')->findOrFail($moduleId);

        if (!$module->quiz) {
            return response()->json([]);
        }

        $attempts = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $module->quiz->id)
            ->orderBy('completed_at', 'desc')
            ->get()
            ->map(function($attempt) {
                $percentage = $attempt->total_questions > 0 
                    ? round(($attempt->score / $attempt->total_questions) * 100, 2) 
                    : 0;
                
                return [
                    'id' => $attempt->id,
                    'score' => $attempt->score,
                    'total_questions' => $attempt->total_questions,
                    'percentage' => $percentage,
                    'passed' => $attempt->passed,
                    'completed_at' => $attempt->completed_at,
                    'created_at' => $attempt->created_at,
                ];
            });

        return response()->json($attempts);
    }

    public function togglePublicShare($moduleId)
    {
        $user = Auth::user();
        $certificate = Certificate::where('user_id', $user->id)
            ->where('module_id', $moduleId)
            ->firstOrFail();

        $certificate->is_public = !$certificate->is_public;
        
        // Generate token if making public and token doesn't exist
        if ($certificate->is_public && !$certificate->public_share_token) {
            $certificate->public_share_token = Certificate::generateShareToken();
        }
        
        $certificate->save();

        return response()->json([
            'is_public' => $certificate->is_public,
            'public_link' => $certificate->is_public ? $certificate->generatePublicLink() : null,
        ]);
    }

    public function getPublicCertificate($token)
    {
        $certificate = Certificate::where('public_share_token', $token)
            ->where('is_public', true)
            ->with(['user', 'module'])
            ->first();

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found or not publicly shared'], 404);
        }

        // Format user data with full profile photo URL
        $user = $certificate->user;
        $userData = $user->toArray();
        if ($user->profile_photo) {
            $userData['profile_photo'] = asset('storage/' . $user->profile_photo);
        } else {
            $userData['profile_photo'] = null;
        }

        return response()->json([
            'certificate' => $certificate,
            'module' => $certificate->module,
            'user' => $userData,
        ]);
    }
}

