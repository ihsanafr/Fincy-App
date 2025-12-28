# 🔧 Fix CORS Error - Backend ke Frontend Vercel

Error yang terjadi:
```
Access to XMLHttpRequest at 'https://fincy.ihsanafr.my.id/api/modules' 
from origin 'https://fincy-app.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Penyebab**: Backend belum mengizinkan request dari domain Vercel (`fincy-app.vercel.app`)

---

## 🎯 Solusi: Update CORS di Backend

### Step 1: Login ke cPanel

1. Login ke cPanel hosting Anda
2. Buka **File Manager**

### Step 2: Edit File .env

1. Di File Manager, navigate ke `public_html/`
2. Cari file `.env` (file hidden, mungkin perlu enable "Show Hidden Files")
3. Klik kanan → **Edit**

### Step 3: Update CORS Configuration

Cari baris `CORS_ALLOWED_ORIGINS` dan update menjadi:

```env
CORS_ALLOWED_ORIGINS=https://fincy.ihsanafr.my.id,https://www.fincy.ihsanafr.my.id,https://fincy-app.vercel.app
```

**PENTING**: Ganti `fincy-app.vercel.app` dengan URL Vercel Anda yang sebenarnya jika berbeda!

Juga pastikan ada baris:
```env
SANCTUM_STATEFUL_DOMAINS=fincy.ihsanafr.my.id,fincy-app.vercel.app
```

### Step 4: Save File

1. Klik **Save Changes**
2. Tutup editor

### Step 5: Clear dan Re-cache Config

1. Di cPanel, buka **Terminal** (atau gunakan SSH)
2. Jalankan perintah:

```bash
cd public_html
php artisan config:clear
php artisan config:cache
```

**Atau jika Terminal tidak tersedia**, buat file PHP sementara:

1. Buat file `clear-cache.php` di `public_html/`
2. Isi dengan:
```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->call('config:clear');
$app->make('Illuminate\Contracts\Console\Kernel')->call('config:cache');
echo "Cache cleared and re-cached!";
?>
```
3. Buka di browser: `https://fincy.ihsanafr.my.id/clear-cache.php`
4. Hapus file `clear-cache.php` setelah selesai

### Step 6: Test CORS

1. Buka browser console di frontend Vercel
2. Refresh halaman
3. Cek apakah masih ada CORS error
4. Jika masih error, cek apakah URL Vercel di `.env` sudah benar

---

## ✅ Verifikasi

### Test 1: Cek CORS Headers

Buka browser console di frontend dan jalankan:

```javascript
fetch('https://fincy.ihsanafr.my.id/api/modules', {
  method: 'GET',
  credentials: 'include'
})
.then(r => {
  console.log('CORS Headers:', r.headers.get('Access-Control-Allow-Origin'));
  return r.json();
})
.then(data => console.log('Data:', data))
.catch(err => console.error('Error:', err));
```

**Expected**: Tidak ada error, dan `Access-Control-Allow-Origin` header ada.

### Test 2: Test API dengan CORS

Buka di browser:
```
https://fincy.ihsanafr.my.id/api/modules
```

Harus return JSON array.

---

## 🔍 Troubleshooting

### Masih Error CORS?

1. **Pastikan URL Vercel benar** di `.env`:
   - Cek URL Vercel Anda yang sebenarnya
   - Pastikan tidak ada typo
   - Pastikan menggunakan `https://` (bukan `http://`)

2. **Pastikan config sudah di-cache**:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

3. **Cek file `config/cors.php`**:
   - Pastikan menggunakan `env('CORS_ALLOWED_ORIGINS')`
   - File sudah diupdate sebelumnya

4. **Test langsung di browser**:
   - Buka: `https://fincy.ihsanafr.my.id/api/modules`
   - Harus return JSON (bukan error)

---

## 📝 Checklist

- [ ] File `.env` di-backend sudah di-update
- [ ] `CORS_ALLOWED_ORIGINS` include domain Vercel
- [ ] `SANCTUM_STATEFUL_DOMAINS` include domain Vercel
- [ ] `php artisan config:clear` sudah dijalankan
- [ ] `php artisan config:cache` sudah dijalankan
- [ ] Test API langsung: `https://fincy.ihsanafr.my.id/api/modules` return JSON
- [ ] Test di frontend: Tidak ada CORS error di console
- [ ] Data modules tampil di frontend

---

**Setelah fix CORS, frontend akan bisa mengakses API! 🎉**

