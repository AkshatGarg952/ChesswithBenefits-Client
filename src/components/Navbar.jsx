import React, { useState } from 'react';
import { Menu, X, Crown, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('user');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

    const handlePlayClick = () => {
    navigate('/dashboard'); 
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Chess with Benefits
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-orange-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-orange-600 transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-orange-600 transition-colors">
                Testimonials
              </a>
              <a href="#contact" className="text-gray-700 hover:text-orange-600 transition-colors">
                Contact
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!userId ? (
                <>
                  <button 
                    onClick={handleLogin}
                    className="flex items-center space-x-2 px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </button>
                  <button 
                    onClick={handleRegister}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </button>
                </>
              ) : (
                <button onClick={handlePlayClick}
                 className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 hover:scale-105 shadow-lg">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-orange-600 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-orange-100">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-orange-600 transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:text-orange-600 transition-colors">
                  How It Works
                </a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:text-orange-600 transition-colors">
                  Testimonials
                </a>
                <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-orange-600 transition-colors">
                  Contact
                </a>
                <div className="pt-4 space-y-2">
                  {!userId ? (
                    <>
                      <button 
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-all"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Login</span>
                      </button>
                      <button 
                        onClick={handleRegister}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Register</span>
                      </button>
                    </>
                  ) : (
                    <button onClick={handlePlayClick} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-all">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </>
  );
};

export default Navbar;