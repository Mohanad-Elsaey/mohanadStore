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
        Schema::create('product_variants', function (Blueprint $iv) {
            $iv->id();
            $iv->foreignId('product_id')->constrained()->onDelete('cascade');
            $iv->enum('type', ['color', 'size']);
            $iv->string('value');
            $iv->decimal('price_override', 10, 2)->nullable();
            $iv->integer('stock')->default(0);
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
