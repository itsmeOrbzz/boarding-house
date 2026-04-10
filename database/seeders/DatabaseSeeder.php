<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Property;
use App\Models\Room;
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
            'password' => Hash::make('password'),
        ]);

        // 2. Create the Main Property
        $house = Property::create([
            'admin_id' => $admin->id, 
            'name' => 'Rose Boarding House', 
            'address' => 'Main Street'
        ]);

        // 3. Create 9 Rooms for 3rd Floor
        foreach (range(1, 9) as $i) {
            Room::create([
                'property_id' => $house->id, 
                'room_number' => 'Room ' . $i, 
                'floor' => 3,
                'capacity' => 2
            ]);
        }

        // 4. Create 9 Rooms for 4th Floor
        foreach (range(1, 9) as $i) {
            Room::create([
                'property_id' => $house->id, 
                'room_number' => 'Room ' . $i, 
                'floor' => 4,
                'capacity' => 2
            ]);
        }

        echo "Database wiped and seeded cleanly with 18 rooms!\n";
        echo "Log in with admin@test.com / password \n";
    }
}