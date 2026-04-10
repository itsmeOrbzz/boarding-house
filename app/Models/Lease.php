<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lease extends Model
{
    protected $guarded = [];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * The landlady who manages this lease (previously misnamed "tenant").
     */
    public function landlord()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The actual tenants living in this room.
     * Tenants are linked to a room, and a lease shares that same room_id.
     */
    public function tenants()
    {
        return $this->hasMany(Tenant::class, 'room_id', 'room_id');
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }
}