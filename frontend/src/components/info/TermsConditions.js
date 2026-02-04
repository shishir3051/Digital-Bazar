import React from 'react';

const TermsConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#222222] tracking-tighter mb-4">Terms & <span className="text-[#56cfe1]">Conditions.</span></h1>
        <div className="w-16 h-1 bg-[#222222] mx-auto mb-6"></div>
        <p className="text-[#878787] uppercase text-[11px] font-bold tracking-widest">Rules and guidelines for using our platform.</p>
      </div>

      <div className="space-y-10 text-[#878787] leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-4 text-[#222222]">Agreement to Terms</h2>
          <p>By accessing and using Digital Bazar, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-[#222222]">Intellectual Property</h2>
          <p>All content on this site, including text, graphics, logos, and images, is the property of Digital Bazar and is protected by international copyright laws.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-[#222222]">Limitation of Liability</h2>
          <p>Digital Bazar shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services or products.</p>
        </section>

        <section className="bg-white border border-[#ebebeb] p-8 rounded-sm">
          <p className="text-sm font-medium text-[#222222]">For more detailed information, please contact our legal team.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;
