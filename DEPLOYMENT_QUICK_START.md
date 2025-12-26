# 🚀 Quick Start Deployment Guide

Panduan cepat deploy Fincy App ke production.

---

## 📦 Backend (cPanel) - Quick Steps

1. **Upload file backend** ke cPanel (via File Manager atau FTP)
2. **Buat database** di cPanel MySQL Databases
3. **Buat file `.env`** di folder backend dengan konfigurasi:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://api.yourdomain.com
   DB_DATABASE=your_db_name
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   SANCTUM_STATEFUL_DOMAINS=yourdomain.com,your-app.vercel.app
   CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://your-app.vercel.app
   ```
4. **Via Terminal/SSH**:
   ```bash
   composer install --no-dev
   php artisan key:generate
   php artisan migrate --force
   php artisan db:seed --class=SuperAdminSeeder
   php artisan storage:link
   php artisan config:cache
   ```
5. **Set permissions**: `storage/` dan `bootstrap/cache/` → 775
6. **Test**: `https://api.yourdomain.com/api/modules`

---

## 🎨 Frontend (Vercel) - Quick Steps

1. **Push code ke GitHub** (jika belum)
2. **Login ke Vercel** → Import Project dari GitHub
3. **Configure**:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Set Environment Variable**:
   - Name: `VITE_API_URL`
   - Value: `https://api.yourdomain.com/api`
5. **Deploy** → Done! 🎉

---

## ⚙️ Important Configurations

### Backend `.env`:
```env
APP_ENV=production
APP_DEBUG=false
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://your-app.vercel.app
```

### Frontend Environment Variable (Vercel):
```
VITE_API_URL=https://api.yourdomain.com/api
```

---

## ✅ Testing Checklist

- [ ] Backend API accessible: `https://api.yourdomain.com/api/modules`
- [ ] Frontend accessible: `https://your-app.vercel.app`
- [ ] Login/Register works
- [ ] No CORS errors in browser console
- [ ] File uploads work
- [ ] Admin dashboard accessible

---

## 📚 Full Documentation

Lihat `DEPLOYMENT_GUIDE.md` untuk panduan lengkap dengan troubleshooting.

---

**Need Help?** Check error logs:
- Backend: cPanel Error Logs
- Frontend: Vercel Build Logs
- Browser: Console & Network Tab

