<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function destroy($id)
    {
        $subscription = Subscription::findOrFail($id);

        // Prevent deletion of approved payments to maintain user's approved status
        if ($subscription->isApproved()) {
            return response()->json([
                'message' => 'Cannot delete approved payment. User will lose their approved status.',
            ], 403);
        }

        // Delete payment proof file if exists
        if ($subscription->payment_proof && Storage::disk('public')->exists($subscription->payment_proof)) {
            Storage::disk('public')->delete($subscription->payment_proof);
        }

        $subscription->delete();

        return response()->json([
            'message' => 'Payment request deleted successfully',
        ]);
    }
}

