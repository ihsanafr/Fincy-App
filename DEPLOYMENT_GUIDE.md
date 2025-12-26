# 🚀 Panduan Deploy Fincy App

Panduan lengkap untuk deploy Fincy App ke production:
- **Frontend**: Vercel
- **Backend**: cPanel

---

## 📋 Prerequisites

Sebelum deploy, pastikan Anda memiliki:
- ✅ Akun Vercel (gratis di [vercel.com](https://vercel.com))
- ✅ Akun cPanel hosting dengan PHP >= 8.2
- ✅ Database MySQL di cPanel
- ✅ Domain (opsional, bisa pakai subdomain)

---

## 🎯 Part 1: Deploy Backend ke cPanel

### Step 1: Persiapan File Backend

1. **Buat file `.env` untuk production** di folder `backend/`:

```env
APP_NAME=Fincy
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com,vercel.app
SESSION_DOMAIN=.yourdomain.com

CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://your-app.vercel.app
```

2. **Generate APP_KEY**:
```bash
cd backend
php artisan key:generate
```
Copy `APP_KEY` yang dihasilkan ke file `.env` production.

### Step 2: Upload ke cPanel

1. **Kompres folder backend** (kecuali `node_modules`, `vendor`, `.git`):
   - Buat file `.cpanelignore` atau zip manual
   - Folder yang perlu di-upload:
     - `app/`
     - `bootstrap/`
     - `config/`
     - `database/`
     - `public/`
     - `resources/`
     - `routes/`
     - `storage/`
     - `composer.json`
     - `composer.lock`
     - `.env` (buat di cPanel, jangan upload dari local)

2. **Upload ke cPanel**:
   - Login ke cPanel
   - Buka **File Manager**
   - Navigate ke `public_html/` atau buat folder `api/`
   - Upload dan extract file backend

### Step 3: Setup Database di cPanel

1. **Buat Database**:
   - Buka **MySQL Databases** di cPanel
   - Buat database baru (contoh: `fincy_db`)
   - Buat user baru dan berikan akses ke database
   - Catat: `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

2. **Import Database** (jika ada):
   - Buka **phpMyAdmin**
   - Pilih database yang baru dibuat
   - Import SQL file atau jalankan migrations

### Step 4: Konfigurasi cPanel

1. **Set PHP Version**:
   - Buka **Select PHP Version**
   - Pilih PHP 8.2 atau lebih tinggi
   - Enable extensions: `mysqli`, `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`

2. **Setup .env File**:
   - Di File Manager, buka folder backend
   - Buat file `.env` (copy dari `.env.example` jika ada)
   - Edit dengan informasi database dan konfigurasi production

3. **Install Dependencies**:
   - Buka **Terminal** di cPanel (jika tersedia)
   - Atau gunakan SSH:
   ```bash
   cd public_html/api  # atau path ke folder backend
   composer install --no-dev --optimize-autoloader
   ```

4. **Jalankan Migrations**:
   ```bash
   php artisan migrate --force
   php artisan db:seed --class=SuperAdminSeeder
   php artisan db:seed --class=EducatorSeeder
   php artisan db:seed --class=DefaultCategoriesSeeder
   ```

5. **Setup Storage Link**:
   ```bash
   php artisan storage:link
   ```

6. **Optimize Laravel**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

### Step 5: Konfigurasi Public Folder

1. **Pindahkan isi `public/` ke root**:
   - Di cPanel, biasanya struktur harus:
   ```
   public_html/
   ├── index.php
   ├── .htaccess
   └── ...
   ```
   - Atau setup subdomain `api.yourdomain.com` yang point ke folder `backend/public/`

2. **Edit `public/index.php`** (jika perlu):
   ```php
   require __DIR__.'/../vendor/autoload.php';
   $app = require_once __DIR__.'/../bootstrap/app.php';
   ```

3. **Buat `.htaccess` di `public/`**:
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

### Step 6: Setup CORS

Edit `backend/config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],

'allowed_methods' => ['*'],

'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://your-app.vercel.app',
],

'allowed_origins_patterns' => [],

'allowed_headers' => ['*'],

'exposed_headers' => [],

'max_age' => 0,

'supports_credentials' => true,
```

### Step 7: Test API

1. **Test endpoint**:
   ```
   https://api.yourdomain.com/api/modules
   ```

2. **Pastikan response JSON** (bukan error)

---

## 🎨 Part 2: Deploy Frontend ke Vercel

### Step 1: Persiapan Frontend

1. **Buat file `vercel.json`** di root folder `frontend/`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://api.yourdomain.com/api"
  }
}
```

2. **Update `vite.config.js`** untuk production:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})
```

3. **Update `frontend/src/services/api.js`** untuk menggunakan environment variable:

```js
// Pastikan menggunakan VITE_API_URL dari environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Penting untuk Sanctum
})
```

### Step 2: Deploy ke Vercel

#### Opsi A: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy? **Yes**
   - Which scope? Pilih akun Anda
   - Link to existing project? **No** (untuk pertama kali)
   - Project name? `fincy-frontend`
   - Directory? `./`
   - Override settings? **No**

5. **Set Environment Variables**:
   ```bash
   vercel env add VITE_API_URL
   # Masukkan: https://api.yourdomain.com/api
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

#### Opsi B: Deploy via GitHub (Recommended)

1. **Push code ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/fincy-app.git
   git push -u origin main
   ```

2. **Import Project di Vercel**:
   - Login ke [vercel.com](https://vercel.com)
   - Klik **Add New Project**
   - Import dari GitHub repository
   - Pilih repository `fincy-app`

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variables**:
   - Klik **Environment Variables**
   - Tambahkan:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://api.yourdomain.com/api`
     - **Environment**: Production, Preview, Development

5. **Deploy**:
   - Klik **Deploy**
   - Tunggu proses build selesai

### Step 3: Setup Custom Domain (Opsional)

1. **Di Vercel Dashboard**:
   - Buka project
   - Klik **Settings** > **Domains**
   - Tambahkan domain: `yourdomain.com` dan `www.yourdomain.com`

2. **Update DNS**:
   - Tambahkan CNAME record:
     - Name: `@` → Value: `cname.vercel-dns.com`
     - Name: `www` → Value: `cname.vercel-dns.com`

3. **Update CORS di Backend**:
   - Tambahkan domain baru ke `allowed_origins` di `config/cors.php`

---

## 🔧 Part 3: Konfigurasi Final

### 1. Update Frontend API URL

Pastikan `frontend/src/services/api.js` menggunakan environment variable:

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
```

### 2. Update Backend CORS

Pastikan `backend/config/cors.php` mengizinkan domain Vercel:

```php
'allowed_origins' => [
    'https://your-app.vercel.app',
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

### 3. Update Sanctum Config

Pastikan `backend/config/sanctum.php`:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

### 4. Test Deployment

1. **Test Frontend**:
   - Buka URL Vercel
   - Coba login/register
   - Test fitur-fitur utama

2. **Test API**:
   - Buka browser console
   - Cek network requests ke API
   - Pastikan tidak ada CORS error

3. **Test File Upload**:
   - Upload profile photo
   - Upload payment proof
   - Pastikan file tersimpan di storage

---

## 🐛 Troubleshooting

### Problem: CORS Error

**Solution**:
- Pastikan `allowed_origins` di `config/cors.php` sesuai dengan domain frontend
- Pastikan `SANCTUM_STATEFUL_DOMAINS` di `.env` benar
- Clear cache: `php artisan config:clear`

### Problem: 500 Error di Backend

**Solution**:
- Cek error log di cPanel
- Pastikan `.env` sudah benar
- Pastikan `storage/` dan `bootstrap/cache/` writable
- Run: `php artisan config:clear && php artisan cache:clear`

### Problem: File Upload Tidak Bekerja

**Solution**:
- Pastikan `storage/app/public` writable (chmod 775)
- Pastikan `php artisan storage:link` sudah dijalankan
- Cek `config/filesystems.php` disk configuration

### Problem: Frontend Tidak Connect ke API

**Solution**:
- Pastikan `VITE_API_URL` di Vercel sudah di-set
- Rebuild frontend setelah set environment variable
- Cek browser console untuk error details

### Problem: Session/Cookie Tidak Bekerja

**Solution**:
- Pastikan `SESSION_DOMAIN` di `.env` benar
- Pastikan `withCredentials: true` di axios config
- Pastikan `supports_credentials: true` di CORS config

---

## 📝 Checklist Deploy

### Backend (cPanel)
- [ ] File backend di-upload ke cPanel
- [ ] Database dibuat dan dikonfigurasi
- [ ] `.env` file dibuat dengan konfigurasi production
- [ ] `composer install` dijalankan
- [ ] Migrations dijalankan
- [ ] Seeders dijalankan
- [ ] `php artisan storage:link` dijalankan
- [ ] `php artisan config:cache` dijalankan
- [ ] CORS dikonfigurasi dengan benar
- [ ] API endpoint bisa diakses

### Frontend (Vercel)
- [ ] Code di-push ke GitHub
- [ ] Project di-import ke Vercel
- [ ] Environment variable `VITE_API_URL` di-set
- [ ] Build berhasil
- [ ] Domain dikonfigurasi (jika ada)
- [ ] Frontend bisa mengakses API

### Testing
- [ ] Login/Register berfungsi
- [ ] Module browsing berfungsi
- [ ] Finance Tools berfungsi
- [ ] File upload berfungsi
- [ ] Admin dashboard berfungsi
- [ ] Tidak ada CORS error
- [ ] Tidak ada console error

---

## 🔐 Security Checklist

- [ ] `APP_DEBUG=false` di production
- [ ] `APP_ENV=production` di production
- [ ] Strong database password
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS hanya allow domain yang diperlukan
- [ ] File `.env` tidak di-commit ke Git
- [ ] `storage/` folder tidak accessible langsung

---

## 📞 Support

Jika ada masalah saat deploy, cek:
1. Error logs di cPanel
2. Vercel build logs
3. Browser console untuk frontend errors
4. Network tab untuk API errors

---

**Selamat deploy! 🎉**

