<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\FinanceToolsController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\Admin\AdminModuleController;
use App\Http\Controllers\Api\Admin\AdminPaymentController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminContentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Learning Modules (can be viewed without login)
Route::get('/modules', [ModuleController::class, 'index']);
Route::get('/modules/{id}', [ModuleController::class, 'show']);

// Public Profile (can be viewed without login) - using slug
Route::get('/profile/{slug}', [ProfileController::class, 'getPublicProfile']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::post('/profile/upload-photo', [ProfileController::class, 'uploadPhoto']);

    // Learning Modules (User) - Actions that require login
    Route::post('/modules/{id}/complete', [ModuleController::class, 'markComplete']);

    // Quiz
    Route::get('/modules/{id}/quiz', [QuizController::class, 'getQuiz']);
    Route::post('/modules/{id}/quiz/submit', [QuizController::class, 'submitQuiz']);
    Route::get('/modules/{id}/certificate', [QuizController::class, 'getCertificate']);
    Route::get('/modules/{id}/quiz/history', [QuizController::class, 'getModuleQuizHistory']);
    Route::get('/quiz/history', [QuizController::class, 'getQuizHistory']);

        // Finance Tools
        Route::get('/finance-tools/status', [FinanceToolsController::class, 'checkStatus']);
        Route::post('/finance-tools/subscribe', [FinanceToolsController::class, 'subscribe']);
        
        // Finance Tools - Dashboard & Reports
        Route::get('/finance-tools/dashboard', [FinanceToolsController::class, 'dashboard']);
        Route::get('/finance-tools/reports', [FinanceToolsController::class, 'getReports']);
        
        // Finance Tools - Transactions
        Route::get('/finance-tools/transactions', [FinanceToolsController::class, 'getTransactions']);
        Route::post('/finance-tools/transactions', [FinanceToolsController::class, 'createTransaction']);
        Route::put('/finance-tools/transactions/{id}', [FinanceToolsController::class, 'updateTransaction']);
        Route::delete('/finance-tools/transactions/{id}', [FinanceToolsController::class, 'deleteTransaction']);
        
        // Finance Tools - Categories
        Route::get('/finance-tools/categories', [FinanceToolsController::class, 'getCategories']);
        Route::post('/finance-tools/categories', [FinanceToolsController::class, 'createCategory']);
        Route::put('/finance-tools/categories/{id}', [FinanceToolsController::class, 'updateCategory']);
        Route::delete('/finance-tools/categories/{id}', [FinanceToolsController::class, 'deleteCategory']);
        
        // Finance Tools - Budgets
        Route::get('/finance-tools/budgets', [FinanceToolsController::class, 'getBudgets']);
        Route::post('/finance-tools/budgets', [FinanceToolsController::class, 'createBudget']);
        Route::put('/finance-tools/budgets/{id}', [FinanceToolsController::class, 'updateBudget']);
        Route::delete('/finance-tools/budgets/{id}', [FinanceToolsController::class, 'deleteBudget']);

    // Admin routes
    Route::middleware('super_admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard/statistics', [AdminDashboardController::class, 'statistics']);
        Route::get('/dashboard/recent-users', [AdminDashboardController::class, 'recentUsers']);
        Route::get('/dashboard/recent-payments', [AdminDashboardController::class, 'recentPayments']);
        Route::get('/dashboard/notifications', [AdminDashboardController::class, 'notifications']);

        // Modules
        Route::get('/modules', [AdminModuleController::class, 'index']);
        Route::post('/modules', [AdminModuleController::class, 'store']);
        Route::get('/modules/{id}', [AdminModuleController::class, 'show']);
        Route::put('/modules/{id}', [AdminModuleController::class, 'update']);
        Route::delete('/modules/{id}', [AdminModuleController::class, 'destroy']);
        Route::put('/modules/{id}/contents', [AdminModuleController::class, 'updateContents']);
        Route::put('/modules/{id}/quiz', [AdminModuleController::class, 'updateQuiz']);

        // Module Contents
        Route::get('/modules/{moduleId}/contents', [AdminModuleController::class, 'getContents']);
        Route::post('/modules/{moduleId}/contents', [AdminModuleController::class, 'storeContent']);
        Route::put('/modules/{moduleId}/contents/{contentId}', [AdminModuleController::class, 'updateContent']);
        Route::delete('/modules/{moduleId}/contents/{contentId}', [AdminModuleController::class, 'deleteContent']);

        // Content Image Upload
        Route::post('/content/upload-image', [AdminContentController::class, 'uploadImage']);

        // Payments
        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::put('/payments/{id}/approve', [AdminPaymentController::class, 'approve']);
        Route::put('/payments/{id}/reject', [AdminPaymentController::class, 'reject']);

        // Users
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}/role', [AdminUserController::class, 'updateRole']);
    });
});

