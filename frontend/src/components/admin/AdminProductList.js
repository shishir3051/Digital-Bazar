import React, { useState } from 'react';

const AdminProductList = ({ products, loading }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-[#f6f6f6] animate-pulse rounded-sm"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#ebebeb] rounded-sm shadow-sm overflow-hidden">
            <div className="p-8 border-b border-[#ebebeb] flex justify-between items-center bg-[#fafafa]">
                <h3 className="text-xl font-bold text-[#222222] tracking-tight">Active Inventory</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#878787]">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, products.length)} of {products.length} Items
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white">
                            <th className="px-8 py-4 text-[10px] font-bold text-[#878787] uppercase tracking-widest border-b border-[#ebebeb]">Product</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-[#878787] uppercase tracking-widest border-b border-[#ebebeb]">Category</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-[#878787] uppercase tracking-widest border-b border-[#ebebeb]">Price</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-[#878787] uppercase tracking-widest border-b border-[#ebebeb]">Stock</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-[#878787] uppercase tracking-widest border-b border-[#ebebeb]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f6f6f6]">
                        {currentProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-[#fafafa] transition-colors group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-10 h-10 object-cover rounded-sm border border-[#ebebeb]"
                                        />
                                        <div className="text-[13px] font-bold text-[#222222] group-hover:text-[#56cfe1] transition-colors line-clamp-1">{product.name}</div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#878787] bg-[#f6f6f6] px-2 py-0.5 rounded-sm">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-[13px] font-mono font-bold text-[#222222]">
                                    ${product.price.toFixed(2)}
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                        <span className="text-[13px] font-bold text-[#222222]">{product.stock}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-[#222222] hover:text-[#56cfe1] transition-colors">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-8 border-t border-[#ebebeb] flex justify-center gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center border border-[#ebebeb] rounded-sm hover:border-[#222222] disabled:opacity-30 disabled:hover:border-[#ebebeb] transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center border rounded-sm text-[10px] font-bold transition-all ${currentPage === i + 1
                                ? 'bg-[#222222] text-white border-[#222222]'
                                : 'border-[#ebebeb] text-[#878787] hover:border-[#222222] hover:text-[#222222]'
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center border border-[#ebebeb] rounded-sm hover:border-[#222222] disabled:opacity-30 disabled:hover:border-[#ebebeb] transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default AdminProductList;
