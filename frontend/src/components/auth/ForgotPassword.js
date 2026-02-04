import React, { useState } from 'react';
import { authService } from '../../services/api';

const ForgotPassword = ({ onBack, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.forgotPassword(formData.email);
            setStep(2);
            setMessage('OTP has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await authService.resetPassword({
                email: formData.email,
                otp: formData.otp,
                new_password: formData.new_password
            });
            setMessage('Password reset successfully! You can now login.');
            setTimeout(() => {
                onSuccess();
                onBack();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#222222] tracking-tighter mb-2">
                    {step === 1 ? 'Reset Password' : step === 2 ? 'Verify OTP' : 'New Password'}
                </h2>
                <div className="w-12 h-0.5 bg-[#56cfe1] mx-auto mb-4"></div>
                <p className="text-[#878787] text-[11px] font-medium uppercase tracking-widest leading-relaxed">
                    {step === 1 && 'Enter your email to receive a 6-digit verification code.'}
                    {step === 2 && 'Please enter the 6-digit code sent to your email address.'}
                    {step === 3 && 'Create a strong, unique password to secure your account.'}
                </p>
            </div>

            {message && !error && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 text-center text-xs font-bold uppercase tracking-tight rounded-sm">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 p-4 text-center text-xs font-bold uppercase tracking-tight rounded-sm">
                    {error}
                </div>
            )}

            {step === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all placeholder:text-[#ccc] rounded-sm"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full btn-primary py-4">
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </form>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">Verification Code</label>
                        <input
                            type="text"
                            placeholder="123456"
                            maxLength="6"
                            value={formData.otp}
                            onChange={(e) => {
                                setFormData({ ...formData, otp: e.target.value });
                                if (e.target.value.length === 6) setStep(3);
                            }}
                            required
                            className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-center text-xl font-bold tracking-[0.5em] text-[#222222] focus:border-[#222222] outline-none transition-all placeholder:text-[#eee] rounded-sm"
                        />
                    </div>
                    <p className="text-center text-[10px] text-[#878787] uppercase tracking-widest cursor-pointer hover:text-[#222222]" onClick={handleSendOTP}>
                        Didn't receive code? Resend
                    </p>
                </div>
            )}

            {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.new_password}
                                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                required
                                className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all placeholder:text-[#ccc] rounded-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#222222] ml-1">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirm_password}
                                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                required
                                className="w-full bg-white border border-[#ebebeb] px-4 py-3 text-sm text-[#222222] focus:border-[#222222] outline-none transition-all placeholder:text-[#ccc] rounded-sm"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full btn-primary py-4">
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            )}

            <button onClick={onBack} className="w-full text-[10px] font-bold uppercase tracking-widest text-[#878787] hover:text-[#222222] transition-colors mt-4">
                Back to Login
            </button>
        </div>
    );
};

export default ForgotPassword;
