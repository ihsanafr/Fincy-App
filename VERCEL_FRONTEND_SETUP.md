# 🔗 Setup Frontend Vercel dengan Backend API

Panduan menghubungkan frontend Vercel dengan backend di `https://fincy.ihsanafr.my.id/`

---

## 📋 Step 1: Update Environment Variable di Vercel

### 1.1 Login ke Vercel Dashboard

1. Buka [vercel.com](https://vercel.com)
2. Login ke akun Anda
3. Pilih project **Fincy Frontend**

### 1.2 Set Environment Variable

1. Klik **Settings** → **Environment Variables**
2. Klik **Add New**
3. Isi:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://fincy.ihsanafr.my.id/api`
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
4. Klik **Save**

### 1.3 Verifikasi

Pastikan environment variable sudah muncul di list dengan value:
```
VITE_API_URL = https://fincy.ihsanafr.my.id/api
```

---

## 🔄 Step 2: Redeploy Frontend

### Opsi A: Redeploy Manual

1. Di Vercel Dashboard, klik **Deployments**
2. Klik **⋯** (three dots) pada deployment terbaru
3. Pilih **Redeploy**
4. Pastikan **Use existing Build Cache** = **No** (untuk memastikan environment variable baru digunakan)
5. Klik **Redeploy**

### Opsi B: Push ke GitHub (Auto-deploy)

```bash
# Commit perubahan (jika ada)
git add .
git commit -m "chore: update API URL configuration"
git push origin main
```

Vercel akan otomatis deploy dengan environment variable baru.

---

## ✅ Step 3: Verifikasi Koneksi

### 3.1 Test di Browser

1. Buka frontend di Vercel
2. Buka **Browser Console** (F12)
3. Buka tab **Network**
4. Coba akses halaman Learning Modules
5. Cek request ke API:
   - URL harus: `https://fincy.ihsanafr.my.id/api/modules`
   - Status harus: `200 OK` (jika backend sudah di-deploy)
   - Response harus JSON array

### 3.2 Test API Langsung

Buka di browser:
```
https://fincy.ihsanafr.my.id/api/modules
```

**Expected Response:**
```json
[]
```
atau array of modules.

---

## 🔧 Troubleshooting

### Problem: CORS Error

**Error di Console:**
```
Access to XMLHttpRequest at 'https://fincy.ihsanafr.my.id/api/modules' 
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Pastikan di backend `.env`:
   ```env
   CORS_ALLOWED_ORIGINS=https://fincy.ihsanafr.my.id,https://your-app.vercel.app
   ```
2. Clear cache di backend:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

### Problem: 401 Unauthorized

**Solution:**
- Pastikan `SANCTUM_STATEFUL_DOMAINS` di backend `.env` include domain Vercel
- Pastikan `SESSION_DOMAIN` di-set dengan benar

### Problem: API URL Masih Menggunakan Localhost

**Solution:**
1. Pastikan environment variable `VITE_API_URL` sudah di-set di Vercel
2. Redeploy dengan **Use existing Build Cache** = **No**
3. Clear browser cache

---

## 📝 Checklist

- [ ] Environment variable `VITE_API_URL` di-set di Vercel
- [ ] Value = `https://fincy.ihsanafr.my.id/api`
- [ ] Environment = Production, Preview, Development
- [ ] Frontend di-redeploy
- [ ] Test API connection di browser console
- [ ] Tidak ada CORS error
- [ ] Data modules bisa di-load

---

**Setelah semua step selesai, frontend akan terhubung dengan backend! 🎉**

