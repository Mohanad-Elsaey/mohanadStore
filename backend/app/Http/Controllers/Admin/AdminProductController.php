<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class AdminProductController extends Controller
{
    /**
     * List all products with admin filters.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'categories', 'images', 'variants']);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('category_id') && $request->category_id !== 'All Categories') {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }
        if ($request->filled('is_active') && $request->is_active !== 'All Status') {
            if ($request->is_active === 'Published') $query->where('is_active', true);
            if ($request->is_active === 'Draft') $query->where('is_active', false);
            if ($request->is_active === 'Out of Stock') $query->where('stock', '<=', 0);
        }
        if ($request->filled('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', (float)$request->min_price);
        }
        if ($request->filled('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', (float)$request->max_price);
        }

        return ProductResource::collection($query->paginate(20));
    }

    /**
     * Store new product.
     */
    public function store(Request $request)
    {
        \Log::info('Storing product with data: ', $request->all());
        
        $request->validate([
            'name' => 'required|string|max:255',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'price' => 'required|numeric|min:0',
            'sku' => 'required|unique:products',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'images.*' => 'nullable|image|mimes:jpeg,png,webp|max:10240',
            'variants' => 'nullable|array',
            'variants.*.type' => 'required|in:color,size',
            'variants.*.value' => 'required|string',
            'variants.*.price_override' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
        ], [
            'images.*.max' => 'حجم الصورة رقم :attribute يتجاوز 10 ميجابايت / Image :attribute exceeds 10MB',
            'images.*.image' => 'الملف رقم :attribute يجب أن يكون صورة / File :attribute must be an image',
        ]);

        // Keep the first category as the 'category_id' for backward compatibility
        $data = $request->except(['images', 'variants', 'category_ids']);
        $data['category_id'] = $request->category_ids[0];

        $product = Product::create($data);

        // Sync categories
        $product->categories()->sync($request->category_ids);

        // Handle multiple images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                $this->handleImageUpload($product, $imageFile);
            }
        }

        // Handle variants
        if ($request->has('variants')) {
            foreach ($request->variants as $variantData) {
                $product->variants()->create($variantData);
            }
        }

        return new ProductResource($product->load(['category', 'categories', 'images', 'variants']));
    }

    /**
     * Update product.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        \Log::info('Updating product '.$id.' with data: ', $request->all());

        $request->validate([
            'name' => 'required|string|max:255',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'price' => 'required|numeric|min:0',
            'sku' => 'required|unique:products,sku,'.$id,
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'images.*' => 'nullable|image|mimes:jpeg,png,webp|max:10240',
            'variants' => 'nullable|array',
            'variants.*.type' => 'required|in:color,size',
            'variants.*.value' => 'required|string',
            'variants.*.price_override' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
        ], [
            'images.*.max' => 'حجم الصورة رقم :attribute يتجاوز 10 ميجابايت / Image :attribute exceeds 10MB',
            'images.*.image' => 'الملف رقم :attribute يجب أن يكون صورة / File :attribute must be an image',
        ]);

        $data = $request->except(['images', 'variants', 'category_ids']);
        $data['category_id'] = $request->category_ids[0];

        $product->update($data);

        // Sync categories
        $product->categories()->sync($request->category_ids);

        // Handle additional images if any
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                $this->handleImageUpload($product, $imageFile);
            }
        }

        // Handle variants
        if ($request->has('variants')) {
            $product->variants()->delete();
            foreach ($request->variants as $variantData) {
                $product->variants()->create($variantData);
            }
        }

        return new ProductResource($product->load(['category', 'categories', 'images', 'variants']));
    }

    /**
     * Helper to handle image upload and resize.
     */
    protected function handleImageUpload($product, $imageFile)
    {
        $path = $imageFile->store('products', 'public');
        
        try {
            // Resize image to 800x800
            $img = Image::read(Storage::disk('public')->path($path));
            $img->cover(800, 800)->save();
        } catch (\Exception $e) {
            // Log or handle resize error if GD missing, fallback to raw upload
            \Log::error("Image resize failure: " . $e->getMessage());
        }

        ProductImage::create([
            'product_id' => $product->id,
            'image_path' => Storage::url($path),
            'is_main' => !$product->images()->exists(),
            'order' => $product->images()->count()
        ]);
    }

    /**
     * Soft delete product.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Upload product images with resize.
     */
    public function uploadImages(Request $request, $id)
    {
        $request->validate(['images.*' => 'required|image|mimes:jpeg,png,webp|max:2048']);
        $product = Product::findOrFail($id);

        foreach ($request->file('images') as $imageFile) {
            $path = $imageFile->store('products', 'public');
            
            // Resize image to 800x800
            $img = Image::read(Storage::disk('public')->path($path));
            $img->cover(800, 800)->save();

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => Storage::url($path),
                'is_main' => !$product->images()->exists(),
                'order' => $product->images()->count()
            ]);
        }

        return new ProductResource($product->load('images'));
    }

    /**
     * Delete product image.
     */
    public function deleteImage($id, $imageId)
    {
        $image = ProductImage::where('product_id', $id)->findOrFail($imageId);
        
        // delete from storage
        $filename = basename($image->image_path);
        Storage::disk('public')->delete('products/' . $filename);
        
        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    /**
     * Set image as main.
     */
    public function setMainImage($id, $imageId)
    {
        ProductImage::where('product_id', $id)->update(['is_main' => false]);
        ProductImage::where('product_id', $id)->where('id', $imageId)->update(['is_main' => true]);

        return response()->json(['message' => 'Main image updated']);
    }
}
