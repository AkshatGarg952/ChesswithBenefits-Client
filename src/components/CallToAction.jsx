import React, {useState} from 'react';
import { Play, Crown, ArrowRight } from 'lucide-react';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';
const CallToAction = () => {

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
  
  return ( <>
    <section className="py-20 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white rounded-full animate-pulse delay-150"></div>
        <div className="absolute bottom-10 right-10 w-18 h-18 bg-white rounded-full animate-pulse delay-300"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Play Chess Like Never Before?
          </h2>
          
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of chess enthusiasts who have already discovered the most advanced 
            chess platform. Challenge your friends, play against AI, and experience the future of chess.
          </p>
        </div>


        

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">

          {userId ? 
                      ( <button onClick={handlePlayClick} 
                       className="flex items-center space-x-3 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-2xl group">
            <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span>Start Playing Free</span>
          </button>) : 
                      ( <button onClick={handleLogin}
                       className="flex items-center space-x-3 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-2xl group">
            <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span>Start Playing Free</span>
          </button>)
                      }
         
          
          <button onClick={handleRegister}
           className="flex items-center space-x-3 px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all duration-200 border border-white/30 group">
            <span>Create Account</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-white text-2xl mb-2">🎙️</div>
            <h3 className="text-white font-bold mb-2">Voice Control</h3>
            <p className="text-orange-100 text-sm">Command your pieces with your voice</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-white text-2xl mb-2">🧠</div>
            <h3 className="text-white font-bold mb-2">AI Commentary</h3>
            <p className="text-orange-100 text-sm">Learn from expert AI analysis</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-white text-2xl mb-2">📹</div>
            <h3 className="text-white font-bold mb-2">Video Calls</h3>
            <p className="text-orange-100 text-sm">Play face-to-face with friends</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-orange-100 text-sm mb-4">Trusted by chess players worldwide</p>
          <div className="flex justify-center items-center space-x-6 text-orange-200">
            <div className="text-2xl font-bold">10K+</div>
            <div className="w-1 h-1 bg-orange-200 rounded-full"></div>
            <div className="text-2xl font-bold">50K+</div>
            <div className="w-1 h-1 bg-orange-200 rounded-full"></div>
            <div className="text-2xl font-bold">4.9★</div>
          </div>
          <div className="flex justify-center items-center space-x-6 text-orange-200 text-sm">
            <span>Players</span>
            <span></span>
            <span>Games</span>
            <span></span>
            <span>Rating</span>
          </div>
        </div>
      </div>
    </section>

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

export default CallToAction;