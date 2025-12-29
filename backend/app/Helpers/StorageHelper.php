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

if (!function_exists('fix_content_urls')) {
    /**
     * Memperbaiki URL gambar di dalam konten HTML
     * Mengganti URL localhost dengan URL domain yang benar
     * 
     * @param string|null $content Konten HTML
     * @return string|null Konten HTML dengan URL yang sudah diperbaiki
     */
    function fix_content_urls($content)
    {
        if (empty($content)) {
            return $content;
        }

        $appUrl = rtrim(config('app.url'), '/');
        
        // Pattern untuk mencari URL localhost dengan berbagai variasi
        // Mencari di dalam atribut src, href, atau di dalam tag
        $patterns = [
            // http://localhost:8000/storage/...
            '/(["\']?)http:\/\/localhost:8000\/storage\/([^\s"\'<>\)]+)(["\']?)/i',
            // https://localhost:8000/storage/...
            '/(["\']?)https:\/\/localhost:8000\/storage\/([^\s"\'<>\)]+)(["\']?)/i',
            // http://127.0.0.1:8000/storage/...
            '/(["\']?)http:\/\/127\.0\.0\.1:8000\/storage\/([^\s"\'<>\)]+)(["\']?)/i',
            // https://127.0.0.1:8000/storage/...
            '/(["\']?)https:\/\/127\.0\.0\.1:8000\/storage\/([^\s"\'<>\)]+)(["\']?)/i',
        ];

        foreach ($patterns as $pattern) {
            $content = preg_replace_callback($pattern, function($matches) use ($appUrl) {
                $quoteBefore = $matches[1] ?? '';
                $path = $matches[2] ?? '';
                $quoteAfter = $matches[3] ?? '';
                
                // Hapus query string atau fragment jika ada
                $path = preg_split('/[?#]/', $path)[0];
                
                $fixedUrl = storage_url($path);
                return $quoteBefore . $fixedUrl . $quoteAfter;
            }, $content);
        }

        return $content;
    }
}

