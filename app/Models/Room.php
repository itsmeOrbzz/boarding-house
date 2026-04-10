<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $guarded = [];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function lease()
    {
        // Assuming one active lease per room for simplicity
        return $this->hasOne(Lease::class)->where('status', 'active');
    }

    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }
}