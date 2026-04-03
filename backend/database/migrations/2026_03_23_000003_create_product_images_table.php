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
        Schema::create('product_images', function (Blueprint $iv) {
            $iv->id();
            $iv->foreignId('product_id')->constrained()->onDelete('cascade');
            $iv->string('image_path');
            $iv->boolean('is_main')->default(false);
            $iv->integer('order')->default(0);
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
