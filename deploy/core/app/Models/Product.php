<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory, Sluggable;

    /**
     * الحقول القابلة للتعبئة (Mass Assignable)
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'sale_price',
        'sku',
        'stock',
        'low_stock_threshold',
        'category_id',
        'is_active',
        'is_featured',
    ];

    /**
     * تحويل أنواع البيانات (Data Casting)
     */
    protected $casts = [
        'price'               => 'decimal:2',
        'sale_price'          => 'decimal:2',
        'stock'               => 'integer',
        'low_stock_threshold' => 'integer',
        'is_active'           => 'boolean',
        'is_featured'         => 'boolean',
    ];

    /**
     * الحقول الإضافية التي تظهر في الـ API تلقائياً
     */
    protected $appends = [
        'average_rating',
        'is_on_sale',
        'main_image_url',
        'image_url',
    ];

    // =========================================================================
    // 1. QUERY SCOPES (اختصارات البحث)
    // تسمح بتبسيط استعلامات البحث وتجعل الكود أكثر "نظافة"
    // =========================================================================

    /**
     * جلب المنتجات المفعلة فقط
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * جلب المنتجات المميزة (Featured)
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * جلب المنتجات المتوفرة فقط في المخزن
     */
    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * جلب المنتجات التي اقتربت من النفاذ (تحت حد التنبيه)
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stock', '<=', 'low_stock_threshold');
    }

    // =========================================================================
    // 2. ACCESSORS (بيانات محسوبة وتلقائية)
    // =========================================================================

    /**
     * حساب متوسط التقييم للتعليقات المعتمدة
     */
    public function getAverageRatingAttribute(): float
    {
        return (float) round($this->reviews()->where('is_approved', true)->avg('rating') ?: 0, 1);
    }

    /**
     * التحقق مما إذا كان المنتج عليه خصم فعال حالياً
     */
    public function getIsOnSaleAttribute(): bool
    {
        return !empty($this->sale_price) && $this->sale_price < $this->price;
    }

    /**
     * Get image URL (Consistency for frontend)
     */
    public function getImageUrlAttribute(): ?string
    {
        $path = $this->main_image_url;
        if (!$path) return null;
        return str_starts_with($path, 'http') ? $path : asset($path);
    }

    /**
     * الحصول على رابط الصورة الرئيسية (Main Image)
     */
    public function getMainImageUrlAttribute(): ?string
    {
        // Try to get from relation if loaded, else use query
        $image = $this->relationLoaded('images') 
            ? $this->images->where('is_main', true)->first() ?? $this->images->first()
            : $this->images()->where('is_main', true)->first() ?? $this->images()->first();

        return $image ? $image->image_path : null;
    }

    // =========================================================================
    // 3. RELATIONSHIPS (العلاقات بين الجداول)
    // =========================================================================

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    // =========================================================================
    // 4. HELPERS (وظائف مساعدة مبسطة)
    // =========================================================================

    /**
     * التحقق من توفر كمية معينة في المخزن
     */
    public function hasStock(int $quantity = 1): bool
    {
        return $this->stock >= $quantity;
    }

    // =========================================================================
    // 5. SLUGGABLE CONFIGURATION (إعدادات الرابط التلقائي)
    // =========================================================================

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'name'
            ]
        ];
    }
}
