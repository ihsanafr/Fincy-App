# 🔧 Fix Vercel Deployment Error

## Problem
Error saat deploy: `Permission denied` untuk vite binary dan exit code 126.

## Solution

### Opsi 1: Update Vercel Project Settings (Recommended)

1. **Di Vercel Dashboard**:
   - Buka project settings
   - Klik **Settings** > **General**
   - Scroll ke **Build & Development Settings**
   - Set:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build` (atau biarkan auto)
     - **Output Directory**: `dist` (atau biarkan auto)
     - **Install Command**: `npm install` (atau biarkan auto)

2. **Hapus `vercel.json`** atau update seperti di bawah

### Opsi 2: Update vercel.json

File `frontend/vercel.json` sudah diupdate dengan konfigurasi yang benar.

### Opsi 3: Deploy dari Root (Alternatif)

Jika masih error, coba:

1. **Pindahkan `vercel.json` ke root project**:
   ```json
   {
     "buildCommand": "cd frontend && npm run build",
     "outputDirectory": "frontend/dist",
     "installCommand": "cd frontend && npm install",
     "framework": "vite"
   }
   ```

2. **Atau hapus `vercel.json`** dan set semua di Vercel Dashboard

## ✅ Checklist

- [ ] Root Directory di Vercel = `frontend`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Framework = Vite
- [ ] Environment Variable `VITE_API_URL` sudah di-set
- [ ] `vercel.json` sudah diupdate (atau dihapus jika pakai dashboard settings)

## 🔄 Redeploy

Setelah update settings:
1. Klik **Redeploy** di Vercel
2. Atau push commit baru ke GitHub (auto-deploy)

---

**Note**: Vercel sekarang support Vite natively, jadi tidak perlu `builds` config. Biarkan Vercel auto-detect atau set manual di dashboard.

