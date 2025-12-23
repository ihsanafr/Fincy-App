# Fincy - Financial Literacy for Society

A web application for financial literacy education with learning modules and finance tools.

## Tech Stack

- **Backend**: Laravel 11
- **Frontend**: React 18 with Vite
- **Authentication**: Laravel Sanctum
- **Database**: MySQL

## Project Structure

```
Fincy App/
├── backend/          # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
└── frontend/         # React Application
    ├── src/
    ├── public/
    └── ...
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure database in `.env` file:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fincy
DB_USERNAME=root
DB_PASSWORD=your_password
```

6. Run migrations:
```bash
php artisan migrate
```

7. Create super admin user:
```bash
php artisan db:seed --class=SuperAdminSeeder
```

Default admin credentials:
- Email: `admin@fincy.com`
- Password: `admin123`

8. Create storage link for file uploads:
```bash
php artisan storage:link
```

9. Start server:
```bash
php artisan serve
```

Backend will run at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run at `http://localhost:3000`

## Features

### Learning Modules
- Browse learning modules
- View module content (videos and text)
- Complete modules
- Take quizzes (20 questions)
- Earn digital certificates

### Finance Tools
- Voluntary subscription system
- Upload payment proof
- Admin approval system
- Access to finance tools (to be implemented)

### Admin Features
- CRUD learning modules
- Manage module contents (videos and text)
- Create and manage quizzes
- Approve/reject payment requests
- View user data and statistics

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get authenticated user

### Learning Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/{id}` - Get module details
- `POST /api/modules/{id}/complete` - Mark module as completed
- `GET /api/modules/{id}/quiz` - Get quiz questions
- `POST /api/modules/{id}/quiz/submit` - Submit quiz answers
- `GET /api/modules/{id}/certificate` - Get certificate

### Finance Tools
- `GET /api/finance-tools/status` - Check subscription status
- `POST /api/finance-tools/subscribe` - Upload payment proof

### Admin Endpoints
- `GET /api/admin/modules` - Get all modules
- `POST /api/admin/modules` - Create module
- `PUT /api/admin/modules/{id}` - Update module
- `DELETE /api/admin/modules/{id}` - Delete module
- `PUT /api/admin/modules/{id}/contents` - Update module contents
- `PUT /api/admin/modules/{id}/quiz` - Update quiz
- `GET /api/admin/payments` - Get all payments
- `PUT /api/admin/payments/{id}/approve` - Approve payment
- `PUT /api/admin/payments/{id}/reject` - Reject payment
- `GET /api/admin/users` - Get all users

## Database Schema

- **users** - User accounts (super_admin, user)
- **modules** - Learning modules
- **module_contents** - Module content (video/text)
- **module_progress** - User progress tracking
- **quizzes** - Quiz definitions
- **quiz_questions** - Quiz questions
- **quiz_attempts** - User quiz attempts
- **quiz_answers** - Quiz answers
- **certificates** - Digital certificates
- **subscriptions** - Finance tools subscriptions

## Notes

- Finance Tools functionality is placeholder and will be implemented later
- Payment information (bank details) should be configured in the payment page
- Certificate generation is automatic upon passing quiz (70% score required)
- All learning modules are free to access after registration

## Development

For development, make sure both backend and frontend servers are running simultaneously.

