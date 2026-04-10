<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Lease;
use App\Models\Bill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MeterController extends Controller
{
    public function index(Request $request)
    {
        $activeProperty = $request->user()->properties()->first();

        if (!$activeProperty) {
            return redirect()->route('dashboard');
        }

        // Grab all rooms in this house that currently have a tenant
        $rooms = Room::where('property_id', $activeProperty->id)
            ->whereHas('lease', function ($query) {
                $query->where('status', 'active'); // Only get rooms with active tenants
            })
            ->with(['tenants', 'lease' => function ($query) {
                $query->where('status', 'active'); // Attach the active lease rules
            }])
            ->orderBy('floor')
            ->orderBy('room_number')
            ->get();

        return Inertia::render('Meters/Clipboard', [
            'rooms' => $rooms,
            'propertyName' => $activeProperty->name
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'readings' => 'required|array',
            'readings.*.lease_id' => 'required|exists:leases,id',
            'readings.*.curr_reading' => 'required|numeric|gte:readings.*.prev_reading', // Must be >= prev reading!
            'readings.*.prev_reading' => 'required|numeric',
            'readings.*.default_rate' => 'required|numeric',
        ]);

        foreach ($request->readings as $data) {
            $lease = Lease::find($data['lease_id']);
            
            // Calculate usage and electricity cost
            $usage = $data['curr_reading'] - $data['prev_reading'];
            $electricity_cost = $usage * $data['default_rate'];
            
            // Grand total for the month
            $grand_total = $lease->rent_amount + $lease->water_amount + $electricity_cost;

            // Generate the Bill
            Bill::create([
                'lease_id' => $lease->id,
                'prev_reading' => $data['prev_reading'],
                'curr_reading' => $data['curr_reading'],
                'kwh_rate' => $data['default_rate'],
                'total_amount' => $grand_total,
                'status' => 'unpaid',
                'due_date' => $lease->due_date ?? now()->addDays(5),
            ]);

            // Advance the lease's due date for the NEXT month's cycle
            if ($lease->due_date) {
                $lease->update([
                    'due_date' => \Carbon\Carbon::parse($lease->due_date)->addMonth()
                ]);
            }
        }

        return redirect()->route('dashboard')->with('success', 'New bills generated successfully!');
    }
}