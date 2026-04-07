<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = ['property_id', 'room_number', 'capacity'];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function leases()
    {
        return $this->hasMany(Lease::class);
    }

    // Quick helper to get the current active tenant
    public function activeLease()
    {
        return $this->hasOne(Lease::class)->where('status', 'active');
    }
}