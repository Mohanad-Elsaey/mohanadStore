<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
use App\Models\ProductVariant;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'payment_status',
        'payment_method',
        'subtotal',
        'shipping_cost',
        'discount',
        'tax',
        'total',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function shippingAddress()
    {
        return $this->hasOne(ShippingAddress::class);
    }

    /**
     * Mark the order as complete, realizing revenue and reducing inventory.
     */
    public function markAsCompleted()
    {
        if ($this->status === 'completed') {
            return;
        }

        $this->update([
            'status' => 'completed',
            'payment_status' => 'paid',
        ]);

        foreach ($this->items as $item) {
            if ($item->variant_id) {
                // Decrement variant stock
                ProductVariant::where('id', $item->variant_id)->decrement('stock', $item->quantity);
            } else {
                // Decrement product stock
                Product::where('id', $item->product_id)->decrement('stock', $item->quantity);
            }
        }
    }
}
