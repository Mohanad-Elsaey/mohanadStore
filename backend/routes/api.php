<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminCouponController;
use App\Http\Controllers\Admin\AdminStatsController;
use App\Http\Controllers\Admin\AdminSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/


// --- PUBLIC ROUTES (No Auth Required) ---


// Auth
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOTP']);
    Route::post('/resend-otp', [AuthController::class, 'resendOTP']);
});

// Products
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/new-arrivals', [ProductController::class, 'newArrivals']);
    Route::get('/best-sellers', [ProductController::class, 'bestSellers']);
    Route::get('/{slug}', [ProductController::class, 'show']);
});

// Categories
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{slug}', [CategoryController::class, 'show']);
    Route::get('/{slug}/subcategories', [CategoryController::class, 'subcategories']);
});

// Reviews (Public list)
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);


// --- PROTECTED ROUTES (Customer Auth Required) ---

Route::middleware(['auth:sanctum', 'is_not_banned'])->group(function () {
    
    // Auth Me & Logout & Profile
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::prefix('profile')->group(function () {
        Route::put('/', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
        Route::post('/avatar', [AuthController::class, 'updateAvatar']);
    });

    // Cart
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'add']);
        Route::patch('/{itemId}', [CartController::class, 'update']);
        Route::delete('/{itemId}', [CartController::class, 'remove']);
        Route::delete('/', [CartController::class, 'clear']);
        Route::post('/coupon', [CartController::class, 'applyCoupon']);
        Route::delete('/coupon', [CartController::class, 'removeCoupon']);
    });

    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{orderNumber}', [OrderController::class, 'show']);
        Route::post('/{orderNumber}/cancel', [OrderController::class, 'cancel']);
        Route::post('/{orderNumber}/complete', [OrderController::class, 'complete']);
    });

    // Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('/{productId}/toggle', [WishlistController::class, 'toggle']);
    });

    // Reviews (Post review)
    Route::post('/products/{productId}/review', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

});


// --- ADMIN ROUTES (Admin Auth Required) ---

Route::middleware(['auth:sanctum', 'is_admin'])->prefix('admin')->group(function () {
    
    // Admin Stats
    Route::get('/dashboard', [AdminStatsController::class, 'dashboard']);
    Route::get('/stats', [AdminStatsController::class, 'dashboard']); // Frontend Expects /stats
    Route::get('/reports/sales', [AdminStatsController::class, 'salesReport']);

    // Admin Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [AdminSettingsController::class, 'index']);
        Route::post('/', [AdminSettingsController::class, 'update']);
    });

    // Admin Products
    Route::prefix('products')->group(function () {
        Route::get('/', [AdminProductController::class, 'index']);
        Route::post('/', [AdminProductController::class, 'store']);
        Route::put('/{id}', [AdminProductController::class, 'update']);
        Route::delete('/{id}', [AdminProductController::class, 'destroy']);
        Route::post('/{id}/images', [AdminProductController::class, 'uploadImages']);
        Route::delete('/{id}/images/{imageId}', [AdminProductController::class, 'deleteImage']);
        Route::patch('/{id}/images/{imageId}/main', [AdminProductController::class, 'setMainImage']);
    });

    // Admin Categories
    Route::prefix('categories')->group(function () {
        Route::get('/', [AdminCategoryController::class, 'index']);
        Route::post('/', [AdminCategoryController::class, 'store']);
        Route::put('/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/{id}', [AdminCategoryController::class, 'destroy']);
    });

    // Admin Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index']);
        Route::get('/{id}', [AdminOrderController::class, 'show']);
        Route::patch('/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::post('/{id}/tracking', [AdminOrderController::class, 'addTracking']);
        Route::get('/{id}/invoice', [AdminOrderController::class, 'invoice']);
        Route::delete('/{id}', [AdminOrderController::class, 'destroy']);
    });

    // Admin Users
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index']);
        Route::get('/{id}', [AdminUserController::class, 'show']);
        Route::post('/{id}/ban', [AdminUserController::class, 'ban']);
        Route::post('/{id}/unban', [AdminUserController::class, 'unban']);
        Route::post('/{id}/toggle-role', [AdminUserController::class, 'toggleRole']);
        Route::delete('/{id}', [AdminUserController::class, 'destroy']);
    });

    // Admin Coupons
    Route::prefix('coupons')->group(function () {
        Route::get('/', [AdminCouponController::class, 'index']);
        Route::post('/', [AdminCouponController::class, 'store']);
        Route::patch('/{id}', [AdminCouponController::class, 'update']);
        Route::post('/{id}/toggle', [AdminCouponController::class, 'toggle']);
        Route::delete('/{id}', [AdminCouponController::class, 'destroy']);
        Route::get('/{id}/usage', [AdminCouponController::class, 'report']);
    });

});
