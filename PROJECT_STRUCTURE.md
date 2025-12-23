# Fincy Project Structure

## Overview
Proyek Fincy terdiri dari 2 bagian utama:
1. **Backend** - Laravel 11 API
2. **Frontend** - React 18 dengan Vite

## Backend Structure (Laravel)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php          # Login, Register, Logout
│   │   │   │   ├── ModuleController.php        # User: List & Detail Module
│   │   │   │   ├── QuizController.php          # Quiz & Certificate
│   │   │   │   ├── FinanceToolsController.php  # Subscription
│   │   │   │   └── Admin/
│   │   │   │       ├── AdminModuleController.php  # CRUD Modules
│   │   │   │       ├── AdminPaymentController.php # Approve/Reject Payment
│   │   │   │       └── AdminUserController.php    # View Users
│   │   │   └── Middleware/
│   │   │       ├── EnsureUserIsSuperAdmin.php  # Admin middleware
│   │   │       └── VerifyCsrfToken.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Module.php
│   │   ├── ModuleContent.php
│   │   ├── ModuleProgress.php
│   │   ├── Quiz.php
│   │   ├── QuizQuestion.php
│   │   ├── QuizAttempt.php
│   │   ├── QuizAnswer.php
│   │   ├── Certificate.php
│   │   └── Subscription.php
│   └── ...
├── database/
│   ├── migrations/          # 10 migration files
│   └── seeders/
│       └── SuperAdminSeeder.php
├── routes/
│   ├── api.php              # API routes
│   ├── web.php
│   └── console.php
└── config/
    ├── cors.php
    ├── sanctum.php
    └── filesystems.php
```

## Frontend Structure (React)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LearningModulesPage.jsx
│   │   ├── ModuleDetailPage.jsx
│   │   ├── FinanceToolsPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── PaymentPage.jsx
│   │   ├── QuizPage.jsx
│   │   ├── CertificatePage.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminModules.jsx
│   │       ├── AdminPayments.jsx
│   │       └── AdminUsers.jsx
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Business Logic Flow

### 1. Learning Module Flow

**User Journey:**
1. User register/login
2. Browse modules di `/learning-modules`
3. Pilih module → `/learning-modules/{id}`
4. Belajar dari konten (video/text)
5. Mark module as completed
6. Take quiz (20 questions)
7. Jika lulus (≥70%) → dapat certificate

**Admin Journey:**
1. Login sebagai super_admin
2. Go to `/admin/modules`
3. Create/Edit/Delete modules
4. Add contents (video/text)
5. Create quiz dengan 20 questions

### 2. Finance Tools Flow

**User Journey:**
1. User register/login
2. Go to `/finance-tools`
3. Jika belum subscribe → redirect ke `/payment`
4. Upload payment proof
5. Wait for admin approval
6. Setelah approved → bisa akses finance tools

**Admin Journey:**
1. Login sebagai super_admin
2. Go to `/admin/payments`
3. Lihat payment requests
4. Approve atau Reject payment
5. Lihat user data di `/admin/users`

### 3. Authentication Flow

1. User register → auto login
2. User login → dapat token
3. Token disimpan di localStorage
4. Setiap request API include token di header
5. Token digunakan untuk authenticate

## API Endpoints Summary

### Public
- `POST /api/register`
- `POST /api/login`

### Protected (User)
- `POST /api/logout`
- `GET /api/user`
- `GET /api/modules`
- `GET /api/modules/{id}`
- `POST /api/modules/{id}/complete`
- `GET /api/modules/{id}/quiz`
- `POST /api/modules/{id}/quiz/submit`
- `GET /api/modules/{id}/certificate`
- `GET /api/finance-tools/status`
- `POST /api/finance-tools/subscribe`

### Protected (Admin Only)
- `GET /api/admin/modules`
- `POST /api/admin/modules`
- `PUT /api/admin/modules/{id}`
- `DELETE /api/admin/modules/{id}`
- `PUT /api/admin/modules/{id}/contents`
- `PUT /api/admin/modules/{id}/quiz`
- `GET /api/admin/payments`
- `PUT /api/admin/payments/{id}/approve`
- `PUT /api/admin/payments/{id}/reject`
- `GET /api/admin/users`
- `GET /api/admin/users/{id}`

## Database Relationships

```
users
  ├── hasMany module_progress
  ├── hasMany quiz_attempts
  ├── hasMany certificates
  └── hasOne subscription

modules
  ├── hasMany module_contents
  ├── hasOne quiz
  └── hasMany module_progress

quizzes
  ├── belongsTo module
  ├── hasMany quiz_questions
  └── hasMany quiz_attempts

quiz_attempts
  ├── belongsTo user
  ├── belongsTo quiz
  └── hasMany quiz_answers

subscriptions
  └── belongsTo user
```

## Key Features Implementation

### 1. Role-Based Access Control
- Super Admin: Full access
- User: Limited access (learning modules, finance tools after subscription)

### 2. Module Progress Tracking
- Tracks which modules user has completed
- Prevents duplicate completion

### 3. Quiz System
- 20 questions per module
- Multiple choice (A, B, C, D)
- Passing score: 70% (14/20)
- Auto-generate certificate on pass

### 4. Certificate System
- Unique certificate number
- Generated automatically on quiz pass
- Links user, module, and issue date

### 5. Subscription System
- Voluntary payment
- Upload payment proof (image)
- Admin approval workflow
- Status: pending → approved/rejected

## Security Features

1. **Authentication**: Laravel Sanctum tokens
2. **Authorization**: Role-based middleware
3. **CSRF Protection**: Disabled for API routes
4. **CORS**: Configured for frontend domain
5. **Password Hashing**: Bcrypt
6. **File Upload**: Validated image types

## Future Enhancements

1. Finance Tools functionality
2. Email notifications
3. Progress analytics
4. Social sharing for certificates
5. Module categories/filtering
6. Search functionality
7. User profile page
8. Dashboard for users

