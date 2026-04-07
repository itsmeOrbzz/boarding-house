<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Property;
use App\Models\Room;
use App\Models\Lease;
use App\Models\Bill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create the Landlady (Admin)
        $admin = User::create([
            'name' => 'Rose',
            'email' => 'admin@test.com',
            'contact_number' => '09123456789',
            'role' => 'admin',
            'password' => Hash::make('password'), // Easy password for testing
        ]);

        // 2. Create Two Properties
        $houseA = Property::create(['admin_id' => $admin->id, 'name' => 'House A - Main', 'address' => 'Main Street']);
        $houseB = Property::create(['admin_id' => $admin->id, 'name' => 'House B - Annex', 'address' => 'Second Street']);

        // 3. Create 5 Rooms for Each Property
        foreach (range(1, 5) as $i) {
            Room::create(['property_id' => $houseA->id, 'room_number' => 'Room ' . $i, 'capacity' => 2]);
            Room::create(['property_id' => $houseB->id, 'room_number' => 'Room ' . $i, 'capacity' => 2]);
        }

        // 4. Create a few Tenants (Boarders)
        $tenant1 = User::create(['name' => 'John Doe', 'contact_number' => '09990001111', 'role' => 'boarder']);
        $tenant2 = User::create(['name' => 'Jane Smith', 'contact_number' => '09990002222', 'role' => 'boarder']);
        $tenant3 = User::create(['name' => 'Mark Lee', 'contact_number' => '09990003333', 'role' => 'boarder']);

        // 5. Create Active Leases (Moving them into House A)
        $room1 = Room::where('room_number', 'Room 1')->where('property_id', $houseA->id)->first();
        $lease1 = Lease::create([
            'room_id' => $room1->id, 'user_id' => $tenant1->id,
            'rent_amount' => 8500, 'water_amount' => 200, 'internet_amount' => 0,
            'default_kwh_rate' => 20, 'billing_day' => 15, 'status' => 'active'
        ]);

        $room6 = Room::where('room_number', 'Room 2')->where('property_id', $houseA->id)->first();
        $lease2 = Lease::create([
            'room_id' => $room6->id, 'user_id' => $tenant2->id,
            'rent_amount' => 8000, 'water_amount' => 300, 'internet_amount' => 0,
            'default_kwh_rate' => 18, 'billing_day' => 15, 'status' => 'active'
        ]);

        // 6. Generate an Unpaid Bill for each Lease
        Bill::create([
            'lease_id' => $lease1->id,
            'prev_reading' => 12, 'curr_reading' => 71,
            'kwh_rate' => 20, 'total_amount' => 9880, // (71-12)*20 + 8500 + 200
            'status' => 'unpaid', 'due_date' => Carbon::now()->addDays(5)
        ]);

        Bill::create([
            'lease_id' => $lease2->id,
            'prev_reading' => 206, 'curr_reading' => 254,
            'kwh_rate' => 18, 'total_amount' => 9164, // (254-206)*18 + 8000 + 300
            'status' => 'unpaid', 'due_date' => Carbon::now()->addDays(5)
        ]);
        
        echo "Database seeded successfully! You can log in with admin@test.com / password \n";
    }
}