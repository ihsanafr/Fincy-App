<?php

/**
 * @fincy-doc
 * Ringkasan: Middleware untuk membatasi akses ke role staff (educator/super admin).
 * Manfaat: Memastikan hanya role yang berhak yang bisa mengakses fitur kontribusi (modul/materi) dan moderasi.
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !method_exists($user, 'isStaff') || !$user->isStaff()) {
            return response()->json(['message' => 'Unauthorized. Staff access required.'], 403);
        }

        return $next($request);
    }
}


