# 📦 Panduan Deploy Backend ke cPanel

## Step-by-Step Guide

### 1. Persiapan File

1. **Buat file `.env` untuk production** (jangan upload `.env` dari local):
   ```env
   APP_NAME=Fincy
   APP_ENV=production
   APP_KEY=base64:YOUR_APP_KEY_HERE
   APP_DEBUG=false
   APP_URL=https://api.yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_database_user
   DB_PASSWORD=your_database_password

   SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com,your-app.vercel.app
   SESSION_DOMAIN=.yourdomain.com
   ```

2. **File yang perlu di-upload**:
   - ✅ `app/`
   - ✅ `bootstrap/`
   - ✅ `config/`
   - ✅ `database/`
   - ✅ `public/`
   - ✅ `resources/`
   - ✅ `routes/`
   - ✅ `storage/`
   - ✅ `composer.json`
   - ✅ `composer.lock`
   - ❌ `vendor/` (install via composer di cPanel)
   - ❌ `node_modules/`
   - ❌ `.git/`
   - ❌ `.env` (buat manual di cPanel)

### 2. Upload ke cPanel

1. Login ke cPanel
2. Buka **File Manager**
3. Navigate ke `public_html/` atau buat folder `api/`
4. Upload file backend (zip dan extract)

### 3. Setup Database

1. Buka **MySQL Databases** di cPanel
2. Buat database baru: `fincy_db`
3. Buat user baru: `fincy_user`
4. Berikan akses user ke database
5. Catat credentials untuk `.env`

### 4. Install Dependencies

**Via Terminal/SSH** (jika tersedia):
```bash
cd public_html/api  # atau path ke folder backend
composer install --no-dev --optimize-autoloader
```

**Atau via cPanel Terminal**:
- Buka **Terminal** di cPanel
- Navigate ke folder backend
- Jalankan `composer install`

### 5. Setup Environment

1. Di File Manager, buka folder backend
2. Buat file `.env` (copy dari `.env.example` jika ada)
3. Edit dengan informasi database dan konfigurasi production
4. Generate APP_KEY:
   ```bash
   php artisan key:generate
   ```

### 6. Run Migrations & Seeders

```bash
php artisan migrate --force
php artisan db:seed --class=SuperAdminSeeder
php artisan db:seed --class=EducatorSeeder
php artisan db:seed --class=DefaultCategoriesSeeder
```

### 7. Setup Storage

```bash
php artisan storage:link
```

**Set permissions** (via File Manager):
- `storage/` → 775
- `bootstrap/cache/` → 775

### 8. Optimize Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 9. Setup Public Folder

**Opsi A: Subdomain `api.yourdomain.com`**
1. Buat subdomain di cPanel
2. Point ke folder `backend/public/`
3. Update `.env`: `APP_URL=https://api.yourdomain.com`

**Opsi B: Folder di public_html**
1. Copy isi `backend/public/` ke `public_html/api/`
2. Edit `public_html/api/index.php`:
   ```php
   require __DIR__.'/../../backend/vendor/autoload.php';
   $app = require_once __DIR__.'/../../backend/bootstrap/app.php';
   ```

### 10. Update CORS Config

Edit `backend/config/cors.php`:
```php
'allowed_origins' => [
    'https://your-app.vercel.app',
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

### 11. Test API

Buka browser:
```
https://api.yourdomain.com/api/modules
```

Harus return JSON, bukan error.

---

## 🔧 Troubleshooting

### Error: 500 Internal Server Error
- Cek error log di cPanel
- Pastikan `.env` sudah benar
- Pastikan `storage/` dan `bootstrap/cache/` writable
- Run: `php artisan config:clear`

### Error: Class not found
- Run: `composer dump-autoload`
- Pastikan `vendor/` sudah terinstall

### Error: Permission denied
- Set permissions: `storage/` dan `bootstrap/cache/` → 775
- Via File Manager: Right click → Change Permissions

### Error: Database connection failed
- Cek credentials di `.env`
- Pastikan database dan user sudah dibuat
- Pastikan user punya akses ke database

---

## ✅ Checklist

- [ ] File backend di-upload
- [ ] Database dibuat
- [ ] `.env` dikonfigurasi
- [ ] `composer install` dijalankan
- [ ] Migrations dijalankan
- [ ] Seeders dijalankan
- [ ] `storage:link` dijalankan
- [ ] Permissions di-set
- [ ] CORS dikonfigurasi
- [ ] API endpoint bisa diakses

