<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Module;
use App\Models\Subscription;
use App\Models\Certificate;
use App\Models\ModuleProgress;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function statistics()
    {
        $totalUsers = User::where('role', User::ROLE_USER)->count();
        $totalModules = Module::count();
        $totalPayments = Subscription::count();
        $pendingPayments = Subscription::where('status', Subscription::STATUS_PENDING)->count();
        $approvedPayments = Subscription::where('status', Subscription::STATUS_APPROVED)->count();
        $totalCertificates = Certificate::count();
        $totalProgress = ModuleProgress::whereNotNull('completed_at')->count();

        // Calculate growth (comparing last 30 days with previous 30 days)
        $last30Days = now()->subDays(30);
        $previous30Days = now()->subDays(60);

        $usersLast30 = User::where('role', User::ROLE_USER)
            ->where('created_at', '>=', $last30Days)
            ->count();
        $usersPrevious30 = User::where('role', User::ROLE_USER)
            ->whereBetween('created_at', [$previous30Days, $last30Days])
            ->count();

        $userGrowth = $usersPrevious30 > 0 
            ? round((($usersLast30 - $usersPrevious30) / $usersPrevious30) * 100, 2)
            : ($usersLast30 > 0 ? 100 : 0);

        $modulesLast30 = Module::where('created_at', '>=', $last30Days)->count();
        $modulesPrevious30 = Module::whereBetween('created_at', [$previous30Days, $last30Days])->count();

        $moduleGrowth = $modulesPrevious30 > 0
            ? round((($modulesLast30 - $modulesPrevious30) / $modulesPrevious30) * 100, 2)
            : ($modulesLast30 > 0 ? 100 : 0);

        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'growth' => $userGrowth,
            ],
            'modules' => [
                'total' => $totalModules,
                'growth' => $moduleGrowth,
            ],
            'payments' => [
                'total' => $totalPayments,
                'pending' => $pendingPayments,
                'approved' => $approvedPayments,
            ],
            'certificates' => $totalCertificates,
            'progress' => $totalProgress,
        ]);
    }

    public function recentUsers()
    {
        $users = User::where('role', User::ROLE_USER)
            ->with('subscription')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json($users);
    }

    public function recentPayments()
    {
        $payments = Subscription::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json($payments);
    }

    public function notifications()
    {
        // Pending payments: show ALL pending so admin tidak miss request lama
        $pendingPayments = Subscription::with('user')
            ->where('status', Subscription::STATUS_PENDING)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($subscription) {
                return [
                    'id' => 'payment_' . $subscription->id,
                    'type' => 'payment',
                    'title' => 'Payment Pending Approval',
                    'message' => $subscription->user->name . ' submitted a payment request',
                    'data' => [
                        'subscription_id' => $subscription->id,
                        'user_id' => $subscription->user_id,
                        'user_name' => $subscription->user->name,
                        'amount' => $subscription->amount,
                        'status' => $subscription->status,
                    ],
                    'created_at' => $subscription->created_at->toISOString(),
                    'time_ago' => $subscription->created_at->diffForHumans(),
                ];
            });

        // New user registrations (last 7 days untuk relevansi)
        $newUsers = User::where('role', User::ROLE_USER)
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => 'user_' . $user->id,
                    'type' => 'user',
                    'title' => 'New User Registration',
                    'message' => $user->name . ' registered',
                    'data' => [
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'user_email' => $user->email,
                    ],
                    'created_at' => $user->created_at->toISOString(),
                    'time_ago' => $user->created_at->diffForHumans(),
                ];
            });

        // Combine and sort by created_at (max 20 items)
        $notifications = $pendingPayments->concat($newUsers)
            ->sortByDesc('created_at')
            ->values()
            ->take(20);

        return response()->json([
            'notifications' => $notifications,
            // We do not persist read-state; keep badge cleared on load
            'unread_count' => 0,
        ]);
    }

    public function chartData()
    {
        $days = collect(range(6, 0))->map(function ($i) {
            $date = Carbon::today()->subDays($i);
            return [
                'date' => $date,
                'label' => $date->format('d M'),
            ];
        });

        $registrations = $days->map(function ($day) {
            $count = User::where('role', User::ROLE_USER)
                ->whereDate('created_at', $day['date'])
                ->count();

            return array_merge($day, ['count' => $count]);
        });

        $completions = $days->map(function ($day) {
            $count = ModuleProgress::whereNotNull('completed_at')
                ->whereDate('completed_at', $day['date'])
                ->count();

            return array_merge($day, ['count' => $count]);
        });

        $payments = $days->map(function ($day) {
            $approved = Subscription::where('status', Subscription::STATUS_APPROVED)
                ->whereDate('created_at', $day['date']);

            return array_merge($day, [
                'count' => (clone $approved)->count(),
                'amount' => (clone $approved)->sum('amount'),
            ]);
        });

        $statusSummary = [
            'pending' => Subscription::where('status', Subscription::STATUS_PENDING)->count(),
            'approved' => Subscription::where('status', Subscription::STATUS_APPROVED)->count(),
            'rejected' => Subscription::where('status', Subscription::STATUS_REJECTED)->count(),
        ];

        return response()->json([
            'registrations' => $registrations,
            'completions' => $completions,
            'payments' => $payments,
            'status_summary' => $statusSummary,
        ]);
    }

    /**
     * Clear notifications (stateless: just return empty + unread 0).
     * Frontend will handle local state; we don't persist read-state yet.
     */
    public function clearNotifications()
    {
        return response()->json([
            'notifications' => [],
            'unread_count' => 0,
        ]);
    }
}

