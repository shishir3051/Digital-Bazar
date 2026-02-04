import React, { useState } from 'react';
import { orderService } from '../../services/api';

const CheckoutModal = ({ cartItems, total, onClose, onSuccess }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Visa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await orderService.createOrder({ 
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      });
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white border border-[#ebebeb] rounded-sm p-8 md:p-10 w-full max-w-lg shadow-2xl relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#878787] hover:text-[#222222] transition-colors p-2">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#222222] tracking-tighter mb-2">Checkout</h2>
          <div className="w-12 h-0.5 bg-[#56cfe1] mx-auto mb-4"></div>
          <p className="text-[#878787] text-[10px] font-bold uppercase tracking-widest leading-relaxed">Complete your order with secure payment.</p>
        </div>
        
        <form onSubmit={handleCheckout} className="space-y-8">
          {/* Shipping Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">Shipping Address</label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your full street address, city, and zip..."
              className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all placeholder:text-[#ccc] rounded-sm resize-none"
              rows="3"
              required
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2.5">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-4">
               <button 
                type="button"
                onClick={() => setPaymentMethod('Visa')}
                className={`flex flex-col items-center justify-center p-4 border rounded-sm transition-all ${paymentMethod === 'Visa' ? 'border-[#222222] bg-[#f6f6f6]' : 'border-[#ebebeb] bg-white opacity-60 hover:opacity-100'}`}
               >
                  <div className="text-[#1a1f71] font-black italic text-lg mb-1">VISA</div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#222222]">Credit/Debit</span>
               </button>
               <button 
                type="button"
                onClick={() => setPaymentMethod('bKash')}
                className={`flex flex-col items-center justify-center p-4 border rounded-sm transition-all ${paymentMethod === 'bKash' ? 'border-[#e2136e] bg-[#e2136e]/5' : 'border-[#ebebeb] bg-white opacity-60 hover:opacity-100'}`}
               >
                  <div className="text-[#e2136e] font-black italic text-lg mb-1">bKash</div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#222222]">Mobile Pay</span>
               </button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-[#f6f6f6] p-6 rounded-sm border border-[#ebebeb]">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#222222] mb-4 border-b border-[#ebebeb] pb-2">Order Summary</h3>
            <div className="max-h-32 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
              {cartItems.map((item) => (
                <div key={item.cart_item.id} className="flex justify-between items-center text-xs">
                  <span className="text-[#878787] font-medium">{item.product.name} <span className="text-[10px]">x{item.cart_item.quantity}</span></span>
                  <span className="text-[#222222] font-bold">${(item.product.price * item.cart_item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#ebebeb] pt-4 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#222222]">Grand Total</span>
              <span className="text-xl font-bold text-[#56cfe1] tracking-tighter">${total}</span>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 p-4 text-center text-xs font-bold uppercase tracking-tight rounded-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-[#222222] border border-[#222222] hover:bg-[#222222] hover:text-white transition-all rounded-sm"
            >
              Back to Cart
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 btn-primary py-4 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay & Place Order`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
