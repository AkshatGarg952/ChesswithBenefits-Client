import React,{ useState } from 'react';
import AuthModal from './AuthModal';
import { Play, Zap, Brain, Mic} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
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
  
  
    const handleAuthSuccess = () => {
      setIsLoggedIn(true);
      setShowAuthModal(false);
    };
 
  const chessPieces = {
    'white-king': '♔',
    'white-queen': '♕',
    'white-rook': '♖',
    'white-bishop': '♗',
    'white-knight': '♘',
    'white-pawn': '♙',
    'black-king': '♚',
    'black-queen': '♛',
    'black-rook': '♜',
    'black-bishop': '♝',
    'black-knight': '♞',
    'black-pawn': '♟'
  };

  // Initial chess board setup
  const initialBoard = [
    ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook'],
    ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
    ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook']
  ];

  return (
    <>
    <section className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                <Zap className="h-4 w-4 mr-2" />
                AI-Powered Chess Experience
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Play Chess Like
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-200 bg-clip-text text-transparent">
                Never Before
              </span>
            </h1>
            
            <p className="text-xl text-orange-100 mb-8 leading-relaxed">
              Experience real-time multiplayer chess with AI-powered commentary, 
              voice control, and video calls. Challenge friends or AI in the most 
              advanced chess platform ever created.
            </p>
            
            <div className="flex flex-wrap gap-4 text-orange-100 mb-8">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-200 rounded-full mr-2"></div>
                Real-Time Multiplayer
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-200 rounded-full mr-2"></div>
                AI-Powered Commentary
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-200 rounded-full mr-2"></div>
                Voice Control
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">


              {userId ? 
              (<button onClick={handlePlayClick} 
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-2xl">
                <Play className="h-5 w-5" />
                <span>Start Playing</span>
              </button>) : 
              (<button onClick={handleLogin}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-2xl">
                <Play className="h-5 w-5" />
                <span>Start Playing</span>
              </button>)
              }


              <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30">
                <Brain className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Right Side - Chess Board Visual */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="grid grid-cols-8 gap-1 mb-4">
                {initialBoard.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0;
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`aspect-square rounded-sm flex items-center justify-center text-2xl ${
                          isLight ? 'bg-orange-100' : 'bg-orange-800'
                        }`}
                      >
                        {piece && (
                          <span className="text-gray-800 drop-shadow-sm">
                            {chessPieces[piece]}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* AI Commentary Badge */}
              <div className="flex items-center justify-center space-x-2 bg-white/20 rounded-full px-4 py-2 mb-4">
                <Mic className="h-4 w-4 text-white" />
                <span className="text-white text-sm">AI Commentary Active</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              {/* Voice Command Demo */}
              <div className="bg-white/20 rounded-xl p-4 border border-white/30">
                <p className="text-white text-sm mb-2">🎤 Voice Command:</p>
                <p className="text-orange-200 font-medium">"Move pawn to e4"</p>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-bounce">
              <Brain className="h-6 w-6 text-orange-600" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg animate-pulse">
              <Zap className="h-6 w-6 text-red-600" />
            </div>
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

export default Hero;