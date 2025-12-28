# Fix Masalah CRUD Modul di cPanel

Dokumen ini menjelaskan cara memperbaiki masalah CRUD modul setelah deploy ke cPanel.

## Masalah

Setelah deploy, CRUD modul tidak bisa diakses dengan error:
- 403 Unauthorized
- Middleware error
- Route tidak ditemukan

## Penyebab

1. **Middleware `EnsureUserIsStaff` tidak ada** - File middleware hilang sehingga route CRUD modul tidak bisa diakses
2. **Helper function `storage_url()` tidak ter-load** - Setelah deploy, perlu rebuild autoload

## Solusi yang Sudah Diterapkan

### 1. Middleware `EnsureUserIsStaff` ✅

File `backend/app/Http/Middleware/EnsureUserIsStaff.php` sudah dibuat. Middleware ini:
- Mengecek apakah user adalah Staff (Educator atau Super Admin)
- Menggunakan method `isStaff()` dari model User
- Mengembalikan 403 jika user bukan staff

### 2. Helper Function `storage_url()` ✅

Helper function sudah dibuat dan terdaftar di `composer.json`:
- File: `backend/app/Helpers/StorageHelper.php`
- Terdaftar di `composer.json` autoload files
- Generate URL gambar yang benar untuk production

## Langkah Setup di cPanel

### 1. Upload File Middleware

Pastikan file berikut sudah di-upload ke cPanel:
- `backend/app/Http/Middleware/EnsureUserIsStaff.php`

### 2. Rebuild Autoload

Jalankan di SSH atau Terminal cPanel:

```bash
cd ~/public_html/backend
composer dump-autoload
```

Atau jika tidak ada SSH, pastikan file sudah di-upload dan coba clear cache:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 3. Set Permission

Pastikan permission file middleware benar:

```bash
chmod 644 app/Http/Middleware/EnsureUserIsStaff.php
```

### 4. Verifikasi Middleware Terdaftar

Check file `bootstrap/app.php` harus ada:

```php
$middleware->alias([
    'super_admin' => \App\Http\Middleware\EnsureUserIsSuperAdmin::class,
    'staff' => \App\Http\Middleware\EnsureUserIsStaff::class,
]);
```

### 5. Test CRUD Modul

1. **Login sebagai Super Admin atau Educator**
2. **Test Create Module:**
   - POST `/api/admin/modules`
   - Harus bisa create module baru

3. **Test Read Modules:**
   - GET `/api/admin/modules`
   - Harus return list modules

4. **Test Update Module:**
   - PUT `/api/admin/modules/{id}`
   - Harus bisa update module

5. **Test Delete Module:**
   - DELETE `/api/admin/modules/{id}`
   - Harus bisa delete module

## Troubleshooting

### Error: "Class 'App\Http\Middleware\EnsureUserIsStaff' not found"

**Solusi:**
1. Pastikan file `EnsureUserIsStaff.php` ada di folder `app/Http/Middleware/`
2. Jalankan `composer dump-autoload`
3. Clear cache: `php artisan config:clear`

### Error: 403 Unauthorized

**Kemungkinan:**
1. User bukan Super Admin atau Educator
2. Token tidak valid
3. Middleware tidak ter-load

**Solusi:**
1. Check role user di database:
   ```sql
   SELECT id, name, email, role FROM users WHERE email = 'your-email@example.com';
   ```
2. Pastikan role adalah `super_admin` atau `educator`
3. Check token di request header
4. Re-login untuk mendapatkan token baru

### Error: "Route [admin/modules] not defined"

**Solusi:**
1. Clear route cache:
   ```bash
   php artisan route:clear
   php artisan route:cache
   ```
2. Check file `routes/api.php` pastikan route ada
3. Check middleware alias di `bootstrap/app.php`

### Error: "Call to undefined function storage_url()"

**Solusi:**
1. Pastikan file `app/Helpers/StorageHelper.php` ada
2. Jalankan `composer dump-autoload`
3. Clear cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

### CRUD masih tidak bekerja setelah semua fix

**Checklist:**
1. ✅ File middleware `EnsureUserIsStaff.php` sudah di-upload
2. ✅ `composer dump-autoload` sudah dijalankan
3. ✅ User role adalah `super_admin` atau `educator`
4. ✅ Token authentication valid
5. ✅ Route sudah terdaftar (check dengan `php artisan route:list`)
6. ✅ CORS sudah dikonfigurasi dengan benar
7. ✅ File `.env` sudah di-set dengan benar

**Debug Steps:**
1. Check error log:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. Test route langsung:
   ```bash
   php artisan route:list | grep modules
   ```

3. Test middleware:
   - Login dan check response `/api/user`
   - Pastikan `role` field ada dan benar

4. Test dengan Postman/curl:
   ```bash
   curl -X GET https://yourdomain.com/api/admin/modules \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json"
   ```

## File yang Perlu Di-upload

Pastikan file berikut sudah di-upload ke cPanel:

```
backend/
├── app/
│   ├── Http/
│   │   └── Middleware/
│   │       └── EnsureUserIsStaff.php  ← FILE BARU
│   └── Helpers/
│       └── StorageHelper.php  ← SUDAH ADA
├── composer.json  ← SUDAH UPDATE
└── routes/
    └── api.php  ← SUDAH ADA
```

## Quick Fix Command

Jika semua file sudah di-upload, jalankan:

```bash
cd ~/public_html/backend
composer dump-autoload
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan route:cache
```

## Catatan Penting

1. **Jangan lupa upload file middleware** - File ini penting untuk CRUD modul
2. **Rebuild autoload setelah upload** - Agar Laravel mengenali file baru
3. **Check user role** - Pastikan user adalah Super Admin atau Educator
4. **Clear cache** - Setelah perubahan, selalu clear cache
5. **Test di staging dulu** - Sebelum deploy ke production

## Support

Jika masih ada masalah:
1. Check error log: `storage/logs/laravel.log`
2. Check browser console untuk error
3. Test dengan Postman untuk isolate masalah
4. Pastikan semua file sudah di-upload dengan benar

