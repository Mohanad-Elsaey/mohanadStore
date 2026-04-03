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
        Schema::create('cart_items', function (Blueprint $iv) {
            $iv->id();
            $iv->foreignId('cart_id')->constrained()->onDelete('cascade');
            $iv->foreignId('product_id')->constrained()->onDelete('cascade');
            $iv->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('cascade');
            $iv->integer('quantity')->default(1);
            $iv->decimal('price', 10, 2);
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
