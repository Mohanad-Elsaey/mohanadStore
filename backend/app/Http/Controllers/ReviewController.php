<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Submit review (one per product per user).
     */
    public function store(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $product = Product::findOrFail($productId);
        
        // Ensure user only reviews once per product
        if (Review::where('product_id', $productId)->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'You have already reviewed this product.'], 422);
        }

        $review = Review::create([
            'product_id' => $productId,
            'user_id' => $request->user()->id,
            'rating' => $request->rating,
            'title' => $request->title,
            'body' => $request->body,
            'is_approved' => false, // Approval needed by admin
        ]);

        return response()->json([
            'message' => 'Review submitted successfully and is awaiting approval.',
            'review' => $review
        ], 201);
    }

    /**
     * Get paginated approved reviews.
     */
    public function index($productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->where('is_approved', true)
            ->with('user')
            ->latest()
            ->paginate(5);

        return response()->json($reviews);
    }

    /**
     * Delete own review.
     */
    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        
        if ($review->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
