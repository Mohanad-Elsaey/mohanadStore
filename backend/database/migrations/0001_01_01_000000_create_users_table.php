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
        Schema::create('users', function (Blueprint $iv) {
            $iv->id();
            $iv->string('name');
            $iv->string('email')->unique();
            $iv->timestamp('email_verified_at')->nullable();
            $iv->string('password');
            $iv->string('phone')->nullable();
            $iv->enum('role', ['customer', 'admin'])->default('customer');
            $iv->boolean('is_banned')->default(false);
            $iv->string('avatar')->nullable();
            $iv->string('otp')->nullable();
            $iv->timestamp('otp_expires_at')->nullable();
            $iv->rememberToken();
            $iv->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $iv) {
            $iv->string('email')->primary();
            $iv->string('token');
            $iv->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $iv) {
            $iv->string('id')->primary();
            $iv->foreignId('user_id')->nullable()->index();
            $iv->string('ip_address', 45)->nullable();
            $iv->text('user_agent')->nullable();
            $iv->longText('payload');
            $iv->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
