<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::with(['subscription', 'certificates.module'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::with([
            'subscription',
            'certificates.module',
            'moduleProgress.module',
            'quizAttempts.quiz.module'
        ])->findOrFail($id);

        return response()->json($user);
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:user,super_admin',
        ]);

        $user = User::findOrFail($id);
        
        // Prevent changing own role
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot change your own role'], 403);
        }

        $user->update([
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user,
        ]);
    }
}

