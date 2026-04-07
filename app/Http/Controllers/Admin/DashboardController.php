<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Property;
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

        // Fetch all UNPAID bills specifically for this active property
        $unpaidBills = Bill::where('status', 'unpaid')
            ->whereHas('lease.room', function ($query) use ($activeProperty) {
                $query->where('property_id', $activeProperty->id);
            })
            // Eager load the relationships so React can see the tenant's name and room number
            ->with(['lease.tenant', 'lease.room']) 
            ->get();

        // Send the data to the React frontend
        return Inertia::render('Dashboard', [
            'hasProperty' => true,
            'activeProperty' => $activeProperty,
            'unpaidBills' => $unpaidBills,
        ]);
    }
}