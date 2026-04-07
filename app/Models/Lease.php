<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lease extends Model
{
    protected $fillable = [
        'room_id', 'user_id', 'rent_amount', 'water_amount', 
        'internet_amount', 'default_kwh_rate', 'billing_day', 
        'status', 'qr_token'
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function tenant() // The user attached to the lease
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }
}