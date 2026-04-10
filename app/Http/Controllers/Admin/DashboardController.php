<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Property;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // For now, let's just grab the first property she owns
        $activeProperty = $user->properties()->first();

        // If she has no properties, just load the page without data
        if (!$activeProperty) {
            return Inertia::render('Dashboard', [
                'hasProperty' => false
            ]);
        }

        // 1. Fetch UNPAID leases and roll up amounts
        $unpaidLeases = \App\Models\Lease::whereHas('bills', function ($q) {
                $q->whereIn('status', ['unpaid', 'partial']);
            })
            ->whereHas('room', function ($query) use ($activeProperty) {
                $query->where('property_id', $activeProperty->id);
            })
            ->with(['room', 'tenants', 'bills' => function ($q) {
                $q->whereIn('status', ['unpaid', 'partial'])->with('payments');
            }])
            ->get()
            ->map(function ($lease) {
                $totalOwed = 0;
                $nearestDueDate = null;
                $billCount = 0;

                foreach ($lease->bills as $bill) {
                    $paid = $bill->payments->sum('amount_paid');
                    $bal = $bill->total_amount - $paid;
                    $totalOwed += $bal;
                    $billCount++;

                    if (!$nearestDueDate || $bill->due_date < $nearestDueDate) {
                        $nearestDueDate = $bill->due_date;
                    }
                }

                return [
                    'id' => $lease->id,
                    'room' => $lease->room,
                    'tenants' => $lease->tenants,
                    'total_outstanding' => $totalOwed,
                    'due_date' => $nearestDueDate,
                    'bill_count' => $billCount,
                ];
            });


        // 2. Calculate Expected Revenue (Sum of all bills generated this month)
        $currentMonth = now()->month;
        $currentYear = now()->year;

        $expectedRevenue = Bill::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->whereHas('lease.room', function ($query) use ($activeProperty) {
                $query->where('property_id', $activeProperty->id);
            })
            ->sum('total_amount');

        // 3. Calculate Collected So Far (Sum of all payments made this month)
        $collectedSoFar = Payment::whereMonth('paid_at', $currentMonth)
            ->whereYear('paid_at', $currentYear)
            ->whereHas('bill.lease.room', function ($query) use ($activeProperty) {
                $query->where('property_id', $activeProperty->id);
            })
            ->sum('amount_paid');

        // Send the data to the React frontend
        return Inertia::render('Dashboard', [
            'hasProperty' => true,
            'activeProperty' => $activeProperty,
            'unpaidLeases' => $unpaidLeases,
            'expectedRevenue' => $expectedRevenue,
            'collectedSoFar' => $collectedSoFar,
        ]);
    }
}