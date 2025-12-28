# Fix Masalah Image Storage di cPanel

Dokumen ini menjelaskan cara memperbaiki masalah upload dan retrieve gambar setelah deploy ke cPanel.

## Masalah

Setelah deploy backend Laravel ke cPanel dan frontend React ke Vercel, gambar tidak bisa di-upload atau di-retrieve karena:

1. **Storage symlink tidak ada**: Laravel memerlukan symlink dari `public/storage` ke `storage/app/public`
2. **URL tidak absolute**: URL gambar perlu menggunakan domain lengkap backend
3. **Konfigurasi APP_URL**: Environment variable `APP_URL` harus di-set dengan benar

## Solusi yang Sudah Diterapkan

### 1. Helper Function `storage_url()`

Sudah dibuat helper function `storage_url()` di `backend/app/Helpers/StorageHelper.php` yang:
- Menggunakan `Storage::disk('public')->url()` untuk generate URL
- Memastikan URL selalu absolute (full URL dengan domain)
- Menggunakan `APP_URL` dari `.env` jika diperlukan

### 2. Update Semua Controller

Semua controller sudah di-update untuk menggunakan `storage_url()` instead of `asset('storage/...')`:
- `AuthController.php`
- `ProfileController.php`
- `ModuleController.php`
- `AdminModuleController.php`
- `FinanceToolsController.php`
- `QuizController.php`
- `AdminContentController.php`

### 3. Route Fallback untuk Images

Route `/storage/{path}` sudah ditambahkan di `routes/web.php` sebagai fallback jika symlink tidak bekerja.

## Langkah Setup di cPanel

### 1. Pastikan Storage Symlink Ada

**Via SSH (Recommended):**
```bash
cd /path/to/your/laravel/project
php artisan storage:link
```

**Via cPanel File Manager:**
1. Login ke cPanel
2. Buka File Manager
3. Navigate ke folder `public` di root project Laravel
4. Buat symlink:
   - Klik "Link" atau "Create Symbolic Link"
   - Source: `../storage/app/public`
   - Link name: `storage`
   - Pastikan symlink dibuat di folder `public`

**Atau via Terminal cPanel:**
```bash
ln -s /home/username/public_html/backend/storage/app/public /home/username/public_html/backend/public/storage
```

### 2. Set Environment Variable APP_URL

Edit file `.env` di cPanel:

```env
APP_URL=https://yourdomain.com/backend
# atau jika backend di subdomain:
APP_URL=https://api.yourdomain.com
```

**Penting:** 
- Pastikan `APP_URL` menggunakan HTTPS jika website menggunakan SSL
- Jangan ada trailing slash di akhir URL
- Ganti `yourdomain.com` dengan domain Anda yang sebenarnya

### 3. Set Permission untuk Storage

Pastikan folder `storage` dan `storage/app/public` memiliki permission yang benar:

```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

Atau via cPanel File Manager:
- Klik kanan folder `storage` → Change Permissions → Set ke `775`
- Klik kanan folder `bootstrap/cache` → Change Permissions → Set ke `775`

### 4. Pastikan Folder Storage/app/public Ada

Pastikan folder berikut ada dan bisa di-write:
- `storage/app/public`
- `storage/app/public/profile_photos`
- `storage/app/public/payment_proofs`
- `storage/app/public/module_thumbnails`
- `storage/app/public/content_images`

### 5. Rebuild Autoload

Setelah update code, jalankan:

```bash
composer dump-autoload
```

## Testing

### Test Upload Image

1. Login ke aplikasi
2. Upload profile photo atau payment proof
3. Check apakah file tersimpan di `storage/app/public/`
4. Check response API apakah URL gambar sudah absolute (menggunakan domain lengkap)

### Test Retrieve Image

1. Buka URL gambar langsung di browser
2. URL harus bisa diakses, contoh:
   - `https://yourdomain.com/backend/storage/profile_photos/xxx.jpg`
   - atau `https://yourdomain.com/backend/public/storage/profile_photos/xxx.jpg`

## Troubleshooting

### Gambar tidak muncul setelah upload

1. **Check symlink:**
   ```bash
   ls -la public/storage
   ```
   Harus menunjukkan symlink ke `../storage/app/public`

2. **Check APP_URL di .env:**
   Pastikan `APP_URL` sudah di-set dengan benar

3. **Check permission:**
   Pastikan folder `storage` bisa di-write

4. **Check file exists:**
   Pastikan file benar-benar ada di `storage/app/public/`

### Error 404 saat akses gambar

1. **Check route fallback:**
   Pastikan route `/storage/{path}` ada di `routes/web.php`

2. **Check .htaccess:**
   Pastikan `.htaccess` di `public` folder tidak memblokir akses ke storage

3. **Check cPanel settings:**
   Beberapa hosting memblokir symlink, hubungi support hosting

### URL masih relative bukan absolute

1. **Check helper function:**
   Pastikan `storage_url()` digunakan di semua controller

2. **Check APP_URL:**
   Pastikan `APP_URL` di `.env` sudah di-set

3. **Clear config cache:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

## Catatan Penting

1. **Jangan commit file .env** ke repository
2. **Backup database** sebelum melakukan perubahan
3. **Test di staging** sebelum deploy ke production
4. **Monitor error logs** di `storage/logs/laravel.log`

## Support

Jika masih ada masalah:
1. Check error logs di `storage/logs/laravel.log`
2. Check browser console untuk error CORS atau 404
3. Check network tab di browser untuk melihat request/response
4. Pastikan CORS sudah dikonfigurasi dengan benar (lihat `FIX_CORS_ERROR.md`)

