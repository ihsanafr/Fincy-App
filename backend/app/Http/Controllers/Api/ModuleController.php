<?php

/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode backend.
 * Manfaat: Menjaga logika server tetap terstruktur dan mudah dirawat.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleContent;
use App\Models\ModuleProgress;
use App\Models\Certificate;
use App\Models\QuizAttempt;
use App\Models\ModuleRating;
use App\Models\ModuleBookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ModuleController extends Controller
{
    /**
     * Format module with thumbnail URL
     */
    private function formatModule($module)
    {
        $moduleArray = $module->toArray();
        if ($module->thumbnail) {
            $moduleArray['thumbnail_url'] = storage_url($module->thumbnail);
        }
        
        // Fix URLs in module contents (gambar di dalam konten HTML)
        if (isset($moduleArray['contents']) && is_array($moduleArray['contents'])) {
            $moduleArray['contents'] = array_map(function($content) {
                if (isset($content['content']) && !empty($content['content'])) {
                    $content['content'] = fix_content_urls($content['content']);
                }
                return $content;
            }, $moduleArray['contents']);
        }
        
        return $moduleArray;
    }

    public function index()
    {
        try {
            $modules = Module::where('is_active', true)
                ->with(['contents' => function($query) {
                    $query->orderBy('order');
                }])
                ->orderBy('order')
                ->get();

            $user = Auth::user();
            
            $formattedModules = $modules->map(function($module) use ($user) {
                $moduleArray = $this->formatModule($module);
                
                // Add progress information if user is authenticated
                if ($user) {
                    $progress = ModuleProgress::where('user_id', $user->id)
                        ->where('module_id', $module->id)
                        ->first();
                    
                    $hasCertificate = Certificate::where('user_id', $user->id)
                        ->where('module_id', $module->id)
                        ->exists();
                    
                    $hasPassedQuiz = false;
                    if ($module->quiz) {
                        $hasPassedQuiz = QuizAttempt::where('user_id', $user->id)
                            ->where('quiz_id', $module->quiz->id)
                            ->where('passed', true)
                            ->exists();
                    }
                    
                    $isCompleted = ($progress && $progress->completed_at) || $hasCertificate || $hasPassedQuiz;
                    
                    // Calculate progress percentage based on contents viewed
                    $totalContents = $module->contents->count();
                    $viewedContents = 0; // This could be enhanced with a content_viewed table
                    $progressPercentage = $isCompleted ? 100 : ($totalContents > 0 ? ($viewedContents / $totalContents) * 100 : 0);
                    
                    $moduleArray['progress'] = [
                        'is_completed' => $isCompleted,
                        'has_certificate' => $hasCertificate,
                        'has_passed_quiz' => $hasPassedQuiz,
                        'completed_at' => $progress?->completed_at?->toISOString(),
                        'progress_percentage' => $progressPercentage,
                    ];
                } else {
                    $moduleArray['progress'] = null;
                }
                
                return $moduleArray;
            });

            return response()->json($formattedModules);
        } catch (\Exception $e) {
            Log::error('Error fetching modules: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch modules',
                'message' => $e->getMessage()
            ], 500);
        }
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
            
            // Achievement feature is currently disabled
            // TODO: Re-implement achievement system if needed
        }

        return response()->json([
            'message' => 'Module marked as completed',
            'progress' => $progress,
        ]);
    }
}


