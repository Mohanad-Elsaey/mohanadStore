<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        $users = User::where('role', 'customer')->get();

        foreach ($products as $product) {
            $productUsers = $users->random(rand(1, 3));
            foreach ($productUsers as $user) {
                Review::create([
                    'product_id' => $product->id,
                    'user_id' => $user->id,
                    'rating' => rand(3, 5),
                    'title' => fake()->sentence(3),
                    'body' => fake()->paragraph(),
                    'is_approved' => true
                ]);
            }
        }
    }
}
