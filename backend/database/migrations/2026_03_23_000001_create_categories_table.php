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
        Schema::create('categories', function (Blueprint $iv) {
            $iv->id();
            $iv->string('name');
            $iv->string('slug')->unique();
            $iv->text('description')->nullable();
            $iv->string('image')->nullable();
            $iv->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('set null');
            $iv->boolean('is_active')->default(true);
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
