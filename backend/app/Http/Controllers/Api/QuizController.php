<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAnswer;
use App\Models\Certificate;
use App\Models\ModuleProgress;
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

        // Return questions without correct answers
        $questions = $module->quiz->questions->map(function($question) {
            return [
                'id' => $question->id,
                'question' => $question->question,
                'option_a' => $question->option_a,
                'option_b' => $question->option_b,
                'option_c' => $question->option_c,
                'option_d' => $question->option_d,
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
                    ]
                );

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

            return response()->json([
                'score' => $score,
                'total_questions' => $totalQuestions,
                'percentage' => round(($score / $totalQuestions) * 100, 2),
                'passed' => $passed,
                'certificate' => $passed ? $certificate : null,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to submit quiz'], 500);
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

        return response()->json([
            'certificate' => $certificate,
            'module' => $module,
            'user' => $user,
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
}

