<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Coupon::create([
            'code' => 'SAVE10',
            'type' => 'percentage',
            'value' => 10,
            'min_order' => 50,
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'FLAT20',
            'type' => 'fixed',
            'value' => 20,
            'min_order' => 100,
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'FREESHIP',
            'type' => 'free_shipping',
            'value' => 0,
            'min_order' => 150,
            'is_active' => true,
        ]);
    }
}
