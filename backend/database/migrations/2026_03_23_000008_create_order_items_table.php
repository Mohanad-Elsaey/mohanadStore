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
        Schema::create('order_items', function (Blueprint $iv) {
            $iv->id();
            $iv->foreignId('order_id')->constrained()->onDelete('cascade');
            $iv->foreignId('product_id')->constrained()->onDelete('cascade');
            $iv->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('set null');
            $iv->string('name');
            $iv->decimal('price', 10, 2);
            $iv->integer('quantity')->default(1);
            $iv->decimal('total', 10, 2);
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
