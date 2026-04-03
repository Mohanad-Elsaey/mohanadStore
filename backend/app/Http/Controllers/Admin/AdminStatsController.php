<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    /**
     * Get dashboard summary overview.
     */
    public function dashboard(Request $request)
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Totals
        $totalSales = Order::where('payment_status', 'paid')->sum('total');
        $totalOrders = Order::count();
        $totalCustomers = User::where('role', 'customer')->count();
        
        // Month stats
        $monthSales = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total');
        $monthOrdersCount = Order::where('created_at', '>=', $startOfMonth)->count();

        // Stock alerts
        $lowStockProducts = Product::where('stock', '<=', \DB::raw('low_stock_threshold'))
            ->where('is_active', true)
            ->with('category')
            ->get();

        // Recent Orders
        $recentOrders = Order::with('user')->latest()->limit(10)->get();

        // Chart Data (Sales for last 30 days)
        $salesPerDay = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Orders by status
        $ordersByStatus = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        // Top Products
        $topProducts = Product::withCount(['orderItems as total_sold' => function($query) {
                $query->select(\DB::raw('sum(quantity)'));
            }])
            ->with(['category', 'images'])
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'summary' => [
                    'total_sales' => $totalSales,
                    'total_orders' => $totalOrders,
                    'total_customers' => $totalCustomers,
                'total_products' => \App\Models\Product::count(),
                'inventory_value' => \App\Models\Product::sum(\Illuminate\Support\Facades\DB::raw('price * stock')),
                    'month_sales' => $monthSales,
                    'month_orders' => $monthOrdersCount,
                    'stock_alerts_count' => $lowStockProducts->count(),
                    'orders_by_status' => $ordersByStatus,
                ],
                'low_stock_products' => $lowStockProducts,
                'recent_orders' => $recentOrders,
                'chart_data' => $salesPerDay,
                'top_products' => $topProducts,
            ]
        ]);
    }

    /**
     * Detailed sales report for any date range.
     */
    public function salesReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $sales = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59'])
            ->with(['user', 'items.product'])
            ->get();

        return response()->json([
            'count' => $sales->count(),
            'total_sales' => $sales->sum('total'),
            'orders' => $sales,
        ]);
    }
}
