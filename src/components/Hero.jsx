import React, { useState } from 'react';
import AuthModal from './AuthModal';
import { Play, Zap, Brain, Mic, Crown, Star, ChevronRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('user');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handlePlayClick = () => navigate('/dashboard');
  const handleLogin = () => { setAuthMode('login'); setShowAuthModal(true); };
  const handleAuthSuccess = () => { setShowAuthModal(false); };

  const chessPieces = {
    'white-king': '♔', 'white-queen': '♕', 'white-rook': '♖',
    'white-bishop': '♗', 'white-knight': '♘', 'white-pawn': '♙',
    'black-king': '♚', 'black-queen': '♛', 'black-rook': '♜',
    'black-bishop': '♝', 'black-knight': '♞', 'black-pawn': '♟'
  };

  const initialBoard = [
    ['black-rook','black-knight','black-bishop','black-queen','black-king','black-bishop','black-knight','black-rook'],
    ['black-pawn','black-pawn','black-pawn','black-pawn','black-pawn','black-pawn','black-pawn','black-pawn'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,'white-pawn',null,null,null,null],
    [null,null,null,null,'black-pawn',null,null,null],
    ['white-pawn','white-pawn','white-pawn',null,'white-pawn','white-pawn','white-pawn','white-pawn'],
    ['white-rook','white-knight','white-bishop','white-queen','white-king','white-bishop','white-knight','white-rook']
  ];

  const features = [
    { icon: '🧠', label: 'AI Commentary' },
    { icon: '🎤', label: 'Voice Control' },
    { icon: '📹', label: 'Video Calls' },
    { icon: '⚡', label: 'Real-Time' },
  ];

  return (
    <>
      <section className="relative min-h-screen overflow-hidden flex items-center" style={{ background: '#0a0a0f' }}>
        {/* Ambient background */}
        <div className="absolute inset-0 chess-bg opacity-60" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 50%, rgba(120,80,20,0.06) 0%, transparent 60%)'
        }} />

        {/* Floating chess pieces decoration */}
        <div className="absolute top-24 left-8 text-6xl opacity-5 animate-float select-none" style={{ animationDelay: '0s' }}>♛</div>
        <div className="absolute top-48 right-12 text-5xl opacity-5 animate-float select-none" style={{ animationDelay: '2s' }}>♞</div>
        <div className="absolute bottom-32 left-16 text-7xl opacity-4 animate-float select-none" style={{ animationDelay: '1s' }}>♜</div>
        <div className="absolute bottom-24 right-8 text-5xl opacity-5 animate-float select-none" style={{ animationDelay: '3s' }}>♟</div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left — Copy */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="mb-6">
                <span className="badge-gold">
                  <Zap className="h-3 w-3" />
                  AI-Powered Chess Platform
                </span>
              </div>

              <h1 className="mb-6 leading-none" style={{ fontFamily: 'Cinzel, serif' }}>
                <span className="block text-4xl sm:text-5xl md:text-7xl font-bold text-white/90 mb-1">Play Chess</span>
                <span className="block text-4xl sm:text-5xl md:text-7xl font-black" style={{
                  background: 'linear-gradient(135deg, #f5e6c3 0%, #c9a84c 45%, #8b6914 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 0 30px rgba(201,168,76,0.3))'
                }}>
                  Like Never Before
                </span>
              </h1>

              <p className="text-lg text-[rgba(220,210,185,0.7)] mb-10 leading-relaxed max-w-xl">
                Experience real-time multiplayer chess elevated with AI-powered commentary,
                voice commands, and live video calls. The most immersive chess platform ever built.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 mb-10 justify-center lg:justify-start">
                {features.map(f => (
                  <div key={f.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-[rgba(220,210,185,0.8)]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.12)' }}>
                    <span>{f.icon}</span> {f.label}
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {userId ? (
                  <button onClick={handlePlayClick} className="btn-gold flex items-center justify-center gap-2.5 text-base">
                    <Play className="h-5 w-5" fill="currentColor" />
                    Start Playing
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={handleLogin} className="btn-gold flex items-center justify-center gap-2.5 text-base">
                    <Play className="h-5 w-5" fill="currentColor" />
                    Start Playing
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                <button className="btn-outline-gold flex items-center justify-center gap-2.5 text-base">
                  <Brain className="h-5 w-5" />
                  Watch Demo
                </button>
              </div>

              {/* Social proof */}
              <div className="mt-10 flex items-center gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {['#c9a84c', '#a07820', '#8b6914', '#6b4f10'].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold text-[#0a0a0f]"
                      style={{ background: c }}>
                      {['A','B','C','D'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-[#c9a84c]" fill="#c9a84c" />)}
                  </div>
                  <span className="text-xs text-[rgba(220,210,185,0.6)]">Loved by 10,000+ players</span>
                </div>
              </div>
            </div>

            {/* Right — Chess board visual */}
            <div className="relative animate-slide-right overflow-hidden">
              <div className="board-container">
                {/* Board header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
                    <span className="text-xs font-medium text-[rgba(220,210,185,0.6)] tracking-wider uppercase">Live Match</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-[#c9a84c]" />
                    <span className="text-xs text-[rgba(220,210,185,0.5)]">Ranked Game</span>
                  </div>
                </div>

                {/* Board */}
                <div className="grid grid-cols-8 rounded-lg overflow-hidden" style={{ border: '2px solid rgba(201,168,76,0.2)' }}>
                  {initialBoard.map((row, ri) =>
                    row.map((piece, ci) => {
                      const isLight = (ri + ci) % 2 === 0;
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className="aspect-square flex items-center justify-center text-xl sm:text-2xl relative"
                          style={{
                            background: isLight
                              ? 'rgba(240,220,180,0.92)'
                              : 'rgba(70,45,20,0.95)',
                          }}
                        >
                          {piece && (
                            <span className={`select-none drop-shadow-md ${piece.startsWith('black') ? 'text-[#1a1008]' : 'text-[#f5e6c3]'}`}
                              style={{ textShadow: piece.startsWith('white') ? '0 1px 4px rgba(0,0,0,0.8)' : '0 1px 3px rgba(0,0,0,0.5)' }}>
                              {chessPieces[piece]}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Status bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.1)' }}>
                    <Mic className="h-4 w-4 text-[#c9a84c]" />
                    <span className="text-xs text-[rgba(220,210,185,0.7)]">AI Commentary Active</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-auto" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <span className="text-xs text-[#c9a84c] font-mono font-bold">e2→e4</span>
                  </div>
                </div>
              </div>

              {/* Floating accent cards */}
              <div className="absolute -top-5 -right-5 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="glass-gold rounded-xl px-3 py-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-[#c9a84c]" />
                  <span className="text-xs text-[rgba(220,210,185,0.8)]">AI Analysis</span>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="glass-gold rounded-xl px-3 py-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#c9a84c]" />
                  <span className="text-xs text-[rgba(220,210,185,0.8)]">Real-Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0a0a0f, transparent)' }} />
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onSwitchMode={m => setAuthMode(m)}
      />
    </>
  );
};

export default Hero;