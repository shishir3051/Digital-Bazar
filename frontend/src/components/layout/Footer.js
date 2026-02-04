import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#ebebeb] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-1.5 mb-6 group">
              <div className="w-7 h-7 bg-[#222222] flex items-center justify-center text-white font-black text-xs group-hover:bg-[#56cfe1] transition-colors rounded-sm">K</div>
              <h1 className="text-xl font-bold tracking-tighter text-[#222222] uppercase font-heading">
                Digital<span className="text-[#56cfe1]">Bazar</span>
              </h1>
            </Link>
            <p className="text-[#878787] text-sm leading-relaxed max-w-xs mb-6">
              The ultimate destination for premium lifestyle products. Discover quality and simplicity in every selection.
            </p>
            <div className="flex gap-4">
              {['facebook', 'twitter', 'instagram', 'pinterest'].map((social) => (
                <button key={social} className="text-[#222222] hover:text-[#56cfe1] transition-colors">
                  <span className="capitalize text-xs font-bold">{social}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-[#222222] font-bold mb-8 text-[13px] uppercase tracking-widest font-heading">Shop Categories</h3>
            <ul className="space-y-4 text-[#878787] text-[14px]">
              <li><Link to="/" className="hover:text-[#56cfe1] transition-colors">Electronics</Link></li>
              <li><Link to="/" className="hover:text-[#56cfe1] transition-colors">Clothing</Link></li>
              <li><Link to="/" className="hover:text-[#56cfe1] transition-colors">Home Decor</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-[#56cfe1] transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[#222222] font-bold mb-8 text-[13px] uppercase tracking-widest font-heading">Help & Information</h3>
            <ul className="space-y-4 text-[#878787] text-[14px]">
              <li><Link to="/shipping-returns" className="hover:text-[#56cfe1] transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#56cfe1] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-[#56cfe1] transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/contact" className="hover:text-[#56cfe1] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[#222222] font-bold mb-8 text-[13px] uppercase tracking-[0.2em] font-heading">Newsletter</h3>
            <p className="text-[#878787] text-[14px] mb-8 leading-relaxed">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="flex flex-col gap-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-white border border-[#222222] px-4 py-4 text-sm w-full focus:outline-none transition-all rounded-none placeholder:text-[#ccc]"
              />
              <button className="bg-[#222222] text-white py-4 px-8 text-sm font-bold uppercase tracking-widest hover:bg-[#56cfe1] transition-all rounded-none">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#ebebeb] gap-6">
          <p className="text-[#878787] text-[11px] font-medium uppercase tracking-wider">
            &copy; {new Date().getFullYear()} Digital Bazar. All Rights Reserved.
          </p>
          <div className="flex gap-6 items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#222222]">Secure Payment:</span>
            <div className="flex gap-4 items-center">
               <div className="h-8 w-12 bg-white border border-[#ebebeb] flex items-center justify-center p-1 rounded-sm shadow-sm hover:border-[#222222] transition-colors cursor-pointer">
                  <span className="text-[#1a1f71] font-black italic text-[14px]">VISA</span>
               </div>
               <div className="h-8 w-12 bg-[#e2136e] flex items-center justify-center p-1 rounded-sm shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
                  <span className="text-white font-black text-[10px] italic">bKash</span>
               </div>
               <div className="h-8 w-12 bg-white border border-[#ebebeb] flex items-center justify-center p-1 rounded-sm shadow-sm hover:border-[#222222] transition-colors cursor-pointer opacity-50 grayscale hover:grayscale-0">
                  <span className="text-[#003087] font-black italic text-[11px]">PayPal</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

