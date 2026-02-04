import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';

const AuthModal = ({ onClose, onSuccess }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = isLogin 
        ? await authService.login({ username: formData.username, password: formData.password })
        : await authService.register(formData);
      
      login(response.data.token, response.data.user);
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white border border-[#ebebeb] rounded-sm p-8 md:p-12 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#878787] hover:text-[#222222] transition-colors p-2">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#222222] tracking-tighter mb-2">{isLogin ? 'Login to Account' : 'Create Account'}</h2>
          <div className="w-12 h-0.5 bg-[#56cfe1] mx-auto mb-4"></div>
          <p className="text-[#878787] text-xs font-medium uppercase tracking-widest">{isLogin ? 'Welcome back! Sign in to continue.' : 'Register for the ultimate shopping experience.'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">Username</label>
            <input
              type="text"
              placeholder="Your username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all placeholder:text-[#ccc] rounded-sm"
              required
            />
          </div>
          
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all placeholder:text-[#ccc] rounded-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all placeholder:text-[#ccc] rounded-sm"
                  required
                />
              </div>
            </>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all placeholder:text-[#ccc] rounded-sm"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 p-4 text-center text-xs font-bold uppercase tracking-tight rounded-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <div className="mt-10 pt-6 border-t border-[#ebebeb] text-center">
          <p className="text-[#878787] text-xs font-medium uppercase tracking-tight mb-3">
             {isLogin ? "New to Digital Bazar?" : "Already Have An Account?"}
          </p>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[11px] font-bold uppercase tracking-widest text-[#222222] hover:text-[#56cfe1] border-b border-[#222222] hover:border-[#56cfe1] pb-0.5 transition-all"
          >
            {isLogin ? "Join Now" : "Login Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
