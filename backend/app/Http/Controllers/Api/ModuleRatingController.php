<?php

/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode backend.
 * Manfaat: Menjaga logika server tetap terstruktur dan mudah dirawat.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModuleRatingController extends Controller
{
    /**
     * Get all ratings for a module (public access)
     */
    public function getRatings($id)
    {
        try {
            $module = Module::findOrFail($id);
            $user = Auth::user(); // Can be null for public access

            $ratings = ModuleRating::where('module_id', $id)
                ->with('user:id,name,profile_photo')
                ->orderBy('created_at', 'desc')
                ->get();

            // Calculate average rating
            $averageRating = $ratings->avg('rating') ?? 0;
            $totalRatings = $ratings->count();

            // Calculate rating distribution
            $ratingCounts = [];
            for ($i = 1; $i <= 5; $i++) {
                $ratingCounts[$i] = $ratings->where('rating', $i)->count();
            }

            // Get user's rating if authenticated
            $userRating = null;
            if ($user) {
                $userRating = ModuleRating::where('module_id', $id)
                    ->where('user_id', $user->id)
                    ->first();
            }

            // Format ratings with user data
            $formattedRatings = $ratings->map(function ($rating) {
                $ratingArray = $rating->toArray();
                if ($rating->user) {
                    $ratingArray['user'] = [
                        'id' => $rating->user->id,
                        'name' => $rating->user->name,
                        'profile_photo' => $rating->user->profile_photo ? storage_url($rating->user->profile_photo) : null,
                    ];
                }
                return $ratingArray;
            });

            return response()->json([
                'ratings' => $formattedRatings,
                'average_rating' => round($averageRating, 1),
                'total_ratings' => $totalRatings,
                'rating_counts' => $ratingCounts,
                'user_rating' => $userRating,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching ratings: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch ratings',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit or update rating for a module
     */
    public function submitRating(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $module = Module::findOrFail($id);

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        // Check if user already has a rating for this module
        $existingRating = ModuleRating::where('module_id', $id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingRating) {
            // Update existing rating
            $existingRating->update([
                'rating' => $request->rating,
                'review' => $request->review ? trim($request->review) : null,
            ]);

            $existingRating->load('user:id,name,profile_photo');
            
            return response()->json([
                'message' => 'Rating updated successfully',
                'rating' => $existingRating,
            ]);
        } else {
            // Create new rating
            $rating = ModuleRating::create([
                'user_id' => $user->id,
                'module_id' => $id,
                'rating' => $request->rating,
                'review' => $request->review ? trim($request->review) : null,
            ]);

            $rating->load('user:id,name,profile_photo');

            return response()->json([
                'message' => 'Rating submitted successfully',
                'rating' => $rating,
            ], 201);
        }
    }

    /**
     * Delete user's own rating
     */
    public function deleteRating($id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $rating = ModuleRating::where('module_id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $rating->delete();

        return response()->json([
            'message' => 'Rating deleted successfully',
        ]);
    }

    /**
     * Delete rating by ID (for moderators - staff only)
     */
    public function deleteRatingById($moduleId, $ratingId)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if user is staff (educator or super admin)
        if (!$user->isStaff()) {
            return response()->json([
                'message' => 'Unauthorized. Staff access required.'
            ], 403);
        }

        $rating = ModuleRating::where('module_id', $moduleId)
            ->where('id', $ratingId)
            ->firstOrFail();

        $rating->delete();

        return response()->json([
            'message' => 'Rating deleted successfully',
        ]);
    }

    /**
     * Get recent ratings for moderation (staff only)
     */
    public function getRecentRatings(Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->isStaff()) {
            return response()->json([
                'message' => 'Unauthorized. Staff access required.'
            ], 403);
        }

        $perPage = $request->get('per_page', 20);

        $ratings = ModuleRating::with(['user:id,name,profile_photo', 'module:id,title'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Format ratings with user and module data
        $formattedRatings = $ratings->getCollection()->map(function ($rating) {
            $ratingArray = $rating->toArray();
            if ($rating->user) {
                $ratingArray['user'] = [
                    'id' => $rating->user->id,
                    'name' => $rating->user->name,
                    'profile_photo' => $rating->user->profile_photo ? storage_url($rating->user->profile_photo) : null,
                ];
            }
            if ($rating->module) {
                $ratingArray['module'] = [
                    'id' => $rating->module->id,
                    'title' => $rating->module->title,
                ];
            }
            return $ratingArray;
        });

        return response()->json([
            'data' => $formattedRatings,
            'current_page' => $ratings->currentPage(),
            'per_page' => $ratings->perPage(),
            'total' => $ratings->total(),
            'last_page' => $ratings->lastPage(),
        ]);
    }
}

