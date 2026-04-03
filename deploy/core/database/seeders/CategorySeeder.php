<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'New Editorials',
                'description' => 'The season\'s most provocative and progressive silhouettes.',
                'image' => 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000',
                'subcategories' => ['Spring Drop', 'Summer Solstice', 'Autumn Shift']
            ],
            [
                'name' => 'Urban Archive',
                'description' => 'Reimagined street aesthetics for the modern metropolitan.',
                'image' => 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000',
                'subcategories' => ['Streetwear', 'Outerwear', 'Utility']
            ],
            [
                'name' => 'Essential Tailor',
                'description' => 'The foundation of the editorial wardrobe. Perfectly cut, timeless basics.',
                'image' => 'https://images.unsplash.com/photo-1507679799987-c7377bc5851e?q=80&w=1000',
                'subcategories' => ['Blazers', 'Shirts', 'Trousers']
            ],
            [
                'name' => 'Artisanal Craft',
                'description' => 'Celebrating texture, form, and the beauty of handcrafted details.',
                'image' => 'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=1000',
                'subcategories' => ['Knitwear', 'Accessories', 'Handbags']
            ],
            [
                'name' => 'Minimalist Luxury',
                'description' => 'Quiet movements in high-end design. Silence is the ultimate luxury.',
                'image' => 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=1000',
                'subcategories' => ['Silk', 'Cashmere', 'Leather']
            ],
            [
                'name' => 'Limitless Denim',
                'description' => 'Premium Japanese and Italian denim, engineered for longevity.',
                'image' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000',
                'subcategories' => ['Raw Denim', 'Vintage Wash', 'Black Edition']
            ],
        ];

        foreach ($categories as $catData) {
            $parent = Category::create([
                'name' => $catData['name'],
                'slug' => Str::slug($catData['name']),
                'description' => $catData['description'],
                'image' => $catData['image'] ?? null,
                'is_active' => true,
            ]);

            foreach ($catData['subcategories'] as $subName) {
                Category::create([
                    'name' => $subName,
                    'slug' => Str::slug($subName),
                    'parent_id' => $parent->id,
                    'is_active' => true,
                ]);
            }
        }
    }
}
