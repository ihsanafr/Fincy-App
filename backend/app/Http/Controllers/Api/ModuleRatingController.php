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
    public function getRatings($moduleId)
    {
        $ratings = ModuleRating::where('module_id', $moduleId)
            ->with('user:id,name,profile_photo,slug')
            ->orderBy('created_at', 'desc')
            ->get();

        // Pastikan foto profil berbentuk URL agar aman dipakai langsung di frontend
        $ratings->each(function ($rating) {
            if ($rating->user && $rating->user->profile_photo) {
                $rating->user->profile_photo = asset('storage/' . $rating->user->profile_photo);
            }
        });

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

    /**
     * Menghapus rating tertentu (moderasi).
     *
     * Manfaat: educator/super admin dapat menghapus komentar/rating yang tidak pantas.
     */
    public function deleteRatingById(Request $request, $moduleId, $ratingId)
    {
        $user = $request->user();

        $rating = ModuleRating::where('module_id', $moduleId)
            ->where('id', $ratingId)
            ->firstOrFail();

        // User biasa hanya boleh menghapus rating miliknya sendiri
        $isOwner = $user && $rating->user_id === $user->id;
        $isStaff = $user && method_exists($user, 'isStaff') && $user->isStaff();

        if (!$isOwner && !$isStaff) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rating->delete();

        return response()->json([
            'message' => 'Rating deleted successfully',
        ]);
    }

    /**
     * Mengambil rating/review terbaru untuk moderasi (khusus staff: educator/super admin).
     *
     * Manfaat: Dashboard admin/educator bisa menampilkan review terbaru dan menghapus yang tidak pantas.
     */
    public function getRecentRatings(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $ratings = ModuleRating::with([
                'user:id,name,profile_photo,slug',
                'module:id,title',
            ])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Pastikan foto profil berbentuk URL agar aman dipakai langsung di frontend
        $ratings->getCollection()->each(function ($rating) {
            if ($rating->user && $rating->user->profile_photo) {
                $rating->user->profile_photo = asset('storage/' . $rating->user->profile_photo);
            }
        });

        return response()->json($ratings);
    }
}

