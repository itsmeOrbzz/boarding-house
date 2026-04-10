<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // The landlady
            $table->foreignId('room_id')->constrained()->cascadeOnDelete(); // The room
            
            // The Room's Financial Rules
            $table->decimal('rent_amount', 10, 2)->default(0);
            $table->decimal('water_amount', 10, 2)->default(0);
            $table->decimal('internet_amount', 10, 2)->default(0);
            $table->decimal('default_kwh_rate', 8, 2)->default(0);
            
            $table->string('status')->default('active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leases');
    }
};
