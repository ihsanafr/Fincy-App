# 📝 Cara Menambahkan CORS_ALLOWED_ORIGINS di .env

Panduan menambahkan konfigurasi CORS ke file `.env` di cPanel.

---

## 🎯 Langkah-langkah

### Step 1: Buka File .env di cPanel

1. Login ke **cPanel**
2. Buka **File Manager**
3. Navigate ke folder `public_html/`
4. Cari file `.env` (file hidden)
   - Jika tidak terlihat, enable **"Show Hidden Files"** di File Manager
5. Klik kanan file `.env` → **Edit**

### Step 2: Tambahkan Baris CORS

Scroll ke bawah file `.env` dan tambahkan baris berikut:

```env
CORS_ALLOWED_ORIGINS=https://fincy.ihsanafr.my.id,https://www.fincy.ihsanafr.my.id,https://fincy-app.vercel.app
SANCTUM_STATEFUL_DOMAINS=fincy.ihsanafr.my.id,fincy-app.vercel.app
SESSION_DOMAIN=.fincy.ihsanafr.my.id
```

**PENTING**: 
- Ganti `fincy-app.vercel.app` dengan URL Vercel Anda yang sebenarnya
- Tidak ada spasi di akhir setiap baris
- Pastikan tidak ada tanda kutip (`"` atau `'`)

### Step 3: Contoh File .env Lengkap

File `.env` Anda seharusnya terlihat seperti ini:

```env
APP_NAME=Fincy
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://fincy.ihsanafr.my.id

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

SANCTUM_STATEFUL_DOMAINS=fincy.ihsanafr.my.id,fincy-app.vercel.app
SESSION_DOMAIN=.fincy.ihsanafr.my.id

CORS_ALLOWED_ORIGINS=https://fincy.ihsanafr.my.id,https://www.fincy.ihsanafr.my.id,https://fincy-app.vercel.app
```

### Step 4: Save File

1. Klik **Save Changes**
2. Tutup editor

### Step 5: Clear Cache

Via Terminal/SSH di cPanel:

```bash
cd public_html
php artisan config:clear
php artisan config:cache
```

**Atau via file PHP** (jika Terminal tidak tersedia):

1. Buat file `clear-cache.php` di `public_html/`
2. Isi dengan:
```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->call('config:clear');
$app->make('Illuminate\Contracts\Console\Kernel')->call('config:cache');
echo "✅ Cache cleared! CORS configuration updated.";
?>
```
3. Buka di browser: `https://fincy.ihsanafr.my.id/clear-cache.php`
4. **Hapus file `clear-cache.php`** setelah selesai (penting untuk security!)

### Step 6: Test

1. Refresh frontend di Vercel
2. Buka browser console (F12)
3. Cek apakah masih ada CORS error
4. Data modules seharusnya sudah tampil

---

## ✅ Checklist

- [ ] File `.env` sudah dibuka di cPanel
- [ ] Baris `CORS_ALLOWED_ORIGINS` sudah ditambahkan
- [ ] Baris `SANCTUM_STATEFUL_DOMAINS` sudah ditambahkan
- [ ] URL Vercel sudah benar (tidak ada typo)
- [ ] File sudah di-save
- [ ] Cache sudah di-clear (`config:clear` dan `config:cache`)
- [ ] Test di frontend: Tidak ada CORS error
- [ ] Data modules tampil

---

## 🔍 Cara Cek URL Vercel Anda

1. Buka Vercel Dashboard
2. Klik project Anda
3. Di bagian **Domains**, Anda akan melihat URL
4. Copy URL tersebut (contoh: `fincy-app.vercel.app` atau custom domain)
5. Paste ke `.env` dengan format: `https://your-url.vercel.app`

---

**Setelah menambahkan baris CORS dan clear cache, error akan hilang! 🎉**


