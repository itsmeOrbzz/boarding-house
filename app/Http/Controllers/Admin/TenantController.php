<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Lease;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class TenantController extends Controller
{
    public function create(Request $request)
    {
        $activeProperty = $request->user()->properties()->first();

        // Get only VACANT rooms (rooms that do not have an active lease)
        $rooms = Room::where('property_id', $activeProperty->id)
            ->whereDoesntHave('lease', function ($query) {
                $query->where('status', 'active');
            })
            ->orderBy('floor')
            ->orderBy('room_number')
            ->get();

        return Inertia::render('Tenants/Create', [
            'rooms' => $rooms,
            'propertyName' => $activeProperty->name
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validate the incoming data
        $request->validate([
            // Room & Financials
            'room_id' => 'required|exists:rooms,id',
            'rent_amount' => 'required|numeric|min:0',
            'water_amount' => 'required|numeric|min:0',
            'internet_amount' => 'required|numeric|min:0',
            'default_kwh_rate' => 'required|numeric|min:0',
            'starting_meter_reading' => 'required|numeric|min:0',
            'next_due_date' => 'required|date',
            
            // Tenants Array
            'tenants' => 'required|array|min:1',
            'tenants.*.name' => 'required|string|max:255',
            'tenants.*.phone' => 'nullable|string|max:20',
            'tenants.*.email' => 'nullable|email|max:255',
            'tenants.*.id_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // Max 5MB
        ]);

        // 2. Create the Room's Lease
        Lease::create([
            'user_id' => $request->user()->id,
            'room_id' => $request->room_id,
            'rent_amount' => $request->rent_amount,
            'water_amount' => $request->water_amount,
            'internet_amount' => $request->internet_amount,
            'default_kwh_rate' => $request->default_kwh_rate,
            'status' => 'active',
            'start_date' => now(),
            'next_due_date' => date('Y-m-d', strtotime($request->next_due_date)),
        ]);

        // 3. Update the Room's starting meter reading
        $room = Room::find($request->room_id);
        $room->update([
            'current_meter_reading' => $request->starting_meter_reading
        ]);

        // 4. Loop through the array of tenants and save them
        foreach ($request->tenants as $index => $tenantData) {
            $photoPath = null;

            // Handle the optional ID Photo upload
            if ($request->hasFile("tenants.{$index}.id_photo")) {
                $file = $request->file("tenants.{$index}.id_photo");
                // Saves to storage/app/public/id_photos
                $photoPath = $file->store('id_photos', 'public'); 
            }

            Tenant::create([
                'room_id' => $request->room_id,
                'name' => $tenantData['name'],
                'phone' => $tenantData['phone'] ?? null,
                'email' => $tenantData['email'] ?? null,
                'id_photo_path' => $photoPath,
            ]);
        }

        return redirect()->route('dashboard')->with('success', 'Room successfully occupied!');
    }
}