<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $guarded = [];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}