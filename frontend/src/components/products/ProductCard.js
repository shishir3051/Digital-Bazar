import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { wishlistService, paymentsService } from '../../services/api';

const ProductCard = ({ product, onAddToCart, priority = false }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [rate, setRate] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await paymentsService.getExchangeRate();
        if (mounted) setRate(res.data.usd_to_bdt);
      } catch (err) {
        // ignore - keep rate null
        console.error('Failed to fetch exchange rate:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);
  
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    
    setLoading(true);
    try {
      await onAddToCart(product.id);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to use wishlist');
      return;
    }

    try {
      const response = await wishlistService.toggleWishlist({ product_id: product.id });
      setIsWishlisted(response.data.status === 'added');
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };


  return (
    <div className="group relative flex flex-col kalles-card rounded-sm h-full">
      {/* Badges */}
      {product.price > 200 && <span className="badge badge-sale">Sale</span>}
      {product.category === 'Electronics' && <span className="badge badge-new">New</span>}

      {/* Image Container */}
      <div className="image-container aspect-[3/4] bg-[#f6f6f6] cursor-pointer">
        <img 
          src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Secondary Image Placeholder (Slightly zoomed/alt version) */}
        <img 
          src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
          alt={`${product.name} alternate`}
          className="second-image scale-105 brightness-95"
        />

        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 z-20 p-2.5 rounded-full shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 ${
            isWishlisted ? 'bg-[#56cfe1] text-white opacity-100' : 'bg-white text-[#222222] hover:bg-[#222222] hover:text-white'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick Add Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
          <button 
            onClick={handleAddToCart}
            disabled={loading}
            className="w-full bg-[#222222]/90 hover:bg-[#56cfe1] text-white py-3 text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm transition-colors rounded-sm"
          >
            {loading ? 'Adding...' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 text-center">
        <div className="text-[10px] text-[#878787] uppercase tracking-widest mb-1.5 font-bold">{product.category}</div>
        <h3 className="text-[14px] font-bold text-[#222222] mb-1.5 hover:text-[#56cfe1] cursor-pointer transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="text-[15px] font-bold text-[#222222]">
          ${product.price ? product.price.toFixed(2) : '0.00'}
          {rate !== null && (
            <div className="text-[12px] text-[#878787]">৳{(product.price * rate).toFixed(2)} BDT</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
