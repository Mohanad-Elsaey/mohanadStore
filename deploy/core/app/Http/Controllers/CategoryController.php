<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * List all categories.
     */
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->whereNull('parent_id')
            ->withCount('products')
            ->with('children')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Single category detail + paginated products.
     */
    public function show(Request $request, $slug)
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->with(['children'])
            ->firstOrFail();

        $query = $category->products()
            ->where('is_active', true)
            ->with(['images', 'variants']);

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Availability filter
        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'in_stock') {
                $query->where('stock', '>', 0);
            }
        }

        // Sort mapping
        $sortBy = $request->get('sort_by', 'newest');
        switch($sortBy) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $products = $query->paginate($request->get('px', 16));

        return response()->json([
            'category' => new CategoryResource($category),
            'products' => ProductResource::collection($products)->response()->getData(true),
        ]);
    }

    /**
     * Get children categories of a category.
     */
    public function subcategories($slug)
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return CategoryResource::collection($category->children()->where('is_active', true)->get());
    }
}
