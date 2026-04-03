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
        Schema::create('shipping_addresses', function (Blueprint $iv) {
            $iv->id();
            $iv->foreignId('order_id')->constrained()->onDelete('cascade');
            $iv->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $iv->string('full_name');
            $iv->string('phone');
            $iv->string('address_line1');
            $iv->string('address_line2')->nullable();
            $iv->string('city');
            $iv->string('state');
            $iv->string('zip');
            $iv->string('country');
            $iv->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_addresses');
    }
};
