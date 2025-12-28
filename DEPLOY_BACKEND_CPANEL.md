# 🚀 Panduan Deploy Backend ke cPanel

Panduan lengkap untuk deploy backend Fincy ke cPanel dengan domain: **https://fincy.ihsanafr.my.id/**

---

## 📋 Prerequisites

Sebelum mulai, pastikan Anda memiliki:
- ✅ Akses cPanel hosting
- ✅ Domain: `fincy.ihsanafr.my.id` sudah di-point ke cPanel
- ✅ Database MySQL di cPanel
- ✅ PHP >= 8.2 di cPanel
- ✅ Composer access (via Terminal/SSH)

---

## 📦 Step 1: Persiapan File Backend

### 1.1 File yang Perlu Di-upload

**File/Folder yang HARUS di-upload:**
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

**File/Folder yang TIDAK perlu di-upload:**
- ❌ `vendor/` (akan diinstall via composer)
- ❌ `node_modules/`
- ❌ `.git/`
- ❌ `.env` (buat manual di cPanel)
- ❌ `tests/`

### 1.2 Kompres File

1. Di local, buat folder baru (misalnya `fincy-backend-deploy`)
2. Copy semua file yang diperlukan ke folder tersebut
3. Kompres menjadi ZIP file

---

## 📤 Step 2: Upload ke cPanel

### 2.1 Login ke cPanel

1. Login ke cPanel hosting Anda
2. Buka **File Manager**

### 2.2 Upload File

1. Navigate ke `public_html/`
2. **Opsi A**: Upload langsung ke `public_html/` (untuk root domain)
   - Upload dan extract ZIP file
   - Struktur: `public_html/app/`, `public_html/config/`, dll.

3. **Opsi B**: Buat subfolder (jika ingin terpisah)
   - Buat folder `api/` di `public_html/`
   - Upload dan extract ke `public_html/api/`

**Rekomendasi**: Gunakan **Opsi A** untuk domain root `fincy.ihsanafr.my.id`

### 2.3 Struktur Folder Setelah Upload

```
public_html/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/
│   ├── index.php
│   └── .htaccess
├── resources/
├── routes/
├── storage/
├── composer.json
└── composer.lock
```

---

## 🗄️ Step 3: Setup Database

### 3.1 Buat Database

1. Di cPanel, buka **MySQL Databases**
2. Buat database baru:
   - Database Name: `fincy_db` (atau nama lain)
   - Catat nama lengkap: `username_fincy_db`
3. Buat user baru:
   - Username: `fincy_user` (atau nama lain)
   - Password: Buat password yang kuat
   - Catat username lengkap: `username_fincy_user`
4. **Add User to Database**:
   - Pilih user yang baru dibuat
   - Pilih database yang baru dibuat
   - Klik **Add**
   - Berikan **ALL PRIVILEGES**
   - Klik **Make Changes**

### 3.2 Catat Database Credentials

```
DB_DATABASE=username_fincy_db
DB_USERNAME=username_fincy_user
DB_PASSWORD=your_password_here
```

---

## ⚙️ Step 4: Setup Environment (.env)

### 4.1 Buat File .env

1. Di File Manager, buka folder `public_html/`
2. Buat file baru bernama `.env`
3. Edit file `.env` dengan konfigurasi berikut:

```env
APP_NAME=Fincy
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://fincy.ihsanafr.my.id

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=username_fincy_db
DB_USERNAME=username_fincy_user
DB_PASSWORD=your_password_here

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

SANCTUM_STATEFUL_DOMAINS=fincy.ihsanafr.my.id,www.fincy.ihsanafr.my.id,your-app.vercel.app
SESSION_DOMAIN=.fincy.ihsanafr.my.id

CORS_ALLOWED_ORIGINS=https://fincy.ihsanafr.my.id,https://www.fincy.ihsanafr.my.id,https://your-app.vercel.app
```

**Ganti:**
- `username_fincy_db` → Nama database lengkap Anda
- `username_fincy_user` → Username database lengkap Anda
- `your_password_here` → Password database Anda
- `your-app.vercel.app` → URL Vercel frontend Anda

### 4.2 Generate APP_KEY

1. Buka **Terminal** di cPanel (atau gunakan SSH)
2. Navigate ke folder backend:
   ```bash
   cd public_html
   ```
3. Generate APP_KEY:
   ```bash
   php artisan key:generate
   ```
4. Copy `APP_KEY` yang dihasilkan
5. Edit `.env` dan paste `APP_KEY` yang dihasilkan

---

## 📦 Step 5: Install Dependencies

### 5.1 Install Composer Dependencies

Via Terminal/SSH di cPanel:

```bash
cd public_html
composer install --no-dev --optimize-autoloader
```

**Jika composer tidak tersedia:**
- Download composer.phar:
  ```bash
  curl -sS https://getcomposer.org/installer | php
  ```
- Install dependencies:
  ```bash
  php composer.phar install --no-dev --optimize-autoloader
  ```

---

## 🗃️ Step 6: Setup Database

### 6.1 Run Migrations

```bash
cd public_html
php artisan migrate --force
```

### 6.2 Run Seeders

```bash
php artisan db:seed --class=SuperAdminSeeder
php artisan db:seed --class=EducatorSeeder
php artisan db:seed --class=DefaultCategoriesSeeder
```

**Default Credentials:**
- **Super Admin**: `admin@fincy.com` / `admin123`
- **Educator**: `educator@fincy.com` / `educator123`

---

## 📁 Step 7: Setup Storage

### 7.1 Create Storage Link

```bash
php artisan storage:link
```

### 7.2 Set Permissions

Via File Manager:
1. Right click folder `storage/` → **Change Permissions**
2. Set ke **775** (rwxrwxr-x)
3. Right click folder `bootstrap/cache/` → **Change Permissions**
4. Set ke **775** (rwxrwxr-x)

---

## 🔧 Step 8: Konfigurasi PHP

### 8.1 Set PHP Version

1. Di cPanel, buka **Select PHP Version**
2. Pilih **PHP 8.2** atau lebih tinggi
3. Enable extensions:
   - ✅ `mysqli`
   - ✅ `pdo_mysql`
   - ✅ `mbstring`
   - ✅ `openssl`
   - ✅ `fileinfo`
   - ✅ `gd` (untuk image processing)
   - ✅ `zip`
   - ✅ `curl`

### 8.2 Update PHP Settings (jika perlu)

Di **Select PHP Version** → **Options**:
- `upload_max_filesize`: 10M
- `post_max_size`: 10M
- `memory_limit`: 256M
- `max_execution_time`: 300

---

## 🌐 Step 9: Setup Public Folder

### 9.1 Edit public/index.php

File `public/index.php` harus point ke folder yang benar:

```php
<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
```

### 9.2 Buat .htaccess di public/

File `public/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### 9.3 Setup Domain Root (Penting!)

**Jika domain root point ke `public_html/`:**

1. Di cPanel, buka **File Manager**
2. Edit file `.htaccess` di root `public_html/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_URI} !^/public/
    RewriteRule ^(.*)$ /public/$1 [L]
</IfModule>
```

**Atau setup subdomain `api.fincy.ihsanafr.my.id`:**

1. Di cPanel, buka **Subdomains**
2. Buat subdomain: `api`
3. Document Root: `public_html/api/public`
4. Update `.env`: `APP_URL=https://api.fincy.ihsanafr.my.id`

---

## 🔒 Step 10: Konfigurasi CORS

### 10.1 Update config/cors.php

Pastikan file `config/cors.php` sudah menggunakan environment variable (sudah diupdate sebelumnya):

```php
'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000'))),
```

### 10.2 Update .env

Pastikan di `.env`:
```env
CORS_ALLOWED_ORIGINS=https://fincy.ihsanafr.my.id,https://www.fincy.ihsanafr.my.id,https://your-app.vercel.app
```

---

## ⚡ Step 11: Optimize Laravel

```bash
cd public_html
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## ✅ Step 12: Test API

### 12.1 Test Endpoint

Buka browser dan test:
```
https://fincy.ihsanafr.my.id/api/modules
```

**Expected Response:**
```json
[]
```
atau array of modules jika sudah ada data.

**Jika Error:**
- Cek error log di cPanel
- Pastikan `.env` sudah benar
- Pastikan database sudah di-setup
- Pastikan `storage/` dan `bootstrap/cache/` writable

---

## 🔗 Step 13: Hubungkan Frontend ke Backend

### 13.1 Update Vercel Environment Variable

1. Login ke **Vercel Dashboard**
2. Buka project frontend Anda
3. Klik **Settings** → **Environment Variables
4. Update atau tambahkan:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://fincy.ihsanafr.my.id/api`
   - **Environment**: Production, Preview, Development

### 13.2 Redeploy Frontend

1. Di Vercel Dashboard, klik **Deployments**
2. Klik **Redeploy** pada deployment terbaru
3. Atau push commit baru ke GitHub (auto-deploy)

---

## 🧪 Step 14: Testing

### 14.1 Test Frontend

1. Buka frontend di Vercel
2. Buka browser console (F12)
3. Test fitur:
   - ✅ Login/Register
   - ✅ Browse modules
   - ✅ View module details
   - ✅ Finance Tools (jika sudah subscribe)

### 14.2 Test API Directly

Test beberapa endpoint:
```
https://fincy.ihsanafr.my.id/api/modules
https://fincy.ihsanafr.my.id/api/finance-tools/status
```

---

## 🐛 Troubleshooting

### Error: 500 Internal Server Error

**Solution:**
1. Cek error log di cPanel: **Errors** atau **Error Log**
2. Pastikan `.env` sudah benar
3. Pastikan `APP_KEY` sudah di-generate
4. Clear cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   php artisan view:clear
   ```
5. Re-optimize:
   ```bash
   php artisan config:cache
   php artisan route:cache
   ```

### Error: Database Connection Failed

**Solution:**
1. Cek credentials di `.env`
2. Pastikan database dan user sudah dibuat
3. Pastikan user punya akses ke database
4. Test connection via phpMyAdmin

### Error: Permission Denied (Storage)

**Solution:**
1. Set permissions `storage/` → 775
2. Set permissions `bootstrap/cache/` → 775
3. Pastikan `storage/app/public/` ada dan writable

### Error: CORS Error di Frontend

**Solution:**
1. Pastikan `CORS_ALLOWED_ORIGINS` di `.env` include URL Vercel
2. Clear config cache:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```
3. Pastikan `supports_credentials: true` di `config/cors.php`

### Error: File Upload Tidak Bekerja

**Solution:**
1. Pastikan `storage/app/public/` writable (775)
2. Pastikan `php artisan storage:link` sudah dijalankan
3. Cek `config/filesystems.php` disk configuration

---

## ✅ Checklist Deploy

- [ ] File backend di-upload ke cPanel
- [ ] Database dibuat dan dikonfigurasi
- [ ] File `.env` dibuat dengan konfigurasi production
- [ ] `composer install` dijalankan
- [ ] `php artisan key:generate` dijalankan
- [ ] Migrations dijalankan
- [ ] Seeders dijalankan
- [ ] `php artisan storage:link` dijalankan
- [ ] Permissions di-set (storage, bootstrap/cache)
- [ ] PHP version dan extensions di-set
- [ ] `.htaccess` di-setup
- [ ] CORS dikonfigurasi
- [ ] Laravel di-optimize
- [ ] API endpoint bisa diakses
- [ ] Vercel environment variable di-update
- [ ] Frontend di-redeploy
- [ ] Testing berhasil

---

## 📝 Catatan Penting

1. **Security**:
   - Jangan commit `.env` ke Git
   - Pastikan `APP_DEBUG=false` di production
   - Gunakan password database yang kuat

2. **Performance**:
   - Selalu run `php artisan config:cache` setelah update `.env`
   - Enable OPcache jika tersedia
   - Monitor error logs secara berkala

3. **Backup**:
   - Backup database secara berkala
   - Backup file `storage/` jika ada upload penting

---

**Selamat deploy! 🎉**

Setelah semua step selesai, backend Anda akan accessible di:
**https://fincy.ihsanafr.my.id/api**

