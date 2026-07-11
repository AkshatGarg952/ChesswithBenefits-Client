import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, mode, onSuccess, onSwitchMode }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', username: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        mode === 'login'
          ? `${import.meta.env.VITE_SERVER_URL}/api/users/login`
          : `${import.meta.env.VITE_SERVER_URL}/api/users/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      const { user, token } = data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', user._id);
      onSuccess(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-md animate-scale-in" style={{
        background: 'linear-gradient(145deg, rgba(18,15,28,0.98), rgba(12,10,20,0.99))',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '1.5rem',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(201,168,76,0.05)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(139,105,20,0.1))',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
          padding: '1.5rem',
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #8b6914)', boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}>
                <Crown className="h-5 w-5 text-[#0a0a0f]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
                  {mode === 'login' ? 'Welcome Back' : 'Join the Elite'}
                </h2>
                <p className="text-sm text-[rgba(220,210,185,0.5)]">
                  {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.06)'}>
              <X className="h-4 w-4 text-[rgba(220,210,185,0.8)]" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-[rgba(220,210,185,0.7)] mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[rgba(201,168,76,0.5)]" style={{width:'18px',height:'18px'}} />
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange}
                    className="input-dark pl-10" placeholder="Your username" required />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[rgba(220,210,185,0.7)] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(201,168,76,0.5)]" style={{width:'18px',height:'18px'}} />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className="input-dark pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgba(220,210,185,0.7)] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(201,168,76,0.5)]" style={{width:'18px',height:'18px'}} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange}
                  className="input-dark pl-10 pr-11" placeholder="Your password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(201,168,76,0.5)] hover:text-[#c9a84c] transition-colors">
                  {showPassword ? <EyeOff style={{width:'18px',height:'18px'}} /> : <Eye style={{width:'18px',height:'18px'}} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-gold w-full justify-center flex items-center gap-2 mt-2" style={{opacity: isLoading ? 0.7 : 1}}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0a0a0f]/30 border-t-[#0a0a0f] rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="divider-gold" />

          <p className="text-center text-sm text-[rgba(220,210,185,0.5)]">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
              className="text-[#c9a84c] hover:text-[#e0bd6a] font-semibold transition-colors">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
