import React, { useState, useEffect } from 'react';
import { cartService, paymentsService } from '../../services/api';
import CheckoutModal from '../orders/CheckoutModal';

const CartModal = ({ onClose, onCartUpdated }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [processingBkash, setProcessingBkash] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setCartItems(response.data);
      // propagate updated count to parent (Header) if callback provided
      const count = response.data.reduce((total, item) => total + item.cart_item.quantity, 0);
      if (onCartUpdated) onCartUpdated(count);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // also fetch exchange rate for BDT display
    (async () => {
      try {
        const res = await paymentsService.getExchangeRate();
        setExchangeRate(res.data.usd_to_bdt);
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
      }
    })();
  }, []);

  const removeFromCart = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.cart_item.quantity);
    }, 0).toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-8 flex justify-between items-center border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white">Your Assets</h2>
            <p className="text-slate-500 text-xs">Manage your selected items.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white w-10 h-10 rounded-full glass flex items-center justify-center">
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {loading ? (
            <div className="text-center py-20 text-slate-500 animate-pulse">Scanning inventory...</div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-20">
               <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
               </div>
               <p className="text-slate-500 text-sm font-medium">Your asset vault is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cart_item.id} className="flex gap-4 group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden glass flex-shrink-0">
                   <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-white text-sm font-bold truncate mb-1">{item.product.name}</h3>
                  <p className="text-slate-500 text-xs">${item.product.price} × {item.cart_item.quantity}</p>
                  {exchangeRate && (
                    <p className="text-slate-500 text-xs">৳{(item.product.price * exchangeRate * item.cart_item.quantity).toFixed(2)} BDT</p>
                  )}
                </div>
                <div className="text-right flex flex-col justify-between">
                  <div className="text-white font-black text-sm">${(item.product.price * item.cart_item.quantity).toFixed(2)}</div>
                  <button onClick={() => removeFromCart(item.cart_item.id)} className="text-[10px] text-red-500/70 hover:text-red-500 font-bold uppercase tracking-widest">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="p-8 border-t border-slate-800 bg-slate-900/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Valuation</span>
              <span className="text-2xl font-black text-white">${getTotalAmount()}</span>
            </div>
            {exchangeRate && (
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total BDT</span>
                <span className="text-2xl font-black text-white">৳{(Number(getTotalAmount()) * exchangeRate).toFixed(2)}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(true)}
                className="flex-1 btn-premium py-4 text-sm uppercase tracking-widest text-white bg-[#56cfe1] hover:bg-[#4fc4d8] shadow-md"
              >
                Initialize Checkout (Card)
              </button>

              <button
                onClick={async () => {
                  try {
                    setProcessingBkash(true);
                    const res = await paymentsService.bkashCreatePayment();
                    const { approvalUrl, paymentId, amount_bdt } = res.data;
                    if (approvalUrl) {
                      window.open(approvalUrl, '_blank');
                    } else {
                      alert('bKash payment created. Follow instructions from response.');
                    }
                  } catch (err) {
                    console.error('bKash create payment failed', err);
                    alert('Failed to start bKash payment. Check server logs.');
                  } finally {
                    setProcessingBkash(false);
                  }
                }}
                disabled={processingBkash}
                className="flex-1 py-4 text-sm uppercase tracking-widest text-[#222222] bg-[#f7f7f7] hover:bg-[#eaeaea] shadow-sm font-bold"
              >
                {processingBkash ? 'Processing...' : 'Pay with bKash'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal
          cartItems={cartItems}
          total={getTotalAmount()}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            onClose();
            fetchCart();
          }}
        />
      )}
    </div>
  );
};

export default CartModal;
