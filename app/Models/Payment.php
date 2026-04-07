<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'bill_id', 'amount_paid', 'payment_method', 
        'receipt_image_path', 'paid_at'
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }
}