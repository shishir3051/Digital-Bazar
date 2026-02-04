import React, { useState } from 'react';
import CartModal from './CartModal';

const CartIcon = ({ count, onCartUpdated }) => {
  const [showCart, setShowCart] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowCart(true)}
        className="relative p-2 text-gray-700 hover:text-blue-600"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 8.2M7 13l2.8-8.2M19 13v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6M9 21h6" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
      
      {showCart && <CartModal onClose={() => setShowCart(false)} onCartUpdated={onCartUpdated} />}
    </>
  );
};

export default CartIcon;
