# Fincy Setup Guide

Panduan lengkap untuk setup proyek Fincy.

## Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL
- Git

## Langkah-langkah Setup

### 1. Clone atau Download Project

Jika menggunakan git:
```bash
git clone <repository-url>
cd "Fincy App"
```

### 2. Setup Backend (Laravel)

#### a. Install Dependencies
```bash
cd backend
composer install
```

#### b. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
```

#### c. Konfigurasi Database
Edit file `.env` dan sesuaikan konfigurasi database:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fincy
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### d. Buat Database
Buat database MySQL dengan nama `fincy` (atau sesuai yang ada di .env)

#### e. Run Migrations
```bash
php artisan migrate
```

#### f. Create Super Admin
```bash
php artisan db:seed --class=SuperAdminSeeder
```

Default credentials:
- Email: `admin@fincy.com`
- Password: `admin123`

#### g. Create Storage Link
```bash
php artisan storage:link
```

Ini diperlukan untuk menyimpan file upload (payment proof).

#### h. Start Laravel Server
```bash
php artisan serve
```

Server akan berjalan di `http://localhost:8000`

### 3. Setup Frontend (React)

#### a. Install Dependencies
```bash
cd frontend
npm install
```

#### b. Start Development Server
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## Testing

### Test Login sebagai Admin
1. Buka `http://localhost:3000`
2. Klik Login
3. Masukkan:
   - Email: `admin@fincy.com`
   - Password: `admin123`

### Test Register User Baru
1. Buka `http://localhost:3000`
2. Klik Register
3. Isi form registrasi
4. Setelah register, user akan otomatis login

## Fitur yang Tersedia

### Untuk User:
1. **Homepage** - Halaman utama
2. **Learning Modules** - List modul pembelajaran
3. **Module Detail** - Detail modul dengan konten video/text
4. **Quiz** - Kuis 20 soal setelah selesai modul
5. **Certificate** - Sertifikat digital setelah lulus quiz
6. **Finance Tools** - Halaman finance tools (perlu subscription)
7. **Payment** - Upload bukti pembayaran untuk subscription

### Untuk Admin:
1. **Admin Dashboard** - Dashboard admin
2. **Manage Modules** - CRUD modul pembelajaran
3. **Manage Payments** - Approve/reject pembayaran
4. **View Users** - Lihat data user

## Struktur Database

### Tabel Utama:
- `users` - Data user (super_admin, user)
- `modules` - Modul pembelajaran
- `module_contents` - Konten modul (video/text)
- `module_progress` - Progress user per modul
- `quizzes` - Data quiz
- `quiz_questions` - Pertanyaan quiz
- `quiz_attempts` - Attempt user mengerjakan quiz
- `quiz_answers` - Jawaban user
- `certificates` - Sertifikat digital
- `subscriptions` - Data subscription finance tools

## Catatan Penting

1. **Payment Information**: Edit file `frontend/src/pages/PaymentPage.jsx` untuk menambahkan informasi rekening bank.

2. **Storage**: Pastikan folder `storage/app/public` memiliki permission write.

3. **CORS**: Jika ada masalah CORS, pastikan `config/cors.php` sudah dikonfigurasi dengan benar.

4. **Environment**: Jangan commit file `.env` ke repository.

## Troubleshooting

### Error: "Class not found"
```bash
composer dump-autoload
```

### Error: "Storage link not found"
```bash
php artisan storage:link
```

### Error: "Migration failed"
- Pastikan database sudah dibuat
- Pastikan kredensial database di `.env` benar
- Pastikan MySQL service berjalan

### Error: "CORS error"
- Pastikan backend dan frontend berjalan di port yang benar
- Check `config/cors.php` dan `config/sanctum.php`

## Development Tips

1. Gunakan Laravel Tinker untuk testing:
```bash
php artisan tinker
```

2. Clear cache jika ada masalah:
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

3. Untuk melihat semua routes:
```bash
php artisan route:list
```

## Next Steps

1. Implementasi fitur Finance Tools
2. Improve UI/UX design
3. Add more validation
4. Add email notifications
5. Add analytics dashboard

