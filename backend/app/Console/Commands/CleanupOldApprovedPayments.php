<?php

/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode backend.
 * Manfaat: Menjaga logika server tetap terstruktur dan mudah dirawat.
 */

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupOldApprovedPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:cleanup-old';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete approved and rejected payment requests older than 7 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of old payment requests...');

        $cutoffDate = now()->subDays(7);
        
        // Get approved payments older than 7 days
        $oldApprovedPayments = Subscription::where('status', Subscription::STATUS_APPROVED)
            ->where('approved_at', '<=', $cutoffDate)
            ->get();

        // Get rejected payments older than 7 days
        $oldRejectedPayments = Subscription::where('status', Subscription::STATUS_REJECTED)
            ->where('rejected_at', '<=', $cutoffDate)
            ->get();

        $approvedCount = 0;
        $rejectedCount = 0;

        // Delete approved payments
        foreach ($oldApprovedPayments as $payment) {
            // Delete payment proof file if exists
            if ($payment->payment_proof && Storage::disk('public')->exists($payment->payment_proof)) {
                Storage::disk('public')->delete($payment->payment_proof);
            }

            // Delete the payment record
            $payment->delete();
            $approvedCount++;
        }

        // Delete rejected payments
        foreach ($oldRejectedPayments as $payment) {
            // Delete payment proof file if exists
            if ($payment->payment_proof && Storage::disk('public')->exists($payment->payment_proof)) {
                Storage::disk('public')->delete($payment->payment_proof);
            }

            // Delete the payment record
            $payment->delete();
            $rejectedCount++;
        }

        $totalDeleted = $approvedCount + $rejectedCount;
        $this->info("Cleanup completed. Deleted {$totalDeleted} old payment(s):");
        $this->info("  - {$approvedCount} approved payment(s)");
        $this->info("  - {$rejectedCount} rejected payment(s)");

        return Command::SUCCESS;
    }
}

