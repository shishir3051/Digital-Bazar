import React, { useState, useEffect } from 'react';
import { productService, cartService } from '../../services/api';
import ProductCard from './ProductCard';
import { useAuth } from '../../context/AuthContext';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await productService.getProducts();
        // Simulate "New" by taking the latest 8 products
        // In a real app we would filter by created_at or is_new
        const sorted = response.data.sort((a, b) => b.id - a.id).slice(0, 8);
        setProducts(sorted);
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    try {
      await cartService.addToCart({ product_id: productId, quantity: 1 });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="flex flex-col items-center mb-16 space-y-4 text-center">
        <span className="text-[#56cfe1] font-bold tracking-[0.4em] uppercase text-[10px] block">Fresh Selection</span>
        <h1 className="text-4xl md:text-5xl font-bold text-[#222222] tracking-tighter">
          New <span className="text-[#56cfe1]">Arrivals.</span>
        </h1>
        <div className="w-16 h-1 bg-[#222222]"></div>
        <p className="text-[#878787] text-center max-w-lg text-sm">
          Explore our latest curated pieces, fresh from the studio. These exclusive arrivals are designed for the modern minimal explorer.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="aspect-[3/4] rounded-sm bg-[#f6f6f6] animate-pulse"></div>
           ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-[#f6f6f6] rounded-sm">
          <p className="text-[#878787] font-bold uppercase tracking-widest text-xs">No new items found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Trust Banner */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#ebebeb] pt-16">
         {[
           { title: 'FAST SHIPPING', desc: 'Secure delivery worldwide' },
           { title: '24/7 SUPPORT', desc: 'Active merchant assistance' },
           { title: 'EASY RETURNS', desc: '30-day satisfaction policy' }
         ].map((item, idx) => (
           <div key={idx} className="text-center group">
              <h3 className="text-[#222222] font-bold text-[13px] tracking-widest uppercase mb-2 group-hover:text-[#56cfe1] transition-colors">{item.title}</h3>
              <p className="text-[#878787] text-xs uppercase font-medium">{item.desc}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default NewArrivals;
