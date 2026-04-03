<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fashionImages = [
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800',
            'https://images.unsplash.com/photo-1507679799987-c7377bc5851e?q=80&w=800',
            'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=800',
            'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800',
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
            'https://images.unsplash.com/photo-1579294528373-c8f95c023d04?q=80&w=800',
            'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800',
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800',
        ];

        Product::factory(50)->create()->each(function ($product) use ($fashionImages) {
            // Seed 3 images for each product
            $imageCount = 3;
            for ($i = 0; $i < $imageCount; $i++) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $fashionImages[array_rand($fashionImages)],
                    'is_main' => $i === 0,
                    'order' => $i
                ]);
            }

            // Seed color variants
            $colors = ['Red', 'Blue', 'Black', 'White', 'Midnight'];
            $selectedColors = array_rand(array_flip($colors), rand(2, 3));
            foreach ((array)$selectedColors as $color) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'type' => 'color',
                    'value' => $color,
                    'stock' => rand(5, 50)
                ]);
            }

            // Seed size variants
            $sizes = ['S', 'M', 'L', 'XL'];
            foreach ($sizes as $size) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'type' => 'size',
                    'value' => $size,
                    'stock' => rand(5, 50)
                ]);
            }
        });
    }
}
