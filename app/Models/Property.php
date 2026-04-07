<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = ['admin_id', 'name', 'address'];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}