import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getProductBySlug, getFeaturedProducts } from '../services/productService';
import { addToCart } from '../services/cartService';
import { toggleWishlist } from '../services/wishlistService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { token } = useAuthStore();
    
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedVariants, setSelectedVariants] = useState({});

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => getProductBySlug(slug),
    });

    const { data: featuredProducts } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: getFeaturedProducts,
    });

    const addToCartMutation = useMutation({
        mutationFn: (payload) => addToCart(payload),
        onMutate: async () => {
             await queryClient.cancelQueries({ queryKey: ['cart'] });
             const previousCart = queryClient.getQueryData(['cart']);
             queryClient.setQueryData(['cart'], (old) => {
                 const updated = old ? { ...old } : { items: [] };
                 return { ...updated, items: [...(updated.items || []), { id: 'temp-' + Date.now() }] };
             });
             return { previousCart };
        },
        onSuccess: () => {
            toast.success('Added to cart');
            queryClient.invalidateQueries(['cart']);
        },
        onError: (error, variables, context) => {
            queryClient.setQueryData(['cart'], context.previousCart);
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        },
        onSettled: () => {
            queryClient.invalidateQueries(['cart']);
        }
    });

    const wishlistMutation = useMutation({
        mutationFn: (id) => toggleWishlist(id),
        onMutate: async (id) => {
             await queryClient.cancelQueries({ queryKey: ['wishlist'] });
             await queryClient.cancelQueries({ queryKey: ['product', slug] });
             
             const previousWishlist = queryClient.getQueryData(['wishlist']);
             const previousProduct = queryClient.getQueryData(['product', slug]);
             
             queryClient.setQueryData(['wishlist'], (old) => {
                 const updated = old?.data ? { ...old } : { data: [] };
                 const exists = updated.data.some(p => p.id === id);
                 if (exists) {
                     updated.data = updated.data.filter(p => p.id !== id);
                 } else {
                     if(product) updated.data = [...updated.data, product];
                 }
                 return updated;
             });
             
             queryClient.setQueryData(['product', slug], (old) => {
                 if (!old) return old;
                 return { ...old, is_wishlisted: !old.is_wishlisted };
             });
             
             return { previousWishlist, previousProduct };
        },
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['wishlist'], context.previousWishlist);
            queryClient.setQueryData(['product', slug], context.previousProduct);
            toast.error(err.response?.data?.message || 'Wishlist operation failed');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            queryClient.invalidateQueries({ queryKey: ['product', slug] });
        }
    });

    useEffect(() => {
        if (product && product.variants) {
            const variantsByType = product.variants.reduce((acc, variant) => {
                const type = (variant.type || '').toLowerCase();
                if (!acc[type]) acc[type] = [];
                acc[type].push(variant);
                return acc;
            }, {});

            const initial = {};
            Object.entries(variantsByType).forEach(([type, items]) => {
                if (items.length > 0) initial[type] = items[0];
            });
            setSelectedVariants(initial);
        }
    }, [product]);

    if (isLoading) {
        return (
            <div className="pt-40 min-h-screen text-center flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) return (
        <div className="pt-40 text-center py-40 min-h-screen font-manrope">
            <h2 className="text-4xl font-black uppercase">Product Not Found</h2>
            <Link to="/products" className="mt-8 inline-block px-10 py-4 bg-primary text-white font-bold uppercase rounded-xl">Back to Shop</Link>
        </div>
    );

    const images = product.images?.length > 0 ? product.images : [{ image_path: product.image_url }];
    const activeImage = images[activeImageIndex]?.image_path || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200';

    const variantsByType = product.variants?.reduce((acc, variant) => {
        let type = (variant.type || '').toLowerCase() === 'color' ? 'color' : 'size';
        if (!acc[type]) acc[type] = [];
        acc[type].push(variant);
        return acc;
    }, {}) || {};

    const toggleVariant = (type, variant) => {
        setSelectedVariants(prev => ({
            ...prev,
            [type]: variant
        }));
    };

    const currentPrice = () => {
        let price = parseFloat(product.sale_price || product.price);
        Object.values(selectedVariants).forEach(v => {
            if (v.price_override) price = parseFloat(v.price_override);
        });
        return price;
    };

    const handleAddToCart = (redirect = false) => {
        if (!token) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        const variantId = Object.values(selectedVariants).find(v => v.id)?.id;
        
        addToCartMutation.mutate({
            product_id: product.id,
            variant_id: variantId,
            quantity: 1
        });

        if (redirect) navigate('/cart');
    };

    const handleToggleWishlist = () => {
        if (!token) {
            toast.error('Please login first');
            navigate('/login');
            return;
        }
        wishlistMutation.mutate(product.id);
    };

    return (
        <main className="pt-24 lg:pt-32 pb-20 font-manrope selection:bg-secondary-container">
            {/* Hero Product Section */}
            <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                    {/* Image Gallery (Editorial Asymmetry) */}
                    <div className="lg:col-span-6 space-y-8 relative">
                        <div className="bg-surface-container-low overflow-hidden rounded-xl flex items-center justify-center min-h-[400px]">
                            <img 
                                src={activeImage} 
                                alt={product.name} 
                                className="w-full h-auto max-h-[80vh] object-contain hover:scale-[1.02] transition-transform duration-700" 
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {images.map((img, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={`w-20 h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all bg-surface-container-low ${activeImageIndex === i ? 'border-primary' : 'border-transparent hover:border-outline-variant'}`}
                                    >
                                        <img src={img.image_path} className="w-full h-full object-contain" alt={`Thumbnail ${i+1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="lg:col-span-6 sticky top-32">
                        <nav className="flex space-x-2 text-xs font-semibold tracking-[0.1em] uppercase text-on-surface-variant mb-6">
                            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <Link to="/categories" className="hover:text-primary transition-colors">Collections</Link>
                            <span>/</span>
                            <span className="text-on-surface">{product.category?.name || 'Shop'}</span>
                        </nav>
                        
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface mb-4 leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-2xl font-light text-on-surface-variant mb-8">${currentPrice().toFixed(2)}</p>
                        <p className="text-on-surface-variant leading-relaxed mb-10 text-lg">
                            {product.description || "A testament to the Mohanad philosophy of quiet luxury. Meticulously crafted with a structured silhouette and hand-finished seams."}
                        </p>
                        
                        {/* Dynamic Variants */}
                        {variantsByType.color && variantsByType.color.length > 0 && (
                            <div className="mb-8">
                                <span className="block text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Color: {selectedVariants.color?.value}</span>
                                <div className="flex gap-4">
                                    {variantsByType.color.map((colorObj, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => toggleVariant('color', colorObj)}
                                            className={`w-8 h-8 rounded-full border border-outline-variant backdrop-blur-md transition-all ${selectedVariants.color?.id === colorObj.id ? 'ring-2 ring-offset-4 ring-primary' : 'ring-0 ring-offset-2 ring-transparent hover:ring-outline-variant'}`}
                                            title={colorObj.value}
                                            style={{ backgroundColor: colorObj.value.toLowerCase() }}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {variantsByType.size && variantsByType.size.length > 0 && (
                            <div className="mb-12">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant">Size</span>
                                    <button className="text-[0.7rem] uppercase tracking-widest text-on-surface-variant underline underline-offset-4 hover:text-primary">Size Guide</button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {variantsByType.size.map((sizeObj, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => toggleVariant('size', sizeObj)}
                                            className={`py-3 px-6 text-sm font-medium border rounded-lg transition-colors ${selectedVariants.size?.id === sizeObj.id ? 'border-primary bg-primary-container text-on-surface' : 'border-outline-variant hover:border-primary text-on-surface-variant'}`}
                                        >
                                            {sizeObj.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTAs */}
                        <div className="space-y-4 pt-6">
                            <button 
                                onClick={() => handleAddToCart(false)}
                                disabled={addToCartMutation.isPending}
                                className="w-full py-4 bg-primary text-on-primary rounded-full font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:opacity-70"
                            >
                                {addToCartMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Add to Bag</span>}
                            </button>
                            <button 
                                onClick={handleToggleWishlist}
                                disabled={wishlistMutation.isPending}
                                className={`w-full py-4 text-on-surface rounded-full font-bold uppercase tracking-widest hover:bg-surface-container transition-colors flex items-center justify-center space-x-2 border border-outline-variant/30 ${product.is_wishlisted ? 'bg-primary-container bg-opacity-30' : ''}`}
                            >
                                {wishlistMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">{product.is_wishlisted ? 'heart_minus' : 'favorite'}</span>
                                        <span>{product.is_wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Product Features Grid (Minimalist Icons) */}
            <section className="bg-surface-container-low py-20 mb-20">
                <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-2">Ethically Produced</h3>
                            <p className="text-on-surface-variant text-sm px-8">Consciously sourced and manufactured in our partner atelier.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-3xl">texture</span>
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-2">Premium Materials</h3>
                            <p className="text-on-surface-variant text-sm px-8">High-grade fabric selection for unparalleled comfort and drape.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-3xl">architecture</span>
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-2">Timeless Silhouette</h3>
                            <p className="text-on-surface-variant text-sm px-8">Designed to transcend seasonal trends with modern proportions.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Details & Craftsmanship Section */}
            <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative aspect-square rounded-xl overflow-hidden group">
                        <img 
                            src={images[images.length > 1 ? 1 : 0]?.image_path || "https://lh3.googleusercontent.com/aida-public/AB6AXuAYKgu-hbrZTW5gHZCFn3Z1BilxVmCsMx7hCm5q7sCwqu4KlwLIdIGMOEvbZJvDwakBDoVtEdfHHTY5eIFpXc1677hx-YllUO3C0qY4J7pH-RnwD3_sqcazRIOR7NlSBE0pn7g4RCAXPEO7Ew4hVTdjzcmU1BN0udKJ9w1pCrk-wzqaWSff26N3K6k0M74-1XGUBkWTaDrKU8FRagjQOAn-GPfL7TjHQV23glum6Nazitbi2j4qOKpk8Yl7kI-SYdgRp6VVMZWNxC-U"}
                            alt="Craftsmanship detail" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1000ms]" 
                        />
                        <div className="absolute inset-0 bg-black/5"></div>
                    </div>
                    <div className="lg:pl-12">
                        <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">The Artisanal Process</span>
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-on-surface mb-8 leading-tight">The Craftsmanship</h2>
                        <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg">
                            <p>
                                Every item begins its journey in our premium fabric mills, where the world's finest materials are curated and woven into our signature finishes. 
                            </p>
                            <p>
                                Our tailors employ traditional canvas construction, ensuring the product maintains its sharp silhouette for decades. Each seam is carefully scrutinized to eliminate friction and provide a seamless finish that moves with the body.
                            </p>
                            <div className="pt-6">
                                <Link to="/about" className="inline-flex items-center space-x-2 font-bold text-sm uppercase tracking-widest border-b-2 border-primary pb-1 hover:text-primary transition-colors">
                                    <span>Discover Our Atelier</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Complete the Look Section */}
            <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-32">
                <h2 className="text-2xl font-black uppercase tracking-widest mb-12 text-center">Complete the Look</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredProducts?.slice(0, 4).map((p, idx) => (
                        <div key={p.id} className={`group cursor-pointer ${idx % 2 !== 0 ? 'translate-y-8 lg:translate-y-12' : ''}`} onClick={() => navigate(`/product/${p.slug}`)}>
                            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-surface-container mb-6 relative">
                                <img 
                                    src={p.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' fill='%23dde4e5'%3E%3Crect width='400' height='500' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23adb3b4' font-size='16' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                {p.is_featured && <span className="absolute top-2 left-2 bg-primary text-on-primary text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest">Featured</span>}
                            </div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-1 line-clamp-1">{p.name}</h4>
                            <p className="text-on-surface-variant text-sm block">${parseFloat(p.sale_price || p.price).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default ProductDetailPage;
