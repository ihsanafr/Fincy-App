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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Generate unique slug from name
     */
    private function generateSlug($name)
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (User::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => User::ROLE_USER,
            'slug' => $this->generateSlug($request->name),
            // Default banner color (blue)
            'banner_color' => '#3b82f6',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $userData = $user->toArray();
        if ($user->profile_photo) {
            $userData['profile_photo'] = asset('storage/' . $user->profile_photo);
        }
        // Ensure banner_color is always present
        $userData['banner_color'] = $userData['banner_color'] ?? '#3b82f6';

        return response()->json([
            'user' => $userData,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $userData = $user->toArray();
        if ($user->profile_photo) {
            $userData['profile_photo'] = asset('storage/' . $user->profile_photo);
        }
        // Ensure banner_color is always present
        $userData['banner_color'] = $userData['banner_color'] ?? '#3b82f6';

        return response()->json([
            'user' => $userData,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        $userData = $user->toArray();
        
        // Add full URL for profile photo
        if ($user->profile_photo) {
            $userData['profile_photo'] = asset('storage/' . $user->profile_photo);
        }
        // Ensure banner_color is always present
        $userData['banner_color'] = $userData['banner_color'] ?? '#3b82f6';
        
        return response()->json($userData);
    }
}


