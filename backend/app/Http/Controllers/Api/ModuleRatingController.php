<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModuleRatingController extends Controller
{
    public function getRatings($moduleId)
    {
        $ratings = ModuleRating::where('module_id', $moduleId)
            ->with('user:id,name,profile_photo,slug')
            ->orderBy('created_at', 'desc')
            ->get();

        $averageRating = ModuleRating::where('module_id', $moduleId)
            ->avg('rating');

        $ratingCounts = ModuleRating::where('module_id', $moduleId)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        $userRating = null;
        if (Auth::check()) {
            $userRating = ModuleRating::where('module_id', $moduleId)
                ->where('user_id', Auth::id())
                ->first();
        }

        return response()->json([
            'ratings' => $ratings,
            'average_rating' => round($averageRating, 1) ?? 0,
            'total_ratings' => $ratings->count(),
            'rating_counts' => $ratingCounts,
            'user_rating' => $userRating,
        ]);
    }

    public function submitRating(Request $request, $moduleId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $module = Module::findOrFail($moduleId);

        $rating = ModuleRating::updateOrCreate(
            [
                'user_id' => $user->id,
                'module_id' => $moduleId,
            ],
            [
                'rating' => $request->rating,
                'review' => $request->review,
            ]
        );

        return response()->json([
            'message' => 'Rating submitted successfully',
            'rating' => $rating->load('user:id,name,profile_photo,slug'),
        ]);
    }

    public function deleteRating($moduleId)
    {
        $user = Auth::user();

        $rating = ModuleRating::where('module_id', $moduleId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $rating->delete();

        return response()->json([
            'message' => 'Rating deleted successfully',
        ]);
    }
}
