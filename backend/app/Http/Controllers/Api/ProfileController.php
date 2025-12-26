<?php

/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode backend.
 * Manfaat: Menjaga logika server tetap terstruktur dan mudah dirawat.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Upload profile photo
     */
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        // Delete old photo if exists
        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        // Upload new photo
        $file = $request->file('photo');
        $filename = 'profile_photos/' . Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('public', $filename);

        // Update user profile photo - store relative path from storage/app/public
        $user->profile_photo = $filename;
        $user->save();

        // Get full URL for the uploaded photo
        $photoUrl = asset('storage/' . $filename);

        return response()->json([
            'message' => 'Profile photo uploaded successfully',
            'profile_photo' => $photoUrl,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'banner_color' => 'sometimes|nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $user = $request->user();

        // If name is being updated, regenerate slug
        if ($request->has('name') && $request->name !== $user->name) {
            $baseSlug = Str::slug($request->name);
            $slug = $baseSlug;
            $counter = 1;

            while (User::where('slug', $slug)->where('id', '!=', $user->id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $user->name = $request->name;
            $user->slug = $slug;
        }

        if ($request->has('banner_color')) {
            $user->banner_color = $request->banner_color;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'slug' => $user->slug,
                'banner_color' => $user->banner_color,
                'profile_photo' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Get current user profile with portfolio
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        // Get completed modules (certificates)
        $certificates = $user->certificates()
            ->with('module')
            ->orderBy('issued_at', 'desc')
            ->get();

        // Get module progress
        $moduleProgress = $user->moduleProgress()
            ->with('module')
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'desc')
            ->get();

        // Get quiz attempts with passed status
        $quizAttempts = $user->quizAttempts()
            ->with(['quiz.module'])
            ->where('passed', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'slug' => $user->slug,
                'banner_color' => $user->banner_color ?? '#3b82f6',
                'profile_photo' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                'created_at' => $user->created_at,
            ],
            'portfolio' => [
                'certificates' => $certificates->map(function ($cert) {
                    // Pastikan sertifikat public dan punya token
                    if (!$cert->is_public || !$cert->public_share_token) {
                        $cert->is_public = true;
                        if (!$cert->public_share_token) {
                            $cert->public_share_token = \App\Models\Certificate::generateShareToken();
                        }
                        $cert->save();
                    }
                    return [
                        'id' => $cert->id,
                        'module_id' => $cert->module_id,
                        'module_title' => $cert->module->title,
                        'module_description' => $cert->module->description,
                        'certificate_number' => $cert->certificate_number,
                        'issued_at' => $cert->issued_at,
                        'public_link' => $cert->generatePublicLink(),
                    ];
                }),
                'completed_modules' => $moduleProgress->map(function ($progress) {
                    return [
                        'module_id' => $progress->module_id,
                        'module_title' => $progress->module->title,
                        'module_description' => $progress->module->description,
                        'completed_at' => $progress->completed_at,
                    ];
                }),
                'passed_quizzes' => $quizAttempts->map(function ($attempt) {
                    return [
                        'module_id' => $attempt->quiz->module_id,
                        'module_title' => $attempt->quiz->module->title,
                        'module_description' => $attempt->quiz->module->description,
                        'score' => $attempt->score,
                        'passed_at' => $attempt->created_at,
                    ];
                }),
            ],
            'stats' => [
                'total_certificates' => $certificates->count(),
                'total_completed_modules' => $moduleProgress->count(),
                'total_passed_quizzes' => $quizAttempts->count(),
            ],
        ]);
    }

    /**
     * Get public profile of another user by slug
     */
    public function getPublicProfile($slug)
    {
        $user = User::where('slug', $slug)->firstOrFail();

        // Get completed modules (certificates)
        $certificates = $user->certificates()
            ->with('module')
            ->orderBy('issued_at', 'desc')
            ->get();

        // Get module progress
        $moduleProgress = $user->moduleProgress()
            ->with('module')
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'desc')
            ->get();

        // Get quiz attempts with passed status
        $quizAttempts = $user->quizAttempts()
            ->with(['quiz.module'])
            ->where('passed', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'slug' => $user->slug,
                'banner_color' => $user->banner_color ?? '#3b82f6',
                'profile_photo' => $user->profile_photo ? asset('storage/' . $user->profile_photo) : null,
                'created_at' => $user->created_at,
            ],
            'portfolio' => [
                'certificates' => $certificates->map(function ($cert) {
                    // Pastikan sertifikat public dan punya token
                    if (!$cert->is_public || !$cert->public_share_token) {
                        $cert->is_public = true;
                        if (!$cert->public_share_token) {
                            $cert->public_share_token = \App\Models\Certificate::generateShareToken();
                        }
                        $cert->save();
                    }
                    return [
                        'id' => $cert->id,
                        'module_id' => $cert->module_id,
                        'module_title' => $cert->module->title,
                        'module_description' => $cert->module->description,
                        'certificate_number' => $cert->certificate_number,
                        'issued_at' => $cert->issued_at,
                        'public_link' => $cert->generatePublicLink(),
                    ];
                }),
                'completed_modules' => $moduleProgress->map(function ($progress) {
                    return [
                        'module_id' => $progress->module_id,
                        'module_title' => $progress->module->title,
                        'module_description' => $progress->module->description,
                        'completed_at' => $progress->completed_at,
                    ];
                }),
                'passed_quizzes' => $quizAttempts->map(function ($attempt) {
                    return [
                        'module_id' => $attempt->quiz->module_id,
                        'module_title' => $attempt->quiz->module->title,
                        'module_description' => $attempt->quiz->module->description,
                        'score' => $attempt->score,
                        'passed_at' => $attempt->created_at,
                    ];
                }),
            ],
            'stats' => [
                'total_certificates' => $certificates->count(),
                'total_completed_modules' => $moduleProgress->count(),
                'total_passed_quizzes' => $quizAttempts->count(),
            ],
        ]);
    }
}

