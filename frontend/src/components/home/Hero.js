import React from 'react';

const Hero = () => {
  return (
    <section className="relative h-[80vh] flex items-center bg-[#f6f6f6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="max-w-xl">
          <span className="text-[#56cfe1] font-bold tracking-[0.3em] uppercase text-[12px] mb-4 block">Summer Collection 2026</span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter leading-[1.05] text-[#222222] font-heading">
            Essentials for <br />
            <span className="text-[#56cfe1]">Everyday.</span>
          </h1>
          <p className="text-lg text-[#878787] mb-10 leading-relaxed max-w-md">
            Discover our curated selection of premium products designed for the modern lifestyle. Quality meets simplicity in every piece.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={() => document.getElementById('products')?.scrollIntoView({behavior: 'smooth'})}
              className="btn-primary w-full sm:w-auto"
            >
              Shop Collection
            </button>
            <button className="text-[12px] font-bold uppercase tracking-widest text-[#222222] border-b-2 border-[#222222] pb-1 hover:text-[#56cfe1] hover:border-[#56cfe1] transition-all">
              View Lookbook
            </button>
          </div>
        </div>
      </div>

      {/* Hero Image (Right side) */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden lg:block">
        <div className="w-full h-full relative">
          <img 
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Premium Essentials" 
            className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-1000"
          />
          {/* Subtle overlay to blend image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f6f6f6] via-transparent to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
