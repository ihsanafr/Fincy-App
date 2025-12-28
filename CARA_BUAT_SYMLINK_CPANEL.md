# Cara Membuat Symbolic Link di cPanel untuk Laravel

Panduan lengkap cara membuat symbolic link `public/storage` ke `storage/app/public` di cPanel.

## ⚠️ Penting

Symbolic link diperlukan agar gambar yang di-upload bisa diakses melalui URL `https://yourdomain.com/storage/...`. Tanpa symlink, gambar tidak akan bisa diakses.

## Metode 1: Via SSH (Paling Mudah) ⭐ Recommended

Jika cPanel Anda memiliki akses SSH:

### Langkah-langkah:

1. **Login ke SSH cPanel**
   ```bash
   ssh username@yourdomain.com
   # atau
   ssh username@yourdomain.com -p 2222
   ```

2. **Navigate ke folder Laravel**
   ```bash
   cd ~/public_html/backend
   # atau sesuai path Laravel Anda
   ```

3. **Hapus folder storage jika sudah ada (jika ada)**
   ```bash
   rm -rf public/storage
   ```

4. **Buat symbolic link**
   ```bash
   php artisan storage:link
   ```

   Atau manual:
   ```bash
   ln -s ../storage/app/public public/storage
   ```

5. **Verifikasi symlink berhasil**
   ```bash
   ls -la public/storage
   ```
   
   Output harus menunjukkan:
   ```
   lrwxrwxrwx 1 username username   25 Dec 23 10:00 storage -> ../storage/app/public
   ```

## Metode 2: Via cPanel Terminal

Jika cPanel memiliki fitur Terminal:

1. **Login ke cPanel**
2. **Buka "Terminal" atau "Advanced" → "Terminal"**
3. **Jalankan perintah:**
   ```bash
   cd ~/public_html/backend
   php artisan storage:link
   ```

## Metode 3: Via cPanel File Manager

### Opsi A: Jika File Manager Support Symlink

1. **Login ke cPanel**
2. **Buka "File Manager"**
3. **Navigate ke folder `public`** (di dalam folder Laravel Anda)
4. **Klik "Link" atau "Create Symbolic Link"** (tergantung versi cPanel)
5. **Isi:**
   - **Link Name:** `storage`
   - **Target Path:** `../storage/app/public`
   - **Location:** `public/`
6. **Klik "Create Link"**

### Opsi B: Manual via File Manager

Jika tidak ada opsi "Link", coba:

1. **Buka File Manager**
2. **Enable "Show Hidden Files"** (Settings → Show Hidden Files)
3. **Navigate ke folder `public`**
4. **Cari opsi "Create Link" atau "Symlink"** di toolbar
5. **Ikuti langkah di Opsi A**

## Metode 4: Via .htaccess (Alternatif jika Symlink Tidak Didukung)

Jika hosting tidak mendukung symlink, gunakan `.htaccess` redirect:

1. **Buat file `.htaccess` di folder `public/storage/`** (buat folder dulu jika belum ada)

2. **Isi dengan:**
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /storage/
       RewriteRule ^(.*)$ ../../storage/app/public/$1 [L]
   </IfModule>
   ```

3. **Atau buat route di Laravel** (sudah ada di `routes/web.php`):
   ```php
   Route::get('/storage/{path}', function ($path) {
       $filePath = storage_path('app/public/' . $path);
       if (!file_exists($filePath)) {
           abort(404);
       }
       return response()->file($filePath);
   })->where('path', '.*');
   ```

## Metode 5: Copy Files (Temporary Solution - Tidak Recommended)

⚠️ **Hanya gunakan jika semua metode di atas tidak bekerja!**

Ini bukan symlink, tapi copy manual. File baru harus di-copy manual setiap kali ada upload.

1. **Via File Manager:**
   - Buka folder `storage/app/public`
   - Copy semua isinya
   - Paste ke folder `public/storage`

2. **Via SSH:**
   ```bash
   cp -r storage/app/public/* public/storage/
   ```

## Verifikasi Symlink Berhasil

### 1. Check via File Manager

1. Buka File Manager
2. Navigate ke `public/`
3. Lihat folder `storage`
4. Jika ada icon "link" atau "shortcut", berarti symlink berhasil

### 2. Check via Browser

1. Upload gambar (profile photo atau payment proof)
2. Buka URL gambar di browser:
   ```
   https://yourdomain.com/backend/storage/profile_photos/xxx.jpg
   ```
3. Jika gambar muncul, symlink berhasil!

### 3. Check via SSH

```bash
ls -la public/storage
```

Output harus menunjukkan arrow `->` menunjuk ke `../storage/app/public`

## Troubleshooting

### Error: "Permission denied"

**Solusi:**
```bash
chmod 755 public
chmod 755 storage
chmod 755 storage/app
chmod 755 storage/app/public
```

### Error: "File exists"

**Solusi:**
```bash
# Hapus folder/file yang sudah ada
rm -rf public/storage

# Buat symlink baru
php artisan storage:link
```

### Symlink tidak bekerja di cPanel

**Kemungkinan:**
1. Hosting tidak support symlink
2. Permission tidak cukup
3. Path salah

**Solusi:**
- Gunakan Metode 4 (`.htaccess` atau route)
- Hubungi support hosting untuk enable symlink
- Gunakan Metode 5 (copy manual) sebagai last resort

### Gambar masih tidak muncul setelah symlink

**Checklist:**
1. ✅ Symlink sudah dibuat
2. ✅ `APP_URL` di `.env` sudah benar
3. ✅ Permission folder `storage` sudah benar (775)
4. ✅ File benar-benar ada di `storage/app/public/`
5. ✅ CORS sudah dikonfigurasi (lihat `FIX_CORS_ERROR.md`)

## Path yang Benar

Pastikan struktur folder seperti ini:

```
backend/
├── public/
│   ├── index.php
│   └── storage -> ../storage/app/public  (ini symlink)
├── storage/
│   └── app/
│       └── public/
│           ├── profile_photos/
│           ├── payment_proofs/
│           ├── module_thumbnails/
│           └── content_images/
└── ...
```

## Catatan Penting

1. **Jangan hapus folder `storage/app/public`** - ini adalah folder asli
2. **Jangan hapus symlink `public/storage`** - ini adalah link ke folder asli
3. **Backup dulu** sebelum membuat perubahan
4. **Test upload gambar** setelah symlink dibuat
5. **Jika masih error**, check error log di `storage/logs/laravel.log`

## Quick Command Reference

```bash
# Buat symlink
php artisan storage:link

# Atau manual
ln -s ../storage/app/public public/storage

# Check symlink
ls -la public/storage

# Hapus dan buat ulang
rm public/storage
php artisan storage:link

# Fix permission
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

## Support

Jika masih ada masalah:
1. Check error log: `storage/logs/laravel.log`
2. Check browser console untuk error
3. Hubungi support hosting untuk bantuan SSH atau symlink
4. Gunakan route fallback yang sudah dibuat di `routes/web.php`

