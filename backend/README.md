# Fincy Backend (Laravel)

## Setup Instructions

1. Install dependencies:
```bash
composer install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Configure database in `.env` file

5. Run migrations:
```bash
php artisan migrate
```

6. Create super admin user (run seeder):
```bash
php artisan db:seed --class=SuperAdminSeeder
```

7. Start server:
```bash
php artisan serve
```

## API Endpoints

### Authentication
- POST `/api/register` - Register new user
- POST `/api/login` - Login user
- POST `/api/logout` - Logout user
- GET `/api/user` - Get authenticated user

### Learning Modules (Admin)
- GET `/api/admin/modules` - Get all modules
- POST `/api/admin/modules` - Create module
- GET `/api/admin/modules/{id}` - Get module details
- PUT `/api/admin/modules/{id}` - Update module
- DELETE `/api/admin/modules/{id}` - Delete module

### Learning Modules (User)
- GET `/api/modules` - Get all modules
- GET `/api/modules/{id}` - Get module details with content
- POST `/api/modules/{id}/complete` - Mark module as completed
- GET `/api/modules/{id}/quiz` - Get quiz questions
- POST `/api/modules/{id}/quiz/submit` - Submit quiz answers
- GET `/api/modules/{id}/certificate` - Get certificate

### Finance Tools
- GET `/api/finance-tools/status` - Check subscription status
- POST `/api/finance-tools/subscribe` - Upload payment proof
- GET `/api/admin/payments` - Get all payment requests (admin)
- PUT `/api/admin/payments/{id}/approve` - Approve payment
- PUT `/api/admin/payments/{id}/reject` - Reject payment

### Users (Admin)
- GET `/api/admin/users` - Get all users
- GET `/api/admin/users/{id}` - Get user details

