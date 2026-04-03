<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $adjectives = ['Oversized', 'Structured', 'Minimalist', 'Luxe', 'Raw', 'Tailored', 'Draped', 'Premium', 'Async', 'Signature', 'Urban', 'Artisanal'];
        $materials = ['Wool', 'Silk', 'Cashmere', 'Leather', 'Japanese Denim', 'Organic Cotton', 'Heavyweight Velvet'];
        $silhouettes = ['Blazer', 'Blouson', 'Coat', 'Trousers', 'Shirt', 'Knit', 'Bag', 'Cardigan', 'Tank', 'Wrap'];
        
        $name = $this->faker->randomElement($adjectives) . ' ' . 
                $this->faker->randomElement($materials) . ' ' . 
                $this->faker->randomElement($silhouettes);
                
        $price = $this->faker->randomFloat(2, 85, 2400); // Premium pricing
        $isOnSale = $this->faker->boolean(15); // Rare sales for exclusivity

        return [
            'name' => $name,
            'slug' => Str::slug($name . '-' . $this->faker->unique()->randomNumber(4)),
            'description' => $this->faker->paragraphs(4, true), // Detailed formal descriptions
            'price' => $price,
            'sale_price' => $isOnSale ? $price * 0.85 : null,
            'sku' => strtoupper(Str::random(12)),
            'stock' => $this->faker->numberBetween(5, 45), // Limited stock availability
            'low_stock_threshold' => 3,
            'category_id' => Category::whereNotNull('parent_id')->inRandomOrder()->first()?->id ?? Category::inRandomOrder()->first()?->id,
            'is_active' => true,
            'is_featured' => $this->faker->boolean(25),
        ];
    }
}
