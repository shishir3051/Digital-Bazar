import React, { useEffect, useState } from 'react';
import { adminService, productService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdminProductList from './AdminProductList';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, productsRes] = await Promise.all([
                    adminService.getStats(),
                    productService.getProducts()
                ]);
                setStats(statsRes.data);
                setProducts(productsRes.data);
            } catch (err) {
                console.error('Failed to fetch admin data:', err);
                setError('Failed to load dashboard data. Please ensure you have admin privileges.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white pt-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[#222222] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#878787]">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white pt-20 px-4">
                <div className="max-w-md w-full bg-[#fff5f5] border border-[#ffcfcf] p-8 rounded-sm text-center">
                    <svg className="w-12 h-12 text-[#ff4d4f] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-lg font-bold text-[#222222] mb-2 uppercase tracking-tight">Access Denied</h2>
                    <p className="text-[#878787] text-sm mb-6">{error}</p>
                    <button onClick={() => window.location.href = '/'} className="btn-outline w-full">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-[#222222] tracking-tighter mb-2">Admin <span className="text-[#56cfe1]">Console.</span></h1>
                    <p className="text-[#878787] font-bold uppercase tracking-[0.2em] text-[10px]">Welcome back, {user?.full_name}</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-outline text-[10px] py-2 px-4">Export Report</button>
                    <button className="bg-[#222222] text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#333333] transition-all rounded-sm">Quick Action</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <StatCard title="Total Revenue" value={`$${stats?.total_revenue?.toFixed(2)}`} trend="+12.5%" icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 11h.01M17 11h.01M7 11h.01M12 16h-.01m-4.01 4h8.02c1.1 0 1.99-.89 1.99-1.99V5c0-1.1-.89-2-1.99-2H7.99C6.89 3 6 3.89 6 4.99V18c0 1.1.89 2 1.99 2z" />
                    </svg>
                } />
                <StatCard title="Total Orders" value={stats?.orders_count} trend="+5.2%" icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                } />
                <StatCard title="Total Products" value={stats?.products_count} icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                } />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Orders */}
                <div className="lg:col-span-1 bg-white border border-[#ebebeb] p-8 rounded-sm shadow-sm h-fit">
                    <h3 className="text-xl font-bold text-[#222222] mb-8 tracking-tight flex items-center gap-3">
                        Recent Orders
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#56cfe1] bg-[#56cfe1]/10 px-2 py-0.5 rounded-sm">Live</span>
                    </h3>
                    <div className="space-y-4">
                        {stats?.recent_orders?.map((order) => (
                            <div key={order.id} className="flex justify-between items-center p-4 border border-[#f6f6f6] hover:border-[#ebebeb] transition-all group">
                                <div>
                                    <div className="text-[10px] font-bold text-[#878787] uppercase tracking-widest mb-1">Ref: {order.id.slice(-8)}</div>
                                    <div className="text-[#222222] font-bold text-sm">${order.total_amount.toFixed(2)}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-[10px] font-bold uppercase mb-1 px-2 py-0.5 rounded-sm inline-block ${order.status === 'pending' ? 'bg-[#fff7e6] text-[#faad14]' :
                                        order.status === 'completed' ? 'bg-[#f6ffed] text-[#52c41a]' :
                                            'bg-[#f6f6f6] text-[#878787]'
                                        }`}>
                                        {order.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Inventory Management */}
                <div className="lg:col-span-2 space-y-8">
                    <AdminProductList products={products} loading={loading} />
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend }) => (
    <div className="bg-white border border-[#ebebeb] p-8 rounded-sm hover:border-[#222222] transition-all group">
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-[#f6f6f6] group-hover:bg-[#222222] group-hover:text-white transition-all rounded-sm">
                {icon}
            </div>
            {trend && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-sm">{trend}</span>
            )}
        </div>
        <div className="text-[10px] font-bold text-[#878787] uppercase tracking-widest mb-1">{title}</div>
        <div className="text-3xl font-bold text-[#222222] tracking-tighter">{value}</div>
    </div>
);

const ManageAction = ({ title, desc, icon }) => (
    <button className="flex flex-col items-start p-6 bg-white/5 border border-white/10 hover:border-[#56cfe1] hover:bg-white/10 transition-all rounded-sm text-left group">
        <svg className="w-6 h-6 text-[#56cfe1] mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
        </svg>
        <div className="text-xs font-bold uppercase tracking-widest mb-1">{title}</div>
        <div className="text-[10px] text-white/50">{desc}</div>
    </button>
);

export default AdminDashboard;
