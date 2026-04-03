<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrderController extends Controller
{
    use AuthorizesRequests;

    /**
     * Place order from current user's cart.
     */
    public function store(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'full_name' => 'required|string',
            'phone' => 'required|string',
            'address_line1' => 'required|string',
            'city' => 'required|string',
            'state' => 'nullable|string',
            'zip' => 'nullable|string',
            'country' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $cart = Cart::where('user_id', $request->user()->id)->first();
        if (!$cart || $cart->cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 422);
        }

        return DB::transaction(function () use ($request, $cart) {
            $subtotal = $cart->cartItems->reduce(fn ($carry, $item) => $carry + ($item->price * $item->quantity), 0);
            
            $discount = 0;
            $coupon = null;
            $couponCode = $cart->coupon_code;
            if ($couponCode) {
                $coupon = Coupon::where('code', $couponCode)->first();
                if ($coupon && $coupon->is_active && $subtotal >= $coupon->min_order) {
                    // Check expiry
                    if ($coupon->expires_at && $coupon->expires_at < now()) {
                        $coupon = null;
                    } else {
                        if ($coupon->type === 'percentage') {
                            $discount = ($subtotal * $coupon->value) / 100;
                            if ($coupon->max_discount) $discount = min($discount, $coupon->max_discount);
                        } elseif ($coupon->type === 'fixed') {
                            $discount = $coupon->value;
                        }
                    }
                }
            }

            $shipping = ($subtotal > 100 || ($coupon && $coupon->type === 'free_shipping')) ? 0 : 10;
            $tax = ($subtotal - $discount) * 0.1;
            $total = ($subtotal - $discount) + $shipping + $tax;

            $order = Order::create([
                'order_number' => 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method,
                'subtotal' => $subtotal,
                'shipping_cost' => $shipping,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'notes' => $request->notes,
            ]);

            foreach ($cart->cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'name' => $item->product->name,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->price * $item->quantity,
                ]);
            }

            ShippingAddress::create([
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'full_name' => $request->full_name,
                'phone' => $request->phone,
                'address_line1' => $request->address_line1,
                'address_line2' => $request->address_line2 ?? '',
                'city' => $request->city,
                'state' => $request->state ?? '',
                'zip' => $request->zip ?? '',
                'country' => $request->country,
            ]);

            if ($coupon) {
                $coupon->increment('used_count');
                $order->statusHistory()->create([
                    'status' => 'pending',
                    'note' => 'Order placed with coupon: ' . $coupon->code,
                    'created_by' => $request->user()->id
                ]);
            } else {
                $order->statusHistory()->create([
                    'status' => 'pending',
                    'note' => 'Order placed successfully',
                    'created_by' => $request->user()->id
                ]);
            }

            $cart->cartItems()->delete();
            $cart->update(['coupon_code' => null]);

            // Dispatch events/emails would go here

            return new OrderResource($order->load(['items.product', 'items.variant', 'shippingAddress']));
        });
    }

    /**
     * List user's orders.
     */
    public function index(Request $request)
    {
        $query = Order::where('user_id', $request->user()->id)
            ->with(['items.product', 'items.variant'])
            ->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return OrderResource::collection($query->paginate(10));
    }

    /**
     * Show single order detail.
     */
    public function show($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['user', 'items.product', 'items.variant', 'shippingAddress', 'statusHistory'])
            ->firstOrFail();

        $this->authorize('view', $order);

        return new OrderResource($order);
    }

    /**
     * Cancel order.
     */
    public function cancel(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        
        $this->authorize('cancel', $order);

        $order->update(['status' => 'cancelled']);
        $order->statusHistory()->create([
            'status' => 'cancelled',
            'note' => $request->note ?? 'Order cancelled by customer',
            'created_by' => $request->user()->id
        ]);

        return new OrderResource($order);
    }

    /**
     * Mark order as completed (Confirmed by user).
     */
    public function complete(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        
        $this->authorize('complete', $order);

        $order->markAsCompleted();
        
        $order->statusHistory()->create([
            'status' => 'completed',
            'note' => 'Order completion confirmed by customer',
            'created_by' => $request->user()->id
        ]);

        return new OrderResource($order);
    }
}
