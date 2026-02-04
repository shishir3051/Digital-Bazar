import React, { useState } from 'react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#222222] tracking-tighter mb-6">Contact <span className="text-[#56cfe1]">Us.</span></h1>
          <p className="text-[#878787] text-lg mb-10 leading-relaxed">
            Have a question? We're here to help. Send us a message and we'll get back to you as soon as possible.
          </p>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-[#f6f6f6] rounded-sm flex items-center justify-center flex-shrink-0">
                 <svg className="w-6 h-6 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
              </div>
              <div>
                <h3 className="font-bold text-[#222222] uppercase text-[11px] tracking-widest mb-1">Our Studio</h3>
                <p className="text-[#878787] text-sm italic">789 Commerce St, Fashion District, NY 10001</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-[#f6f6f6] rounded-sm flex items-center justify-center flex-shrink-0">
                 <svg className="w-6 h-6 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
              </div>
              <div>
                <h3 className="font-bold text-[#222222] uppercase text-[11px] tracking-widest mb-1">Email Us</h3>
                <p className="text-[#878787] text-sm">support@digitalbazar.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#ebebeb] p-8 md:p-12 rounded-sm shadow-sm h-fit">
          {submitted ? (
            <div className="text-center py-20">
               <div className="w-16 h-16 bg-[#56cfe1] text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
               </div>
               <h3 className="text-xl font-bold text-[#222222] mb-2">Message Received!</h3>
               <p className="text-[#878787] text-sm">We'll get back to you within 24 hours.</p>
               <button onClick={() => setSubmitted(false)} className="btn-outline mt-8">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222]">Your Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all rounded-sm" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222]">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all rounded-sm" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222]">Subject</label>
                <input type="text" placeholder="How can we help?" className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all rounded-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222]">Message</label>
                <textarea rows="5" placeholder="Your message here..." className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all rounded-sm resize-none" required></textarea>
              </div>
              <button type="submit" className="btn-primary w-full py-4 uppercase tracking-[0.2em] text-xs">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
