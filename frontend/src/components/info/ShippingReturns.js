import React from 'react';

const ShippingReturns = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#222222] tracking-tighter mb-4">Shipping & <span className="text-[#56cfe1]">Returns.</span></h1>
        <div className="w-16 h-1 bg-[#222222] mx-auto mb-6"></div>
        <p className="text-[#878787] uppercase text-[11px] font-bold tracking-widest">Everything you need to know about our delivery and replacement policy.</p>
      </div>

      <div className="space-y-12 text-[#222222]">
        <section>
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Shipping Policy</h2>
          <p className="text-[#878787] leading-relaxed mb-4">
            We offer free standard shipping on all orders over $99. For orders under $99, a flat rate shipping fee of $10 applies. 
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#878787]">
            <li>Standard Shipping: 3-5 business days</li>
            <li>Express Shipping: 1-2 business days ($25 fee)</li>
            <li>International Shipping: 7-14 business days (rates vary)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Return & Exchange</h2>
          <p className="text-[#878787] leading-relaxed mb-4">
            If you are not completely satisfied with your purchase, you can return your items within 30 days of delivery for a full refund or exchange.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#878787]">
            <li>Items must be in original condition with tags attached.</li>
            <li>Refunds are processed back to the original payment method.</li>
            <li>Return shipping is free for all domestic orders.</li>
          </ul>
        </section>

        <section className="bg-[#f6f6f6] p-8 rounded-sm">
          <h3 className="font-bold mb-2">Need help with a return?</h3>
          <p className="text-sm text-[#878787] mb-4">Our support team is available 24/7 to assist you with any questions.</p>
          <button className="btn-primary">Contact Support</button>
        </section> section
      </div>
    </div>
  );
};

export default ShippingReturns;
