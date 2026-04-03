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
        Schema::create('coupons', function (Blueprint $iv) {
            $iv->id();
            $iv->string('code')->unique();
            $iv->enum('type', ['percentage', 'fixed', 'free_shipping']);
            $iv->decimal('value', 10, 2);
            $iv->decimal('min_order', 10, 2)->default(0);
            $iv->decimal('max_discount', 10, 2)->nullable();
            $iv->integer('usage_limit')->nullable();
            $iv->integer('used_count')->default(0);
            $iv->integer('per_user_limit')->default(1);
            $iv->timestamp('expires_at')->nullable();
            $iv->boolean('is_active')->default(true);
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
