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
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('rent_amount', 10, 2)->default(0);
            $table->decimal('water_amount', 10, 2)->default(0);
            $table->decimal('internet_amount', 10, 2)->default(0);
            $table->decimal('default_kwh_rate', 8, 2)->default(20);
            $table->integer('billing_day'); // Day of the month (1-28)
            $table->enum('status', ['active', 'ended'])->default('active');
            $table->string('qr_token')->unique()->nullable();
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
