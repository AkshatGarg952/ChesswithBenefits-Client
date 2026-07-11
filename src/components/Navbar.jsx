import React, { useState } from 'react';
import { Menu, X, Crown, LogIn, UserPlus, LayoutDashboard, Zap } from 'lucide-react';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('user');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handlePlayClick = () => navigate('/dashboard');
  const handleLogin    = () => { setAuthMode('login');    setShowAuthModal(true); };
  const handleRegister = () => { setAuthMode('register'); setShowAuthModal(true); };
  const handleAuthSuccess = () => setShowAuthModal(false);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[rgba(201,168,76,0.15)] shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center space-x-2.5 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#7a5510] shadow-[0_0_15px_rgba(201,168,76,0.4)]">
                <Crown className="h-5 w-5 text-[#0a0a0f]" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-lg font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif', background: 'linear-gradient(135deg, #f5e6c3, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Chess
                </span>
                <span className="text-lg font-bold tracking-wide text-white/80" style={{ fontFamily: 'Cinzel, serif' }}> with Benefits</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How It Works', 'Testimonials'].map(label => (
                <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`} className="nav-link text-sm font-medium">
                  {label}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {!userId ? (
                <>
                  <button onClick={handleLogin} className="btn-outline-gold text-sm px-4 py-2 flex items-center gap-2">
                    <LogIn className="h-4 w-4" /> Login
                  </button>
                  <button onClick={handleRegister} className="btn-gold text-sm px-4 py-2 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Sign Up
                  </button>
                </>
              ) : (
                <button onClick={handlePlayClick} className="btn-gold text-sm px-4 py-2 flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </button>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-[#c9a84c] hover:text-[#e0bd6a] transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-[rgba(201,168,76,0.1)] bg-[#0a0a0f]/97 backdrop-blur-xl animate-fade-in">
              <div className="px-4 py-4 space-y-3">
                {['Features', 'How It Works', 'Testimonials'].map(label => (
                  <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                     className="block py-2 text-[rgba(220,210,190,0.8)] hover:text-[#c9a84c] font-medium transition-colors"
                     onClick={() => setIsMenuOpen(false)}>
                    {label}
                  </a>
                ))}
                <div className="pt-2 space-y-2 border-t border-[rgba(201,168,76,0.1)]">
                  {!userId ? (
                    <>
                      <button onClick={handleLogin} className="btn-outline-gold w-full justify-center flex items-center gap-2">
                        <LogIn className="h-4 w-4" /> Login
                      </button>
                      <button onClick={handleRegister} className="btn-gold w-full justify-center flex items-center gap-2">
                        <UserPlus className="h-4 w-4" /> Sign Up
                      </button>
                    </>
                  ) : (
                    <button onClick={handlePlayClick} className="btn-gold w-full justify-center flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onSwitchMode={(m) => setAuthMode(m)}
      />
    </>
  );
};

export default Navbar;