<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;

class AdminPaymentController extends Controller
{
    public function index()
    {
        $subscriptions = Subscription::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($subscriptions);
    }

    public function approve($id)
    {
        $subscription = Subscription::findOrFail($id);

        if ($subscription->isApproved()) {
            return response()->json(['message' => 'Subscription already approved'], 400);
        }

        $subscription->update([
            'status' => Subscription::STATUS_APPROVED,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Subscription approved successfully',
            'subscription' => $subscription->load('user'),
        ]);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string',
        ]);

        $subscription = Subscription::findOrFail($id);

        if ($subscription->isRejected()) {
            return response()->json(['message' => 'Subscription already rejected'], 400);
        }

        $subscription->update([
            'status' => Subscription::STATUS_REJECTED,
            'rejected_at' => now(),
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Subscription rejected',
            'subscription' => $subscription->load('user'),
        ]);
    }
}

