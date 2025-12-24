<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceToolsController extends Controller
{
    public function checkStatus()
    {
        $user = Auth::user();
        
        // Get the latest subscription (most recent one)
        $subscription = $user->subscriptions()->latest()->first();
        
        // If there's an approved subscription, prioritize it
        $approvedSubscription = $user->subscriptions()
            ->where('status', Subscription::STATUS_APPROVED)
            ->latest()
            ->first();
        
        // Use approved subscription if exists, otherwise use latest
        $activeSubscription = $approvedSubscription ?? $subscription;

        $subscriptionData = null;
        if ($activeSubscription) {
            $subscriptionData = $activeSubscription->toArray();
            if (!empty($activeSubscription->payment_proof)) {
                $subscriptionData['payment_proof_url'] = asset('storage/' . $activeSubscription->payment_proof);
            } else {
                $subscriptionData['payment_proof_url'] = null;
            }
        }

        return response()->json([
            'has_subscription' => $user->hasActiveSubscription(),
            'subscription' => $subscriptionData,
            'subscription_status' => $activeSubscription?->status,
            'is_pending' => (bool) ($activeSubscription?->isPending()),
            'is_approved' => (bool) ($activeSubscription?->isApproved()),
            'is_rejected' => (bool) ($activeSubscription?->isRejected()),
        ]);
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();

        // Check if user already has pending subscription
        $pendingSubscription = $user->subscriptions()
            ->where('status', Subscription::STATUS_PENDING)
            ->latest()
            ->first();
            
        if ($pendingSubscription) {
            return response()->json([
                'message' => 'You have a pending subscription request',
            ], 400);
        }

        // Check if user already has approved subscription
        $approvedSubscription = $user->subscriptions()
            ->where('status', Subscription::STATUS_APPROVED)
            ->latest()
            ->first();
            
        if ($approvedSubscription) {
            return response()->json([
                'message' => 'You already have an active subscription',
            ], 400);
        }

        // Upload payment proof
        $paymentProofPath = $request->file('payment_proof')->store('payment_proofs', 'public');

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'amount' => $request->amount,
            'payment_proof' => $paymentProofPath,
            'status' => Subscription::STATUS_PENDING,
        ]);

        return response()->json([
            'message' => 'Subscription request submitted. Waiting for admin approval.',
            'subscription' => $subscription,
        ], 201);
    }

    // Dashboard Statistics
    public function dashboard()
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Total Income & Expense this month
        $totalIncome = Transaction::where('user_id', $user->id)
            ->where('type', Transaction::TYPE_INCOME)
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $totalExpense = Transaction::where('user_id', $user->id)
            ->where('type', Transaction::TYPE_EXPENSE)
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // Recent transactions
        $recentTransactions = Transaction::where('user_id', $user->id)
            ->with('category')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Top expense categories this month
        $topExpenseCategories = Transaction::where('user_id', $user->id)
            ->where('type', Transaction::TYPE_EXPENSE)
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->with('category')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // Budget status
        $activeBudgets = Budget::where('user_id', $user->id)
            ->where('start_date', '<=', $endOfMonth)
            ->where('end_date', '>=', $startOfMonth)
            ->with('category')
            ->get()
            ->map(function ($budget) {
                return [
                    'id' => $budget->id,
                    'category' => $budget->category->name,
                    'amount' => $budget->amount,
                    'spent' => $budget->spent,
                    'remaining' => $budget->remaining,
                    'percentage_used' => $budget->percentage_used,
                ];
            });

        return response()->json([
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'balance' => $totalIncome - $totalExpense,
            'recent_transactions' => $recentTransactions,
            'top_expense_categories' => $topExpenseCategories,
            'active_budgets' => $activeBudgets,
        ]);
    }

    // Transactions CRUD
    public function getTransactions(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $query = Transaction::where('user_id', $user->id)
            ->with('category')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('start_date')) {
            $query->where('transaction_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('transaction_date', '<=', $request->end_date);
        }

        $transactions = $query->paginate($request->get('per_page', 20));

        return response()->json($transactions);
    }

    public function createTransaction(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'category_id' => $request->category_id,
            'type' => $request->type,
            'amount' => $request->amount,
            'description' => $request->description,
            'transaction_date' => $request->transaction_date,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Transaction created successfully',
            'transaction' => $transaction->load('category'),
        ], 201);
    }

    public function updateTransaction(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $transaction = Transaction::where('user_id', $user->id)->findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $transaction->update($request->only([
            'category_id',
            'type',
            'amount',
            'description',
            'transaction_date',
            'notes',
        ]));

        return response()->json([
            'message' => 'Transaction updated successfully',
            'transaction' => $transaction->load('category'),
        ]);
    }

    public function deleteTransaction($id)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $transaction = Transaction::where('user_id', $user->id)->findOrFail($id);
        $transaction->delete();

        return response()->json([
            'message' => 'Transaction deleted successfully',
        ]);
    }

    // Categories CRUD
    public function getCategories(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $query = Category::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('is_default', true);
        });

        if ($request->has('type') && in_array($request->type, ['income', 'expense', 'both'])) {
            $query->where(function ($q) use ($request) {
                $q->where('type', $request->type)->orWhere('type', 'both');
            });
        }

        $categories = $query->orderBy('is_default', 'desc')->orderBy('name')->get();

        return response()->json($categories);
    }

    public function createCategory(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7',
            'type' => 'required|in:income,expense,both',
        ]);

        $category = Category::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'icon' => $request->icon,
            'color' => $request->color ?? '#6366f1',
            'type' => $request->type,
            'is_default' => false,
        ]);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category,
        ], 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $category = Category::where('user_id', $user->id)
            ->where('is_default', false)
            ->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7',
            'type' => 'required|in:income,expense,both',
        ]);

        $category->update($request->only(['name', 'icon', 'color', 'type']));

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category,
        ]);
    }

    public function deleteCategory($id)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $category = Category::where('user_id', $user->id)
            ->where('is_default', false)
            ->findOrFail($id);

        // Check if category has transactions
        if ($category->transactions()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with existing transactions',
            ], 400);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }

    // Budgets CRUD
    public function getBudgets()
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $budgets = Budget::where('user_id', $user->id)
            ->with('category')
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($budget) {
                return [
                    'id' => $budget->id,
                    'category' => $budget->category->name,
                    'category_id' => $budget->category_id,
                    'amount' => $budget->amount,
                    'start_date' => $budget->start_date,
                    'end_date' => $budget->end_date,
                    'period' => $budget->period,
                    'spent' => $budget->spent,
                    'remaining' => $budget->remaining,
                    'percentage_used' => $budget->percentage_used,
                    'is_active' => $budget->isActive(),
                ];
            });

        return response()->json($budgets);
    }

    public function createBudget(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'period' => 'nullable|in:monthly,weekly,yearly',
        ]);

        $budget = Budget::create([
            'user_id' => $user->id,
            'category_id' => $request->category_id,
            'amount' => $request->amount,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'period' => $request->period ?? 'monthly',
        ]);

        return response()->json([
            'message' => 'Budget created successfully',
            'budget' => $budget->load('category'),
        ], 201);
    }

    public function updateBudget(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $budget = Budget::where('user_id', $user->id)->findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'period' => 'nullable|in:monthly,weekly,yearly',
        ]);

        $budget->update($request->only([
            'category_id',
            'amount',
            'start_date',
            'end_date',
            'period',
        ]));

        return response()->json([
            'message' => 'Budget updated successfully',
            'budget' => $budget->load('category'),
        ]);
    }

    public function deleteBudget($id)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $budget = Budget::where('user_id', $user->id)->findOrFail($id);
        $budget->delete();

        return response()->json([
            'message' => 'Budget deleted successfully',
        ]);
    }

    // Reports
    public function getReports(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasActiveSubscription()) {
            return response()->json(['message' => 'Subscription required'], 403);
        }

        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Income vs Expense over time
        $incomeExpenseData = Transaction::where('user_id', $user->id)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(transaction_date) as date'),
                DB::raw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income'),
                DB::raw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Expenses by category
        $expensesByCategory = Transaction::where('user_id', $user->id)
            ->where('type', Transaction::TYPE_EXPENSE)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->with('category')
            ->get();

        // Income by category
        $incomeByCategory = Transaction::where('user_id', $user->id)
            ->where('type', Transaction::TYPE_INCOME)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->with('category')
            ->get();

        return response()->json([
            'income_expense_over_time' => $incomeExpenseData,
            'expenses_by_category' => $expensesByCategory,
            'income_by_category' => $incomeByCategory,
        ]);
    }
}
