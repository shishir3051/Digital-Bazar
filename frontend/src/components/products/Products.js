import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProductCard from './ProductCard';
import { productService, cartService } from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const fetchProducts = useCallback(async (category = null) => {
    setLoading(true);
    try {
      const response = await productService.getProducts(category === 'all' ? null : category);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchProducts(category);
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await cartService.addToCart({
        product_id: productId,
        quantity: 1
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const categories = ['all', 'Electronics', 'Clothing', 'Home Decor'];

  return (
    <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Merchant Header */}
      <div className="flex flex-col items-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-[#222222] tracking-tighter">
          Shop Our <span className="text-[#56cfe1]">Latest.</span>
        </h2>
        <div className="w-16 h-1 bg-[#222222]"></div>
        <p className="text-[#878787] text-center max-w-lg">
          Explore our handpicked collection of premium essentials. Quality, simplicity, and elegance in every selection.
        </p>
      </div>
      
      {/* Category & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 border-b border-[#ebebeb] pb-8">
        <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`text-[13px] font-bold uppercase tracking-wider transition-all relative pb-1 whitespace-nowrap ${
                selectedCategory === category
                  ? 'text-[#222222] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#222222]'
                  : 'text-[#878787] hover:text-[#222222]'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-b border-[#ebebeb] focus:border-[#222222] text-xs px-1 py-2 outline-none transition-all"
          />
          <svg className="absolute right-1 top-2.5 w-4 h-4 text-[#878787]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="aspect-[3/4] bg-[#f6f6f6] animate-pulse rounded-sm"></div>
           ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-[#f6f6f6] rounded-sm">
          <div className="text-[#878787] font-bold uppercase tracking-[0.2em] text-xs">No products found for this selection.</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
