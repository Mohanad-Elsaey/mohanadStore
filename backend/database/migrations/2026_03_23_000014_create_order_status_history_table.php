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
        Schema::create('order_status_history', function (Blueprint $iv) {
            $iv->id();
            $iv->foreignId('order_id')->constrained()->onDelete('cascade');
            $iv->string('status');
            $iv->text('note')->nullable();
            $iv->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
    }
};
