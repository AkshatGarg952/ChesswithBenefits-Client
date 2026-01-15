import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Play, Users, Video, MessageCircle, Mic, Crown, ChevronRight, Menu, X, Star, Zap, Globe, Mail, Lock, User } from 'lucide-react';


const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div
        ref={modalRef}
        className="glass-card max-w-md w-full transform transition-all duration-300 animate-scale-in shadow-glass-lg"
      >
        {children}
      </div>
    </div>
  );
};

const LoginForm = ({ onSwitchToRegister, onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting login to:", `${import.meta.env.VITE_SERVER_URL}/api/users/login`);
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/users/login`, {
        email,
        password
      });
      const user = res.data;
      navigate(`/dashboard/${user.username}/${user._id}`);
      onClose();
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
    }
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold gradient-text">
          Welcome Back
        </h2>
        <p className="text-gray-600 mt-2">Sign in to continue your chess journey</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="w-5 h-5 text-primary-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-modern pl-10"
            required
          />
        </div>
        <div className="relative">
          <Lock className="w-5 h-5 text-primary-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-modern pl-10"
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full"
        >
          Login
        </button>
      </form>
      <div className="text-center text-sm">
        <span className="text-gray-600">Don't have an account? </span>
        <button
          onClick={onSwitchToRegister}
          className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
        >
          Register
        </button>
      </div>
    </div>
  );
};

const RegisterForm = ({ onSwitchToLogin, onClose }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/users/register`, {
        username,
        email,
        password
      });
      const user = res.data;

      navigate(`/dashboard/${user.username}/${user._id}`);
      onClose();
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold gradient-text">
          Join ChessConnect
        </h2>
        <p className="text-gray-600 mt-2">Create an account to start playing</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="w-5 h-5 text-primary-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-modern pl-10"
            required
          />
        </div>
        <div className="relative">
          <Mail className="w-5 h-5 text-primary-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-modern pl-10"
            required
          />
        </div>
        <div className="relative">
          <Lock className="w-5 h-5 text-primary-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-modern pl-10"
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full"
        >
          Register
        </button>
      </form>
      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <button
          onClick={onSwitchToLogin}
          className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default function ChessLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Video,
      title: "Real-Time Video Calls",
      description: "Face your opponent with crystal-clear video calls during gameplay",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Communicate with your opponent through seamless in-game chat",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Mic,
      title: "Voice Commands",
      description: "Move pieces naturally by speaking your moves aloud",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: Zap,
      title: "AI Commentary",
      description: "Choose between hype, educational, or minimal commentary modes to suit your style",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Play with Friends",
      description: "Create private rooms, invite friends, and enjoy games together seamlessly",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart,
      title: "Move Analysis",
      description: "Track your performance with move ratings: brilliant, best, good, inaccuracy, mistake, and blunder",
      color: "from-cyan-500 to-blue-500"
    }
  ];


  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
    setIsMenuOpen(false);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
    setIsMenuOpen(false);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-primary-400/30 to-accent-400/30 rounded-full blur-3xl animate-pulse-slow"
          style={{
            left: mousePosition.x / 10,
            top: mousePosition.y / 10,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-info-400/20 to-primary-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-accent-400/15 to-info-400/15 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-success-400/10 to-primary-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center transform rotate-45 shadow-glow-sm">
                <Crown className="w-6 h-6 text-white transform -rotate-45" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">
                ChessConnect
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-primary-600 transition-all duration-300 font-medium relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#about" className="text-gray-700 hover:text-primary-600 transition-all duration-300 font-medium relative group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition-all duration-300 font-medium relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              {localStorage.getItem('userId') !== undefined ? (
                <a href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-all duration-300 font-medium relative group">
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              ) : (
                <button onClick={openLogin} className="text-gray-700 hover:text-primary-600 transition-all duration-300 font-medium">Dashboard</button>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <button onClick={openLogin} className="px-5 py-2.5 text-primary-600 hover:text-primary-700 transition-all duration-300 font-semibold">
                Login
              </button>
              <button onClick={openRegister} className="btn-primary">
                Register
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-white/50 rounded-lg transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2 glass rounded-2xl shadow-glass-lg animate-fade-in-down">
            <div className="px-6 py-4 space-y-3">
              <a href="#" className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2">Home</a>
              <a href="#about" className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2">About</a>
              <a href="#features" className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2">Features</a>
              <a href="#dashboard" className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2">Dashboard</a>
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <button onClick={openLogin} className="block w-full text-left text-primary-600 font-semibold py-2">Login</button>
                <button onClick={openRegister} className="btn-primary w-full">
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <Modal isOpen={isLoginOpen} onClose={closeModals}>
        <LoginForm onSwitchToRegister={openRegister} onClose={closeModals} />
      </Modal>
      <Modal isOpen={isRegisterOpen} onClose={closeModals}>
        <RegisterForm onSwitchToLogin={openLogin} onClose={closeModals} />
      </Modal>

      {/* Hero Section */}
      <div id="about" className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-orange-800 text-sm font-medium animate-pulse">
                <Star className="w-4 h-4 mr-2" />
                Revolutionary Chess Experience
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent">
                  Chess
                </span>
                <br />
                <span className="text-gray-800">Reimagined</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Experience chess like never before with real-time video calls, live chat, and revolutionary voice commands. Connect, compete, and conquer with friends worldwide.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {localStorage.getItem('userId') ? (
                <a href="/dashboard" className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center font-semibold text-lg">
                  <Play className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                  Start Playing
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <button onClick={openLogin} className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center font-semibold text-lg">
                  <Play className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                  Start Playing
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <a className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-800 rounded-xl hover:bg-white transition-all border border-orange-200 hover:border-orange-300 flex items-center justify-center font-semibold text-lg">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Star It on Github
              </a>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">10K+</div>
                <div className="text-gray-600 text-sm">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">50K+</div>
                <div className="text-gray-600 text-sm">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">99%</div>
                <div className="text-gray-600 text-sm">Uptime</div>
              </div>
            </div>
          </div>

          {/* Animated Chess Board */}
          <div className="relative">
            <div className="w-full max-w-md mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white to-orange-50 p-8 rounded-2xl shadow-2xl border border-orange-200">
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    const isLight = (row + col) % 2 === 0;
                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center text-2xl transition-all hover:scale-110 ${isLight
                          ? 'bg-gradient-to-br from-amber-100 to-orange-100'
                          : 'bg-gradient-to-br from-orange-300 to-red-300'
                          }`}
                        style={{
                          animationDelay: `${i * 50}ms`
                        }}
                      >
                        {(i === 0 || i === 7) && '♜'}
                        {(i === 1 || i === 6) && '♞'}
                        {(i === 2 || i === 5) && '♝'}
                        {i === 3 && '♛'}
                        {i === 4 && '♚'}
                        {(i >= 8 && i <= 15) && '♟'}
                        {(i >= 48 && i <= 55) && '♙'}
                        {i === 56 && '♖'}
                        {i === 63 && '♖'}
                        {i === 57 && '♘'}
                        {i === 62 && '♘'}
                        {i === 58 && '♗'}
                        {i === 61 && '♗'}
                        {i === 59 && '♕'}
                        {i === 60 && '♔'}
                      </div>
                    );
                  })}
                </div>

                {/* Floating feature indicators */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div className="absolute top-1/2 -right-6 w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-ping shadow-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Game-Changing
            </span>
            <br />
            <span className="text-gray-800">Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of online chess with our revolutionary features designed to bring players closer together.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = currentFeature === index;
            return (
              <div
                key={index}
                className={`relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl border transition-all duration-500 hover:scale-105 ${isActive ? 'border-orange-300 shadow-2xl' : 'border-orange-200 shadow-lg'
                  }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 hover:opacity-10 rounded-2xl transition-opacity`}></div>
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 ${isActive ? 'animate-pulse' : ''}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                  <div className="mt-6">
                    <button className="text-orange-600 hover:text-orange-700 font-semibold flex items-center group">
                      Learn More
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Zap className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to Play?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of players already experiencing the future of chess. Create your account and start your first game today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={openRegister} className="px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl font-semibold text-lg flex items-center justify-center">
                <Globe className="w-6 h-6 mr-2" />
                Create Account
              </button>
              {localStorage.getItem('userId') ? (
                <a href="/dashboard" className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border-2 border-white/30 font-semibold text-lg">
                  Go to Dashboard
                </a>
              ) : (
                <button onClick={openLogin} className="px-8 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold text-lg">
                  Login First
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center transform rotate-45">
                  <Crown className="w-5 h-5 text-white transform -rotate-45" />
                </div>
                <span className="text-xl font-bold">ChessConnect</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing online chess with cutting-edge technology and seamless player connections.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Game</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Play Now</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Tournament</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Leaderboard</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Discord</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Forums</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Blog</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 ChessConnect. All rights reserved. Built with passion for chess lovers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}