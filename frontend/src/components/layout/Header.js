import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CartIcon from '../cart/CartIcon';
import AuthModal from '../auth/AuthModal';
import { cartService } from '../../services/api';

const Header = () => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchCartCount = async () => {
    if (user) {
      try {
        const response = await cartService.getCart();
        const count = response.data.reduce((total, item) => total + item.cart_item.quantity, 0);
        setCartCount(count);
      } catch (error) {
        console.error('Failed to fetch cart count:', error);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  return (
    <>
      {/* Kalles Announcement Bar */}
      <div className="bg-[#222222] text-white text-[11px] font-bold uppercase tracking-[0.1em] py-2.5 text-center">
        Free shipping on all orders over $99. Use Code: KALLES2026
      </div>

      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'header-sticky py-3' : 'bg-white border-b border-transparent py-5'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 group">
              <div className="w-7 h-7 bg-[#222222] flex items-center justify-center text-white font-black text-xs group-hover:bg-[#56cfe1] transition-colors rounded-sm">K</div>
              <h1 className="text-xl font-bold tracking-tighter text-[#222222] uppercase font-heading">
                Digital<span className="text-[#56cfe1]">Bazar</span>
              </h1>
            </Link>

            {/* Middle Navigation */}
            <nav className="hidden lg:flex items-center space-x-10">
              <Link
                to="/"
                className="text-[13px] font-bold uppercase tracking-wider text-[#222222] hover:text-[#56cfe1] transition-colors"
              >
                Home
              </Link>
              <button
                onClick={() => {
                  if (window.location.pathname !== '/') {
                    window.location.href = '/#products';
                  } else {
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-[13px] font-bold uppercase tracking-wider text-[#222222] hover:text-[#56cfe1] transition-colors"
              >
                Explore
              </button>
              <Link
                to="/wishlist"
                className="text-[13px] font-bold uppercase tracking-wider text-[#222222] hover:text-[#56cfe1] transition-colors"
              >
                Wishlist
              </Link>
              {user?.is_admin && (
                <Link
                  to="/admin"
                  className="text-[13px] font-bold uppercase tracking-wider text-[#56cfe1] hover:text-[#222222] transition-all"
                >
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-transparent border-b border-[#ebebeb] focus:border-[#222222] text-xs px-1 py-1 w-32 focus:w-48 outline-none transition-all duration-300"
                />
                <svg className="w-4 h-4 text-[#222222] ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {user ? (
                <div className="flex items-center gap-5">
                  {/* Bag Icon (Cart) */}
                  <CartIcon count={cartCount} onCartUpdated={setCartCount} />

                  <Link to="/profile" className="flex items-center gap-2 hover:text-[#56cfe1] transition-all group">
                    <div className="w-8 h-8 rounded-full border border-[#ebebeb] flex items-center justify-center text-[#878787] group-hover:border-[#56cfe1]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight hidden sm:block">Account</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="text-[#878787] hover:text-red-500 p-1"
                    title="Logout"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary py-2 px-6"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={fetchCartCount} />
      )}
    </>
  );

};

export default Header;
