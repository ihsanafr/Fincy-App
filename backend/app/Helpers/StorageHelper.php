<?php

/**
 * Helper untuk generate URL storage yang benar
 * Mengatasi masalah URL gambar di production (cPanel)
 */

use Illuminate\Support\Facades\Storage;

if (!function_exists('storage_url')) {
    /**
     * Generate full URL untuk file di storage
     * 
     * @param string|null $path Path relatif dari storage/app/public
     * @return string|null Full URL atau null jika path kosong
     */
    function storage_url($path)
    {
        if (empty($path)) {
            return null;
        }

        // Gunakan Storage::url() yang otomatis menggunakan konfigurasi filesystem
        // Ini akan menggunakan APP_URL dari .env dan path /storage
        $url = Storage::disk('public')->url($path);
        
        // Pastikan URL adalah absolute (full URL)
        // Jika Storage::url() sudah menghasilkan absolute URL, gunakan itu
        // Jika masih relative, tambahkan APP_URL
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }
        
        // Jika relative, tambahkan APP_URL
        $appUrl = rtrim(config('app.url'), '/');
        return $appUrl . '/' . ltrim($url, '/');
    }
}

