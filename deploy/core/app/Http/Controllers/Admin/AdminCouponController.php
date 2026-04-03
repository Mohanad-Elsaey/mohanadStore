<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    /**
     * List all coupons.
     */
    public function index()
    {
        $coupons = Coupon::withCount('usages')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($coupons);
    }

    /**
     * Store new coupon.
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:coupons',
            'type' => 'required|in:percentage,fixed,free_shipping',
            'value' => 'required|numeric|min:0',
            'min_order' => 'nullable|numeric|min:0',
            'expires_at' => 'nullable|date|after_or_equal:today',
            'is_active' => 'boolean',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
        ]);

        $coupon = Coupon::create($request->all());

        return response()->json($coupon, 201);
    }

    /**
     * Update coupon status/details.
     */
    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);
        
        $request->validate([
            'code' => 'required|string|unique:coupons,code,'.$id,
            'is_active' => 'boolean',
        ]);

        $coupon->update($request->all());

        return response()->json($coupon);
    }

    /**
     * Delete coupon.
     */
    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted successfully']);
    }

    /**
     * Get usage history for admin.
     */
    public function report($id)
    {
        $coupon = Coupon::with(['usages.user', 'usages.order'])->findOrFail($id);
        return response()->json($coupon);
    }

    /**
     * Toggle coupon status.
     */
    public function toggle($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update(['is_active' => !$coupon->is_active]);

        return response()->json($coupon);
    }
}
