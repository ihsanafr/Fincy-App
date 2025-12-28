# Fix Masalah Module di Homepage dan Rating

Dokumen ini menjelaskan cara memperbaiki masalah:
1. Modul pembelajaran tidak bisa dilihat di homepage
2. Rating tidak bisa dilihat dari kedua sisi (user dan admin)

## Masalah yang Ditemukan

### 1. Modul Tidak Bisa Dilihat di Homepage
- Route `/api/modules` adalah public route
- Query sudah benar (hanya `is_active = true`)
- Mungkin ada error yang tidak ter-handle

### 2. Rating Tidak Bisa Dilihat
- Route `GET /api/modules/{id}/ratings` ada di protected routes
- Seharusnya bisa diakses public untuk melihat ratings
- Hanya submit/delete yang perlu authentication

## Solusi yang Sudah Diterapkan

### 1. Route GET Ratings Dipindahkan ke Public Routes ✅

**Sebelum:**
```php
// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Module Ratings
    Route::get('/modules/{id}/ratings', [ModuleRatingController::class, 'getRatings']);
    Route::post('/modules/{id}/ratings', [ModuleRatingController::class, 'submitRating']);
    // ...
});
```

**Sesudah:**
```php
// Public routes
Route::get('/modules/{id}/ratings', [ModuleRatingController::class, 'getRatings']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Module Ratings (require login for submit/delete)
    Route::post('/modules/{id}/ratings', [ModuleRatingController::class, 'submitRating']);
    Route::delete('/modules/{id}/ratings', [ModuleRatingController::class, 'deleteRating']);
    Route::delete('/modules/{id}/ratings/{ratingId}', [ModuleRatingController::class, 'deleteRatingById']);
});
```

### 2. Error Handling di ModuleController ✅

Ditambahkan try-catch dan logging untuk debugging:
```php
public function index()
{
    try {
        $modules = Module::where('is_active', true)
            ->with(['contents' => function($query) {
                $query->orderBy('order');
            }])
            ->orderBy('order')
            ->get();
        // ... rest of code
        return response()->json($formattedModules);
    } catch (\Exception $e) {
        \Log::error('Error fetching modules: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to fetch modules',
            'message' => $e->getMessage()
        ], 500);
    }
}
```

### 3. Error Handling di ModuleRatingController ✅

Ditambahkan try-catch dan comment bahwa bisa diakses public:
```php
/**
 * Get all ratings for a module (public access)
 */
public function getRatings($id)
{
    try {
        // ... code
    } catch (\Exception $e) {
        \Log::error('Error fetching ratings: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to fetch ratings',
            'message' => $e->getMessage()
        ], 500);
    }
}
```

## Langkah Setup di cPanel

### 1. Upload File yang Diperbarui

Pastikan file berikut sudah di-update:
- `backend/routes/api.php` - Route sudah di-update
- `backend/app/Http/Controllers/Api/ModuleController.php` - Error handling ditambahkan
- `backend/app/Http/Controllers/Api/ModuleRatingController.php` - Error handling ditambahkan

### 2. Clear Cache

Jalankan di SSH atau Terminal cPanel:

```bash
cd ~/public_html/backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan route:cache
```

### 3. Verifikasi Route

Check route sudah benar:

```bash
php artisan route:list | grep -E "(modules|ratings)"
```

Harus muncul:
- `GET /api/modules` (public)
- `GET /api/modules/{id}` (public)
- `GET /api/modules/{id}/ratings` (public) ← **INI HARUS PUBLIC**
- `POST /api/modules/{id}/ratings` (protected)
- `DELETE /api/modules/{id}/ratings` (protected)
- `DELETE /api/modules/{id}/ratings/{ratingId}` (protected)

## Testing

### Test Module di Homepage

1. **Buka homepage tanpa login**
2. **Check Network tab di browser**
3. **Lihat request ke `/api/modules`**
4. **Response harus return array modules dengan `is_active = true`**

**Jika masih error:**
- Check error log: `storage/logs/laravel.log`
- Pastikan ada module dengan `is_active = 1` di database
- Test langsung: `GET https://yourdomain.com/api/modules`

### Test Rating

1. **Buka module detail page tanpa login**
2. **Rating harus bisa dilihat** (GET `/api/modules/{id}/ratings`)
3. **Login sebagai user**
4. **Rating harus bisa dilihat dan bisa submit**
5. **Login sebagai admin/educator**
6. **Rating harus bisa dilihat dan bisa delete rating user lain**

**Jika masih error:**
- Check error log: `storage/logs/laravel.log`
- Pastikan table `module_ratings` sudah ada (run migration)
- Test langsung: `GET https://yourdomain.com/api/modules/{id}/ratings`

## Troubleshooting

### Module Tidak Muncul di Homepage

**Kemungkinan:**
1. Tidak ada module dengan `is_active = true`
2. Error di query atau response
3. CORS issue

**Solusi:**
1. Check database:
   ```sql
   SELECT id, title, is_active FROM modules;
   ```
   Pastikan ada module dengan `is_active = 1`

2. Check error log:
   ```bash
   tail -f storage/logs/laravel.log
   ```

3. Test API langsung:
   ```bash
   curl https://yourdomain.com/api/modules
   ```

4. Check CORS configuration di `config/cors.php`

### Rating Tidak Bisa Dilihat

**Kemungkinan:**
1. Route masih di protected
2. Table `module_ratings` tidak ada
3. Error di controller

**Solusi:**
1. Check route sudah public:
   ```bash
   php artisan route:list | grep ratings
   ```
   `GET /api/modules/{id}/ratings` harus **tidak ada** middleware `auth:sanctum`

2. Check table sudah ada:
   ```sql
   SHOW TABLES LIKE 'module_ratings';
   ```
   Jika tidak ada, run migration:
   ```bash
   php artisan migrate
   ```

3. Check error log:
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. Test API langsung:
   ```bash
   curl https://yourdomain.com/api/modules/1/ratings
   ```

### Rating Bisa Dilihat Tapi Tidak Bisa Submit

**Ini normal!** Submit rating memerlukan authentication. Pastikan:
1. User sudah login
2. Token valid
3. Route `POST /api/modules/{id}/ratings` ada di protected routes

### Admin Tidak Bisa Delete Rating

**Solusi:**
1. Check user role adalah `educator` atau `super_admin`
2. Check middleware `staff` sudah terdaftar
3. Check route `DELETE /api/modules/{id}/ratings/{ratingId}` ada

## Checklist

Setelah fix, pastikan:

- [ ] Route `GET /api/modules/{id}/ratings` adalah **public** (tidak ada middleware)
- [ ] Route `POST /api/modules/{id}/ratings` adalah **protected** (ada middleware)
- [ ] Module dengan `is_active = true` muncul di homepage
- [ ] Rating bisa dilihat tanpa login
- [ ] Rating bisa di-submit setelah login
- [ ] Admin bisa delete rating user lain
- [ ] Error handling sudah ditambahkan di controller
- [ ] Cache sudah di-clear

## Quick Fix Command

Jika semua file sudah di-upload, jalankan:

```bash
cd ~/public_html/backend
php artisan route:clear
php artisan route:cache
php artisan config:clear
php artisan cache:clear
```

## Catatan Penting

1. **GET ratings adalah public** - Siapa saja bisa lihat ratings
2. **POST/DELETE ratings adalah protected** - Hanya user yang login bisa submit/delete
3. **Module harus `is_active = true`** - Hanya module aktif yang muncul di homepage
4. **Error handling penting** - Untuk debugging di production

## Support

Jika masih ada masalah:
1. Check error log: `storage/logs/laravel.log`
2. Check browser console untuk error
3. Test dengan Postman untuk isolate masalah
4. Pastikan semua file sudah di-upload dengan benar
5. Pastikan route sudah di-cache dengan benar

