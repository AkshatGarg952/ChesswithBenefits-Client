import React, { useState } from 'react';
import { Play, Crown, ArrowRight, Zap } from 'lucide-react';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('user');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const highlights = [
    { icon: '🎤', title: 'Voice Control', desc: 'Command pieces with your voice' },
    { icon: '🧠', title: 'AI Commentary', desc: 'Learn from expert AI analysis' },
    { icon: '📹', title: 'Video Calls',   desc: 'Play face-to-face with friends' },
  ];

  return (
    <>
      <section style={{ background: '#0d0b18', paddingTop: '6rem', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Crown icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(139,105,20,0.1))', border: '1px solid rgba(201,168,76,0.25)', boxShadow: '0 0 40px rgba(201,168,76,0.12)' }}>
            <Crown className="h-10 w-10 text-[#c9a84c]" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white" style={{ fontFamily: 'Cinzel, serif' }}>
            Ready to Play{' '}
            <span style={{ background: 'linear-gradient(135deg, #f5e6c3, #c9a84c, #8b6914)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Chess Like<br />Never Before?
            </span>
          </h2>

          <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(220,210,185,0.55)', lineHeight: 1.8 }}>
            Join thousands of chess enthusiasts who have discovered the most advanced chess platform. Challenge friends, learn from AI, and experience the future of chess.
          </p>

          {/* Highlight cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
            {highlights.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)' }}>
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                <p className="text-xs" style={{ color: 'rgba(220,210,185,0.4)' }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => userId ? navigate('/dashboard') : (() => { setAuthMode('login'); setShowAuthModal(true); })()}
              className="btn-gold inline-flex items-center justify-center gap-2.5 text-base px-8">
              <Play style={{ width: '18px', height: '18px' }} fill="currentColor" />
              Start Playing Free
            </button>
            <button
              onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
              className="btn-outline-gold inline-flex items-center justify-center gap-2.5 text-base px-8">
              Create Account
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Bottom trust row */}
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
            {['Free to play', 'No downloads', 'Works everywhere', '100% online'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(220,210,185,0.4)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#c9a84c' }} /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode={authMode} onSuccess={() => setShowAuthModal(false)} onSwitchMode={m => setAuthMode(m)} />
    </>
  );
};

export default CallToAction;