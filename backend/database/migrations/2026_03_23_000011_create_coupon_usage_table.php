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
        Schema::create('coupon_usage', function (Blueprint $iv) {
            $iv->id();
            $iv->foreignId('coupon_id')->constrained()->onDelete('cascade');
            $iv->foreignId('user_id')->constrained()->onDelete('cascade');
            $iv->foreignId('order_id')->constrained()->onDelete('cascade');
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupon_usage');
    }
};
