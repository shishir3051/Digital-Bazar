import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#222222] tracking-tighter mb-4">Privacy <span className="text-[#56cfe1]">Policy.</span></h1>
        <div className="w-16 h-1 bg-[#222222] mx-auto mb-6"></div>
        <p className="text-[#878787] uppercase text-[11px] font-bold tracking-widest">Your data security is our top priority.</p>
      </div>

      <div className="space-y-12 text-[#878787] leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold mb-4 tracking-tight text-[#222222]">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This includes your name, email address, shipping address, and payment information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 tracking-tight text-[#222222]">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you about your orders and promotional offers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 tracking-tight text-[#222222]">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. Your payment data is processed through secure, encrypted gateways and is never stored on our servers.
          </p>
        </section>

        <section className="border-t border-[#ebebeb] pt-8">
          <p className="text-sm italic">Last updated: February 2026</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
