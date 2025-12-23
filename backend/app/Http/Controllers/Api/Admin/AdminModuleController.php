<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleContent;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminModuleController extends Controller
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
        $modules = Module::with(['contents', 'quiz.questions'])
            ->orderBy('order')
            ->get();

        $formattedModules = $modules->map(function($module) {
            return $this->formatModule($module);
        });

        return response()->json($formattedModules);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|in:0,1,true,false',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'contents' => 'nullable|array',
            'contents.*.type' => 'required|in:video,text',
            'contents.*.title' => 'required|string',
            'contents.*.content' => 'nullable|string',
            'contents.*.youtube_url' => 'nullable|string|url',
            'contents.*.order' => 'nullable|integer',
            'quiz' => 'nullable|array',
            'quiz.questions' => 'nullable|array',
            'quiz.questions.*.question' => 'required|string',
            'quiz.questions.*.option_a' => 'required|string',
            'quiz.questions.*.option_b' => 'required|string',
            'quiz.questions.*.option_c' => 'required|string',
            'quiz.questions.*.option_d' => 'required|string',
            'quiz.questions.*.correct_answer' => 'required|in:a,b,c,d',
            'quiz.questions.*.order' => 'nullable|integer',
        ]);

        // Handle thumbnail upload
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $filename = 'module_thumbnails/' . Str::uuid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public', $filename);
            $thumbnailPath = $filename;
        }

        // Handle is_active - convert string to boolean
        $isActive = true; // default
        if ($request->has('is_active')) {
            $isActiveValue = $request->input('is_active');
            if (is_string($isActiveValue)) {
                $isActive = in_array(strtolower($isActiveValue), ['1', 'true', 'yes']);
            } else {
                $isActive = (bool) $isActiveValue;
            }
        }

        $module = Module::create([
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'order' => $request->order ?? 0,
            'is_active' => $isActive,
            'thumbnail' => $thumbnailPath,
        ]);

        // Create contents
        if ($request->has('contents')) {
            foreach ($request->contents as $contentData) {
                ModuleContent::create([
                    'module_id' => $module->id,
                    'type' => $contentData['type'],
                    'title' => $contentData['title'],
                    'content' => $contentData['content'] ?? null,
                    'youtube_url' => $contentData['youtube_url'] ?? null,
                    'order' => $contentData['order'] ?? 0,
                ]);
            }
        }

        // Create quiz
        if ($request->has('quiz') && isset($request->quiz['questions'])) {
            $quiz = Quiz::create([
                'module_id' => $module->id,
            ]);

            foreach ($request->quiz['questions'] as $questionData) {
                QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question' => $questionData['question'],
                    'option_a' => $questionData['option_a'],
                    'option_b' => $questionData['option_b'],
                    'option_c' => $questionData['option_c'],
                    'option_d' => $questionData['option_d'],
                    'correct_answer' => $questionData['correct_answer'],
                    'order' => $questionData['order'] ?? 0,
                ]);
            }
        }

        $module->load(['contents', 'quiz.questions']);
        return response()->json($this->formatModule($module), 201);
    }

    public function show($id)
    {
        $module = Module::with(['contents', 'quiz.questions'])->findOrFail($id);
        return response()->json($this->formatModule($module));
    }

    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        // With method-spoofed POST (_method=PUT), Laravel will parse multipart normally.
        // Validate expected fields (frontend sends all fields on edit).
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'required|in:0,1,true,false',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $updateData = [
            'title' => trim((string) $request->input('title')),
            'description' => $request->input('description') ?? '',
            'category' => trim((string) $request->input('category')),
            'order' => (int) ($request->input('order') ?? 0),
        ];

        // Convert is_active to boolean
        $isActiveValue = $request->input('is_active');
        if (is_string($isActiveValue)) {
            $trimmed = strtolower(trim($isActiveValue));
            $updateData['is_active'] = in_array($trimmed, ['1', 'true', 'yes', 'on'], true);
        } else {
            $updateData['is_active'] = (bool) $isActiveValue;
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($module->thumbnail) {
                Storage::disk('public')->delete($module->thumbnail);
            }

            $file = $request->file('thumbnail');
            $filename = 'module_thumbnails/' . Str::uuid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public', $filename);
            $updateData['thumbnail'] = $filename;
        }

        $module->update($updateData);
        
        // Refresh module to get updated data
        $module->refresh();
        $module->load(['contents', 'quiz.questions']);
        
        return response()->json($this->formatModule($module));
    }

    public function destroy($id)
    {
        $module = Module::findOrFail($id);
        $module->delete();

        return response()->json(['message' => 'Module deleted successfully']);
    }

    public function updateContents(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        $request->validate([
            'contents' => 'required|array',
            'contents.*.id' => 'nullable|exists:module_contents,id',
            'contents.*.type' => 'required|in:video,text',
            'contents.*.title' => 'required|string',
            'contents.*.content' => 'nullable|string',
            'contents.*.youtube_url' => 'nullable|string|url',
            'contents.*.order' => 'nullable|integer',
        ]);

        // Delete existing contents
        $module->contents()->delete();

        // Create new contents
        foreach ($request->contents as $contentData) {
            ModuleContent::create([
                'module_id' => $module->id,
                'type' => $contentData['type'],
                'title' => $contentData['title'],
                'content' => $contentData['content'] ?? null,
                'youtube_url' => $contentData['youtube_url'] ?? null,
                'order' => $contentData['order'] ?? 0,
            ]);
        }

        return response()->json($module->load('contents'));
    }

    public function updateQuiz(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'nullable|exists:quiz_questions,id',
            'questions.*.question' => 'required|string',
            'questions.*.option_a' => 'required|string',
            'questions.*.option_b' => 'required|string',
            'questions.*.option_c' => 'required|string',
            'questions.*.option_d' => 'required|string',
            'questions.*.correct_answer' => 'required|in:a,b,c,d',
            'questions.*.order' => 'nullable|integer',
        ]);

        // Get or create quiz
        $quiz = $module->quiz;
        if (!$quiz) {
            $quiz = Quiz::create(['module_id' => $module->id]);
        }

        // Delete existing questions
        $quiz->questions()->delete();

        // Create new questions
        foreach ($request->questions as $questionData) {
            QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question' => $questionData['question'],
                'option_a' => $questionData['option_a'],
                'option_b' => $questionData['option_b'],
                'option_c' => $questionData['option_c'],
                'option_d' => $questionData['option_d'],
                'correct_answer' => $questionData['correct_answer'],
                'order' => $questionData['order'] ?? 0,
            ]);
        }

        return response()->json($quiz->load('questions'));
    }

    // Content Management Methods
    public function getContents($moduleId)
    {
        $module = Module::findOrFail($moduleId);
        $contents = $module->contents()->orderBy('order')->get();
        return response()->json($contents);
    }

    public function storeContent(Request $request, $moduleId)
    {
        $module = Module::findOrFail($moduleId);

        $request->validate([
            'type' => 'required|in:video,text',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'youtube_url' => 'nullable|string|url',
            'order' => 'nullable|integer',
        ]);

        // Validate based on type
        $type = $request->input('type');
        if ($type === 'video' && !$request->input('youtube_url')) {
            return response()->json(['error' => 'YouTube URL is required for video content'], 422);
        }
        if ($type === 'text' && !$request->input('content')) {
            return response()->json(['error' => 'Content is required for text content'], 422);
        }

        $content = ModuleContent::create([
            'module_id' => $module->id,
            'type' => $type,
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'youtube_url' => $request->input('youtube_url'),
            'order' => $request->input('order') ?? (($module->contents()->max('order') ?? 0) + 1),
        ]);

        return response()->json($content, 201);
    }

    public function updateContent(Request $request, $moduleId, $contentId)
    {
        $module = Module::findOrFail($moduleId);
        $content = $module->contents()->findOrFail($contentId);

        $request->validate([
            'type' => 'sometimes|required|in:video,text',
            'title' => 'sometimes|required|string|max:255',
            'content' => 'nullable|string',
            'youtube_url' => 'nullable|string|url',
            'order' => 'nullable|integer',
        ]);

        // Validate based on type
        $type = $request->input('type') ?? $content->type;
        if ($type === 'video' && !($request->input('youtube_url') ?? $content->youtube_url)) {
            return response()->json(['error' => 'YouTube URL is required for video content'], 422);
        }
        if ($type === 'text' && !($request->input('content') ?? $content->content)) {
            return response()->json(['error' => 'Content is required for text content'], 422);
        }

        $content->update($request->only([
            'type', 'title', 'content', 'youtube_url', 'order'
        ]));

        return response()->json($content);
    }

    public function deleteContent($moduleId, $contentId)
    {
        $module = Module::findOrFail($moduleId);
        $content = $module->contents()->findOrFail($contentId);
        $content->delete();

        return response()->json(['message' => 'Content deleted successfully']);
    }
}

