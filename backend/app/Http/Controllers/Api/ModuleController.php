<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleContent;
use App\Models\ModuleProgress;
use App\Models\Certificate;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModuleController extends Controller
{
    /**
     * Format module with thumbnail URL
     */
    private function formatModule($module)
    {
        $moduleArray = $module->toArray();
        if ($module->thumbnail) {
            $moduleArray['thumbnail_url'] = asset('storage/' . $module->thumbnail);
        }
        return $moduleArray;
    }

    public function index()
    {
        $modules = Module::where('is_active', true)
            ->with(['contents' => function($query) {
                $query->orderBy('order');
            }])
            ->orderBy('order')
            ->get();

        $formattedModules = $modules->map(function($module) {
            return $this->formatModule($module);
        });

        return response()->json($formattedModules);
    }

    public function show($id)
    {
        $module = Module::with(['contents' => function($query) {
            $query->orderBy('order');
        }, 'quiz.questions' => function($query) {
            $query->orderBy('order');
        }])->findOrFail($id);

        $user = Auth::user();
        $progress = null;
        $isCompleted = false;
        $hasCertificate = false;

        if ($user) {
            $progress = ModuleProgress::where('user_id', $user->id)
                ->where('module_id', $id)
                ->first();
            
            $hasCertificate = Certificate::where('user_id', $user->id)
                ->where('module_id', $id)
                ->exists();
            
            // Check if user has passed quiz for this module
            $hasPassedQuiz = false;
            if ($module->quiz) {
                $hasPassedQuiz = QuizAttempt::where('user_id', $user->id)
                    ->where('quiz_id', $module->quiz->id)
                    ->where('passed', true)
                    ->exists();
            }
            
            // Module is completed if:
            // 1. Progress exists with completed_at, OR
            // 2. Certificate exists, OR
            // 3. User has passed the quiz
            $isCompleted = ($progress && $progress->completed_at) || $hasCertificate || $hasPassedQuiz;
        }

        return response()->json([
            'module' => $this->formatModule($module),
            'progress' => $progress,
            'is_completed' => $isCompleted,
            'has_certificate' => $hasCertificate,
        ]);
    }

    public function markComplete(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $module = Module::findOrFail($id);
        
        $progress = ModuleProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'module_id' => $module->id,
            ],
            [
                'completed_at' => now(),
            ]
        );

        if (!$progress->completed_at) {
            $progress->update(['completed_at' => now()]);
        }

        return response()->json([
            'message' => 'Module marked as completed',
            'progress' => $progress,
        ]);
    }
}

