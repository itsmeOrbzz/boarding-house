<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = [
        'lease_id', 'prev_reading', 'curr_reading', 'kwh_rate', 
        'total_amount', 'status', 'due_date'
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}