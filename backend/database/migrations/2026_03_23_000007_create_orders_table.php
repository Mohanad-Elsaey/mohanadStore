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
        Schema::create('orders', function (Blueprint $iv) {
            $iv->id();
            $iv->string('order_number')->unique();
            $iv->foreignId('user_id')->constrained()->onDelete('cascade');
            $iv->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $iv->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $iv->string('payment_method');
            $iv->decimal('subtotal', 10, 2);
            $iv->decimal('shipping_cost', 10, 2)->default(0);
            $iv->decimal('discount', 10, 2)->default(0);
            $iv->decimal('tax', 10, 2)->default(0);
            $iv->decimal('total', 10, 2);
            $iv->text('notes')->nullable();
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
