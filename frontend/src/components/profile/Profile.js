import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getOrders();
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (!user) return <div className="pt-32 text-center text-slate-500">Please login to view profile.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* User Info Card */}
        <div className="bg-white border border-[#ebebeb] rounded-sm p-8 shadow-sm h-fit">
          <div className="w-16 h-16 rounded-full bg-[#f6f6f6] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#222222] mb-1 tracking-tight">{user.full_name}</h2>
          <p className="text-[#878787] font-bold uppercase tracking-widest text-[10px] mb-8">@{user.username}</p>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-[#222222] uppercase tracking-widest block mb-1">Email Address</label>
              <div className="text-[#878787] font-medium">{user.email}</div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#222222] uppercase tracking-widest block mb-1">Account Status</label>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#f6f6f6] border border-[#ebebeb] text-[#222222] text-[10px] font-bold uppercase">
                Active Member
              </div>
            </div>
          </div>

          <button onClick={logout} className="btn-outline w-full mt-10">Sign Out</button>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2 space-y-8">
           <h3 className="text-2xl font-bold text-[#222222] tracking-tighter">Order <span className="text-[#56cfe1]">History.</span></h3>
           
           {loading ? (
             <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                   <div key={i} className="h-24 bg-[#f6f6f6] animate-pulse border border-[#ebebeb] rounded-sm"></div>
                ))}
             </div>
           ) : orders.length === 0 ? (
             <div className="bg-[#f6f6f6] border border-[#ebebeb] rounded-sm p-12 text-center">
                <p className="text-[#878787] font-bold uppercase tracking-widest text-xs">No transaction records found.</p>
                <Link to="/" className="text-[#222222] font-bold text-xs underline mt-4 inline-block">Start Shopping</Link>
             </div>
           ) : (
             <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-[#ebebeb] p-6 flex flex-col sm:row justify-between items-center gap-6 hover:border-[#222222] transition-all rounded-sm">
                    <div>
                      <div className="text-[10px] font-bold text-[#878787] uppercase tracking-widest mb-1">Order Ref</div>
                      <div className="text-[#222222] font-mono text-xs font-bold uppercase">{order.id.slice(-8)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-[#878787] uppercase tracking-widest mb-1">Total Value</div>
                        <div className="text-[#222222] font-bold">${order.total_amount.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-[#878787] uppercase tracking-widest mb-1">Payment</div>
                        <div className={`text-[10px] font-bold uppercase ${order.payment_method === 'bKash' ? 'text-[#e2136e]' : 'text-[#1a1f71]'}`}>
                           {order.payment_method || 'Visa'}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="px-3 py-1 rounded-sm bg-[#222222] text-white text-[10px] font-bold uppercase">
                            {order.status}
                        </span>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
