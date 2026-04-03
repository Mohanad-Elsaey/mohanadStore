<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * List all orders (for admin table).
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.product'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->filled('search')) {
            $query->where('order_number', 'like', '%' . $request->search . '%')
                ->orWhereHas('user', function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
                });
        }

        return OrderResource::collection($query->paginate(20));
    }

    /**
     * Get single order detail (full).
     */
    public function show($id)
    {
        $order = Order::with(['user', 'items.product', 'items.variant', 'shippingAddress', 'statusHistory.creator'])
            ->findOrFail($id);

        return new OrderResource($order);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,completed,cancelled',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
            'note' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);
        
        $oldStatus = $order->status;

        if ($request->status === 'completed' && $oldStatus !== 'completed') {
            $order->markAsCompleted();
            if ($request->has('note')) {
                $order->statusHistory()->create([
                    'status' => 'completed',
                    'note' => $request->note,
                    'created_by' => $request->user()->id
                ]);
            }
        } else {
            $order->update($request->only('status', 'payment_status'));
            if ($oldStatus !== $request->status) {
                $order->statusHistory()->create([
                    'status' => $request->status,
                    'note' => $request->note ?? 'Status updated to: ' . $request->status,
                    'created_by' => $request->user()->id
                ]);
            }
        }

        return new OrderResource($order->load('statusHistory'));
    }

    /**
     * Add tracking number to order.
     */
    public function addTracking(Request $request, $id)
    {
        $request->validate([
            'tracking_number' => 'required|string',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['tracking_number' => $request->tracking_number]);

        return new OrderResource($order);
    }

    /**
     * Generate invoice PDF.
     */
    public function invoice($id)
    {
        $order = Order::with(['user', 'items.product', 'shippingAddress'])->findOrFail($id);
        
        // Check if PDF package exists, else return JSON
        if (class_exists('Barryvdh\DomPDF\Facade\Pdf')) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('emails.invoice', compact('order'));
            return $pdf->download('invoice-' . $order->order_number . '.pdf');
        }

        return response()->json([
            'message' => 'PDF driver not installed. Showing raw invoice data.',
            'order' => $order
        ]);
    }

    /**
     * Delete order (Soft delete).
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }
}
