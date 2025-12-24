<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleBookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModuleBookmarkController extends Controller
{
    public function toggleBookmark($moduleId)
    {
        $user = Auth::user();
        $module = Module::findOrFail($moduleId);

        $bookmark = ModuleBookmark::where('user_id', $user->id)
            ->where('module_id', $moduleId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $isBookmarked = false;
        } else {
            ModuleBookmark::create([
                'user_id' => $user->id,
                'module_id' => $moduleId,
            ]);
            $isBookmarked = true;
        }

        return response()->json([
            'is_bookmarked' => $isBookmarked,
            'message' => $isBookmarked ? 'Module bookmarked' : 'Bookmark removed',
        ]);
    }

    public function getBookmarks()
    {
        $user = Auth::user();

        $bookmarks = ModuleBookmark::where('user_id', $user->id)
            ->with(['module' => function($query) {
                $query->select('id', 'title', 'description', 'category', 'thumbnail');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookmarks);
    }

    public function checkBookmark($moduleId)
    {
        $user = Auth::user();

        $isBookmarked = ModuleBookmark::where('user_id', $user->id)
            ->where('module_id', $moduleId)
            ->exists();

        return response()->json([
            'is_bookmarked' => $isBookmarked,
        ]);
    }
}
