import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { wishlistService, cartService } from '../../services/api';
import ProductCard from './ProductCard';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  const handleAddToCart = async (productId) => {
    try {
      await cartService.addToCart({ product_id: productId, quantity: 1 });
      alert('Product added to cart!');
    } catch (error) {
       console.error('Failed to add to cart:', error);
    }
  };

  if (!user) return <div className="pt-32 text-center text-slate-500">Please login to view wishlist.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col items-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-[#222222] tracking-tighter">
          Your <span className="text-[#56cfe1]">Wishlist.</span>
        </h2>
        <div className="w-16 h-1 bg-[#222222]"></div>
        <p className="text-[#878787] text-center max-w-lg">
          Keep track of your favorite items. Save them for later or add them to your cart now.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="aspect-[3/4] rounded-sm bg-[#f6f6f6] animate-pulse"></div>
           ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-24 bg-[#f6f6f6] rounded-sm">
          <div className="text-[#878787] font-bold uppercase tracking-[0.2em] text-xs">No items pinned to your wishlist.</div>
          <Link to="/" className="btn-primary mt-8 inline-block">Return to Shop</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {wishlist.map((item) => (
            <ProductCard
              key={item.product.id}
              product={item.product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
