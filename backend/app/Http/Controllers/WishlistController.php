<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * List user's wishlist items.
     */
    public function index(Request $request)
    {
        $wishlist = Wishlist::where('user_id', $request->user()->id)
            ->with(['product.images', 'product.variants'])
            ->get();

        return ProductResource::collection($wishlist->map(fn ($w) => $w->product));
    }

    /**
     * Toggle product in wishlist.
     */
    public function toggle($productId)
    {
        $wishlist = Wishlist::where('user_id', auth()->id())
            ->where('product_id', $productId)
            ->first();

        if ($wishlist) {
            $wishlist->delete();
            return response()->json(['wishlisted' => false, 'message' => 'Removed from wishlist']);
        } else {
            Wishlist::create(['user_id' => auth()->id(), 'product_id' => $productId]);
            return response()->json(['wishlisted' => true, 'message' => 'Added to wishlist']);
        }
    }
}
