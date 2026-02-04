import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import Products from './components/products/Products';
import Profile from './components/profile/Profile';
import Wishlist from './components/products/Wishlist';
import ShippingReturns from './components/info/ShippingReturns';
import PrivacyPolicy from './components/info/PrivacyPolicy';
import TermsConditions from './components/info/TermsConditions';
import Contact from './components/info/Contact';
import NewArrivals from './components/products/NewArrivals';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App min-h-screen bg-white text-[#222222] flex flex-col font-main selection:bg-[#56cfe1]/30 relative">
        {/* Global Architectural Background Watermark */}
        <div className="fixed top-0 right-0 w-full h-full opacity-[0.02] pointer-events-none z-0 overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-[80%] h-auto absolute -top-[10%] -right-[20%] text-[#222222]" fill="currentColor">
             <circle cx="100" cy="0" r="80" />
          </svg>
          <svg viewBox="0 0 100 100" className="w-[60%] h-auto absolute bottom-0 -left-[10%] text-[#222222]" fill="currentColor">
             <circle cx="0" cy="100" r="50" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <Products />
                </>
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/new-arrivals" element={<NewArrivals />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </AuthProvider>
    </Router>
  );
}

export default App;