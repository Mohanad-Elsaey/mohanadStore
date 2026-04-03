<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * List products with filters.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images', 'variants'])
            ->where('is_active', true);

        // Category filter (including subcategories)
        if ($request->filled('category_slug')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category_slug)
                  ->orWhereHas('parent', function ($pq) use ($request) {
                      $pq->where('slug', $request->category_slug);
                  });
            });
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Rating filter
        if ($request->filled('rating')) {
            $query->whereHas('reviews', function ($q) use ($request) {
                $q->where('is_approved', true)
                  ->groupBy('product_id')
                  ->havingRaw('AVG(rating) >= ?', [$request->rating]);
            });
        }

        // Sort mapping
        $sortBy = $request->get('sort_by', 'created_at');
        $sortColumn = match($sortBy) {
            'newest' => 'created_at',
            'oldest' => 'created_at',
            'price_low' => 'price',
            'price_high' => 'price',
            'name_asc' => 'name',
            'name_desc' => 'name',
             default => 'created_at'
        };
        
        $sortOrder = $request->get('sort_order');
        if (!$sortOrder) {
            $sortDirection = match($sortBy) {
                'oldest' => 'asc',
                'price_low' => 'asc',
                'name_asc' => 'asc',
                default => 'desc'
            };
        } else {
            $sortDirection = $sortOrder;
        }

        $query->orderBy($sortColumn, $sortDirection);

        $products = $query->paginate($request->get('per_page', 16));

        return ProductResource::collection($products);
    }

    /**
     * Get single product detail.
     */
    public function show($slug)
    {
        $product = Product::with(['category', 'images', 'variants', 'reviews' => function($q) {
            $q->where('is_approved', true)->with('user');
        }])
        ->where('slug', $slug)
        ->where('is_active', true)
        ->firstOrFail();

        return new ProductResource($product);
    }

    /**
     * Get featured products.
     */
    public function featured()
    {
        $products = Product::where('is_featured', true)
            ->where('is_active', true)
            ->with(['images', 'variants'])
            ->limit(8)
            ->get();

        return ProductResource::collection($products);
    }

    /**
     * Get new arrivals.
     */
    public function newArrivals()
    {
        $products = Product::where('is_active', true)
            ->with(['images', 'variants'])
            ->latest()
            ->limit(8)
            ->get();

        return ProductResource::collection($products);
    }

    /**
     * Get best sellers.
     */
    public function bestSellers()
    {
        $products = Product::where('is_active', true)
            ->with(['images', 'variants'])
            ->withCount('orderItems')
            ->orderBy('order_items_count', 'desc')
            ->limit(8)
            ->get();

        return ProductResource::collection($products);
    }
}
