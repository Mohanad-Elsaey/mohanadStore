<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can cancel the model.
     */
    public function cancel(User $user, Order $order): bool
    {
        // User can cancel if the order is still pending or processing
        if ($user->role === 'admin') return true;

        return $user->id === $order->user_id && in_array($order->status, ['pending', 'processing']);
    }

    /**
     * Determine whether the user can mark the model as completed.
     */
    public function complete(User $user, Order $order): bool
    {
        // User can mark as completed ONLY if it was delivered or shipped
        if ($user->role === 'admin') return true;

        return $user->id === $order->user_id && in_array($order->status, ['shipped', 'delivered']);
    }

    /**
     * Determine whether the admin can update any aspect of the order.
     */
    public function update(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }
}
