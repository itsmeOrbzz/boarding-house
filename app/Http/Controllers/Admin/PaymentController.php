<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Lease;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request, Lease $lease)
    {
        // 1. Find all unpaid or partial bills, oldest first
        $unpaidBills = $lease->bills()->whereIn('status', ['unpaid', 'partial'])->orderBy('created_at', 'asc')->get();
        
        // 2. Calculate the absolute maximum they are allowed to pay
        $maxPayable = 0;
        foreach ($unpaidBills as $bill) {
            $paidSoFar = $bill->payments()->sum('amount_paid');
            $maxPayable += ($bill->total_amount - $paidSoFar);
        }

        // 3. Validate
        $request->validate([
            'amount_paid' => [
                'required', 
                'numeric', 
                'min:1',
                'max:' . $maxPayable // Prevents overpaying the lease
            ],
        ], [
            'amount_paid.max' => 'You cannot log a payment larger than the remaining balance of ₱' . number_format($maxPayable, 2) . '.',
        ]);

        $remainingPayment = $request->amount_paid;

        // 4. Cascade the payment across the oldest bills first
        foreach ($unpaidBills as $bill) {
            if ($remainingPayment <= 0) break;

            $paidSoFar = $bill->payments()->sum('amount_paid');
            $owedOnBill = $bill->total_amount - $paidSoFar;

            if ($owedOnBill > 0) {
                // Determine how much to put towards this bill
                $amountToApply = min($remainingPayment, $owedOnBill);
                
                // Record it
                Payment::create([
                    'bill_id' => $bill->id,
                    'amount_paid' => $amountToApply,
                    'payment_method' => 'cash',
                    'paid_at' => now(),
                ]);

                // Deduct from our floating payment amount
                $remainingPayment -= $amountToApply;

                // Smart status update for this bill
                $newPaidTotal = $bill->payments()->sum('amount_paid');
                if ($newPaidTotal >= $bill->total_amount) {
                    $bill->update(['status' => 'paid']);
                } else {
                    $bill->update(['status' => 'partial']);
                }
            }
        }

        return redirect()->back()->with('success', 'Payment logged successfully!');
    }
}