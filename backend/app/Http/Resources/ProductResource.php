<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'on_sale' => !is_null($this->sale_price),
            'sku' => $this->sku,
            'stock' => $this->stock,
            'low_stock' => $this->stock <= $this->low_stock_threshold,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'image_url' => ($path = ($this->images->where('is_main', true)->first()?->image_path ?? $this->images->first()?->image_path)) ? (str_starts_with($path, 'http') ? $path : asset($path)) : null,
            'main_image' => ($path = ($this->images->where('is_main', true)->first()?->image_path ?? $this->images->first()?->image_path)) ? (str_starts_with($path, 'http') ? $path : asset($path)) : null,
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'average_rating' => $this->average_rating,
            'reviews_count' => $this->reviews_count ?? $this->reviews()->where('is_approved', true)->count(),
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'is_wishlisted' => $request->user()?->wishlists()->where('product_id', $this->id)->exists() ?? false,
            'created_at' => $this->created_at,
        ];
    }
}
