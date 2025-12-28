# Fix Masalah CRUD Rating/Comment di cPanel

Dokumen ini menjelaskan cara memperbaiki masalah CRUD rating/comment setelah deploy ke cPanel.

## Masalah

Setelah deploy, CRUD rating/comment tidak bisa diakses dengan error:
- 404 Not Found
- Controller tidak ditemukan
- Route tidak bekerja

## Penyebab

1. **Controller `ModuleRatingController` tidak ada** - File controller hilang sehingga route rating tidak bisa diakses
2. **Model `ModuleRating` tidak ada** - Model untuk rating tidak ada
3. **Migration `module_ratings` tidak ada** - Table untuk menyimpan rating tidak ada di database

## Solusi yang Sudah Diterapkan

### 1. Migration untuk Table `module_ratings` ✅

File: `backend/database/migrations/2024_01_01_000011_create_module_ratings_table.php`

Table structure:
- `id` - Primary key
- `user_id` - Foreign key ke users
- `module_id` - Foreign key ke modules
- `rating` - Integer 1-5 (bintang)
- `review` - Text nullable (komentar/ulasan)
- `created_at`, `updated_at` - Timestamps
- Unique constraint: `user_id` + `module_id` (satu user hanya bisa rating sekali per module)

### 2. Model `ModuleRating` ✅

File: `backend/app/Models/ModuleRating.php`

Model dengan relationships:
- `belongsTo(User::class)`
- `belongsTo(Module::class)`

### 3. Controller `ModuleRatingController` ✅

File: `backend/app/Http/Controllers/Api/ModuleRatingController.php`

Methods:
- `getRatings($id)` - GET `/api/modules/{id}/ratings` - Get all ratings untuk module
- `submitRating($request, $id)` - POST `/api/modules/{id}/ratings` - Submit/update rating
- `deleteRating($id)` - DELETE `/api/modules/{id}/ratings` - Delete user's own rating
- `deleteRatingById($moduleId, $ratingId)` - DELETE `/api/modules/{id}/ratings/{ratingId}` - Delete rating (moderator)
- `getRecentRatings($request)` - GET `/api/admin/ratings` - Get recent ratings untuk moderation

### 4. Model `Module` Relationship ✅

Model Module sudah memiliki relationship:
```php
public function ratings()
{
    return $this->hasMany(ModuleRating::class);
}
```

## Langkah Setup di cPanel

### 1. Upload File

Pastikan file berikut sudah di-upload ke cPanel:

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           └── ModuleRatingController.php  ← FILE BARU
│   └── Models/
│       └── ModuleRating.php  ← FILE BARU
└── database/
    └── migrations/
        └── 2024_01_01_000011_create_module_ratings_table.php  ← FILE BARU
```

### 2. Run Migration

Jalankan migration untuk membuat table `module_ratings`:

**Via SSH:**
```bash
cd ~/public_html/backend
php artisan migrate
```

**Atau via cPanel Terminal:**
```bash
cd ~/public_html/backend
php artisan migrate
```

**Jika ada error "table already exists":**
```bash
php artisan migrate:refresh --path=database/migrations/2024_01_01_000011_create_module_ratings_table.php
```

### 3. Rebuild Autoload

Jalankan di SSH atau Terminal cPanel:

```bash
cd ~/public_html/backend
composer dump-autoload
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 4. Verifikasi Route

Check route sudah terdaftar:

```bash
php artisan route:list | grep ratings
```

Harus muncul:
- GET `/api/modules/{id}/ratings`
- POST `/api/modules/{id}/ratings`
- DELETE `/api/modules/{id}/ratings`
- DELETE `/api/modules/{id}/ratings/{ratingId}`
- GET `/api/admin/ratings`

## Testing

### Test sebagai User

1. **Login sebagai user biasa**
2. **Test Get Ratings:**
   - GET `/api/modules/{id}/ratings`
   - Harus return list ratings dengan average rating

3. **Test Submit Rating:**
   - POST `/api/modules/{id}/ratings`
   - Body: `{ "rating": 5, "review": "Great module!" }`
   - Harus bisa create rating

4. **Test Update Rating:**
   - POST `/api/modules/{id}/ratings` (lagi dengan data berbeda)
   - Harus update rating yang sudah ada

5. **Test Delete Own Rating:**
   - DELETE `/api/modules/{id}/ratings`
   - Harus bisa delete rating sendiri

### Test sebagai Staff (Educator/Super Admin)

1. **Login sebagai Educator atau Super Admin**
2. **Test Get Recent Ratings:**
   - GET `/api/admin/ratings`
   - Harus return list ratings terbaru untuk moderation

3. **Test Delete Any Rating:**
   - DELETE `/api/modules/{id}/ratings/{ratingId}`
   - Harus bisa delete rating user lain (moderation)

## Troubleshooting

### Error: "Class 'App\Http\Controllers\Api\ModuleRatingController' not found"

**Solusi:**
1. Pastikan file `ModuleRatingController.php` ada di folder `app/Http/Controllers/Api/`
2. Jalankan `composer dump-autoload`
3. Clear cache: `php artisan config:clear`

### Error: "Table 'module_ratings' doesn't exist"

**Solusi:**
1. Jalankan migration:
   ```bash
   php artisan migrate
   ```
2. Check apakah migration file sudah di-upload
3. Check database connection di `.env`

### Error: 404 Not Found untuk route ratings

**Solusi:**
1. Clear route cache:
   ```bash
   php artisan route:clear
   php artisan route:cache
   ```
2. Check file `routes/api.php` pastikan route ada
3. Check middleware `auth:sanctum` sudah benar

### Error: "Call to undefined function storage_url()"

**Solusi:**
1. Pastikan file `app/Helpers/StorageHelper.php` ada
2. Jalankan `composer dump-autoload`
3. Clear cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

### Rating tidak bisa di-submit

**Checklist:**
1. ✅ User sudah login (token valid)
2. ✅ Module ID valid
3. ✅ Rating value antara 1-5
4. ✅ Review max 1000 characters
5. ✅ Table `module_ratings` sudah ada

### User bisa submit multiple ratings

**Ini seharusnya tidak terjadi** karena ada unique constraint. Jika terjadi:

1. Check migration sudah dijalankan
2. Check unique constraint di database:
   ```sql
   SHOW INDEX FROM module_ratings;
   ```
3. Re-run migration jika perlu

### Staff tidak bisa delete rating

**Solusi:**
1. Check user role adalah `educator` atau `super_admin`
2. Check method `isStaff()` di model User
3. Check middleware `staff` sudah terdaftar

## Database Schema

```sql
CREATE TABLE module_ratings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    module_id BIGINT UNSIGNED NOT NULL,
    rating INT DEFAULT 5,
    review TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY unique_user_module (user_id, module_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    INDEX idx_module_id (module_id),
    INDEX idx_created_at (created_at)
);
```

## API Endpoints

### User Endpoints

- **GET** `/api/modules/{id}/ratings`
  - Get all ratings untuk module
  - Response: `{ ratings, average_rating, total_ratings, rating_counts, user_rating }`

- **POST** `/api/modules/{id}/ratings`
  - Submit/update rating
  - Body: `{ rating: 1-5, review: "optional text" }`
  - Auth: Required

- **DELETE** `/api/modules/{id}/ratings`
  - Delete user's own rating
  - Auth: Required

### Staff Endpoints

- **GET** `/api/admin/ratings`
  - Get recent ratings untuk moderation
  - Query: `?per_page=20`
  - Auth: Staff (Educator/Super Admin)

- **DELETE** `/api/modules/{id}/ratings/{ratingId}`
  - Delete any rating (moderation)
  - Auth: Staff (Educator/Super Admin)

## Catatan Penting

1. **Satu user hanya bisa rating sekali per module** - Unique constraint
2. **User bisa update rating sendiri** - POST lagi akan update existing
3. **Staff bisa delete rating user lain** - Untuk moderation
4. **Review optional** - Bisa rating tanpa komentar
5. **Rating 1-5** - Validasi di controller

## Quick Fix Command

Jika semua file sudah di-upload, jalankan:

```bash
cd ~/public_html/backend
php artisan migrate
composer dump-autoload
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan route:cache
```

## Support

Jika masih ada masalah:
1. Check error log: `storage/logs/laravel.log`
2. Check browser console untuk error
3. Test dengan Postman untuk isolate masalah
4. Pastikan semua file sudah di-upload dengan benar
5. Pastikan migration sudah dijalankan

