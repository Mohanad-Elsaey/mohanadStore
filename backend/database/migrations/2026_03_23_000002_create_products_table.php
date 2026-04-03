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
        Schema::create('products', function (Blueprint $iv) {
            $iv->id();
            $iv->string('name');
            $iv->string('slug')->unique();
            $iv->text('description')->nullable();
            $iv->decimal('price', 10, 2);
            $iv->decimal('sale_price', 10, 2)->nullable();
            $iv->string('sku')->unique();
            $iv->integer('stock')->default(0);
            $iv->integer('low_stock_threshold')->default(5);
            $iv->foreignId('category_id')->constrained()->onDelete('cascade');
            $iv->boolean('is_active')->default(true);
            $iv->boolean('is_featured')->default(false);
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
