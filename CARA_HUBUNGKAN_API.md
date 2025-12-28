# 🔗 Cara Menghubungkan Frontend Vercel ke Backend API

Panduan sederhana untuk menghubungkan frontend Vercel dengan backend API di `https://fincy.ihsanafr.my.id/`

---

## 📍 Informasi Penting

- **Backend API URL**: `https://fincy.ihsanafr.my.id/api`
- **Frontend**: Sudah di-deploy di Vercel
- **Tujuan**: Frontend bisa mengakses API backend

---

## 🎯 Langkah 1: Set Environment Variable di Vercel

### Step 1.1: Login ke Vercel

1. Buka browser dan kunjungi: **https://vercel.com**
2. Login dengan akun Anda
3. Klik pada **project Fincy** Anda

### Step 1.2: Buka Settings

1. Di halaman project, klik tab **Settings** (di bagian atas)
2. Scroll ke bawah, cari bagian **Environment Variables**
3. Klik bagian tersebut

### Step 1.3: Tambah Environment Variable

1. Klik tombol **Add New** atau **Add**
2. Isi form yang muncul:
   - **Name**: Ketik `VITE_API_URL` (harus persis seperti ini)
   - **Value**: Ketik `https://fincy.ihsanafr.my.id/api` (tanpa spasi di akhir)
   - **Environment**: Centang semua:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
3. Klik **Save**

### Step 1.4: Verifikasi

Pastikan di list Environment Variables muncul:
```
VITE_API_URL = https://fincy.ihsanafr.my.id/api
```

---

## 🔄 Langkah 2: Redeploy Frontend

### Step 2.1: Buka Deployments

1. Klik tab **Deployments** (di bagian atas)
2. Anda akan melihat list deployment

### Step 2.2: Redeploy

1. Cari deployment terbaru (yang paling atas)
2. Klik **⋯** (tiga titik) di pojok kanan deployment tersebut
3. Pilih **Redeploy**
4. **PENTING**: Pastikan **Use existing Build Cache** = **No** (uncheck)
   - Ini penting agar environment variable baru digunakan
5. Klik **Redeploy**

### Step 2.3: Tunggu Build Selesai

- Tunggu proses build selesai (biasanya 1-2 menit)
- Status akan berubah dari "Building" → "Ready"

---

## ✅ Langkah 3: Test Koneksi

### Step 3.1: Buka Frontend

1. Setelah deploy selesai, klik **Visit** untuk membuka frontend
2. Atau buka URL Vercel Anda

### Step 3.2: Test di Browser Console

1. Tekan **F12** di browser untuk buka Developer Tools
2. Klik tab **Console**
3. Klik tab **Network**
4. Refresh halaman (F5)
5. Coba akses halaman **Learning Modules**
6. Di tab Network, cari request ke `/api/modules`
7. Klik request tersebut
8. Cek:
   - **Request URL**: Harus `https://fincy.ihsanafr.my.id/api/modules`
   - **Status**: Harus `200 OK` (jika berhasil)
   - **Response**: Harus JSON array `[]` atau data modules

### Step 3.3: Test API Langsung

Buka di browser baru:
```
https://fincy.ihsanafr.my.id/api/modules
```

**Jika berhasil**, akan muncul:
```json
[]
```
atau array of modules jika sudah ada data.

**Jika error**, akan muncul error message.

---

## 🔧 Troubleshooting

### ❌ Problem: Masih Error "s.map is not a function"

**Penyebab**: Environment variable belum digunakan atau cache masih lama.

**Solusi**:
1. Pastikan `VITE_API_URL` sudah di-set di Vercel
2. Redeploy dengan **Use existing Build Cache** = **No**
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+F5)

### ❌ Problem: CORS Error

**Error di Console**:
```
Access to XMLHttpRequest at 'https://fincy.ihsanafr.my.id/api/modules' 
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Solusi**:
1. Login ke cPanel
2. Buka File Manager → Edit file `.env` di `public_html/`
3. Pastikan ada baris:
   ```env
   CORS_ALLOWED_ORIGINS=https://fincy.ihsanafr.my.id,https://your-app.vercel.app
   ```
   (Ganti `your-app.vercel.app` dengan URL Vercel Anda yang sebenarnya)
4. Via Terminal/SSH di cPanel:
   ```bash
   cd public_html
   php artisan config:clear
   php artisan config:cache
   ```

### ❌ Problem: 401 Unauthorized

**Solusi**:
1. Edit `.env` di cPanel:
   ```env
   SANCTUM_STATEFUL_DOMAINS=fincy.ihsanafr.my.id,your-app.vercel.app
   ```
2. Clear cache:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

### ❌ Problem: API URL Masih Menggunakan `/api` (Localhost)

**Penyebab**: Environment variable belum digunakan saat build.

**Solusi**:
1. Pastikan `VITE_API_URL` sudah di-set di Vercel
2. Redeploy dengan **Use existing Build Cache** = **No**
3. Tunggu build selesai
4. Clear browser cache

---

## 📝 Checklist

Sebelum test, pastikan:

- [ ] Environment variable `VITE_API_URL` sudah di-set di Vercel
- [ ] Value = `https://fincy.ihsanafr.my.id/api` (tanpa spasi)
- [ ] Environment = Production, Preview, Development (semua dicentang)
- [ ] Frontend sudah di-redeploy
- [ ] Build cache di-uncheck saat redeploy
- [ ] CORS di backend sudah dikonfigurasi dengan domain Vercel
- [ ] Test API langsung di browser: `https://fincy.ihsanafr.my.id/api/modules`

---

## 🎉 Selesai!

Setelah semua langkah selesai:

1. ✅ Frontend akan otomatis menggunakan API di `https://fincy.ihsanafr.my.id/api`
2. ✅ Data modules akan bisa di-load
3. ✅ Login/Register akan bekerja
4. ✅ Semua fitur akan terhubung ke backend

---

## 💡 Tips

- **Setelah update environment variable**, selalu redeploy dengan cache di-uncheck
- **Test API langsung** di browser untuk memastikan backend berjalan
- **Cek browser console** untuk melihat error detail jika ada masalah
- **Cek Network tab** untuk melihat request/response API

---

**Jika masih ada masalah, cek error di browser console dan beri tahu saya!** 🚀

