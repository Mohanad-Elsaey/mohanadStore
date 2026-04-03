<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'MOHANED Admin',
            'email' => 'admin@mohaned-ecommerce.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+1 (555) 700-1000',
            'email_verified_at' => now(),
        ]);

        // Demo Elite Customer
        User::create([
            'name' => 'Elite Member',
            'email' => 'member@mohaned-ecommerce.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'phone' => '+1 (555) 900-2000',
            'email_verified_at' => now(),
            'country' => 'United Kingdom',
            'gender' => 'Other',
            'dob' => '1990-01-01',
        ]);

        // Systematic randomized customer generation
        User::factory(10)->create([
            'role' => 'customer'
        ]);
    }
}
