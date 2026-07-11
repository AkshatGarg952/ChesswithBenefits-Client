import React, { useState } from 'react';
import { UserPlus, Users, PlayCircle, ArrowRight } from 'lucide-react';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';

const steps = [
  { icon: '🏰', num: '01', title: 'Create or Join a Room', description: 'Start by creating a private room or joining an existing one with a simple room code. Set your preferences.', color: '#60a5fa' },
  { icon: '👥', num: '02', title: 'Invite Your Friend',    description: 'Share your room code with a friend. Both players connect and the game begins automatically.',           color: '#c9a84c' },
  { icon: '🎮', num: '03', title: 'Play, Talk & Learn',   description: 'Experience chess with voice commands, video calls, and AI commentary — simultaneously.',               color: '#4ade80' },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('user');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  return (
    <>
      <section id="how-it-works" style={{ background: '#0d0b18', paddingTop: '6rem', paddingBottom: '6rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="badge-gold mb-4 inline-flex"><span>🗺</span> Simple Steps</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-5 text-white" style={{ fontFamily: 'Cinzel, serif' }}>How It Works</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(220,210,185,0.5)', lineHeight: 1.7 }}>
              Get playing in under a minute. No downloads, no installs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />

            {steps.map(({ icon, num, title, description, color }, i) => (
              <div key={i} className="relative text-center">
                {/* Step number badge */}
                <div className="inline-flex items-center justify-center mb-6 relative">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    {icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #c9a84c, #8b6914)', color: '#0a0a0f' }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(220,210,185,0.5)' }}>{description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <button
              onClick={() => userId ? navigate('/dashboard') : setShowAuthModal(true)}
              className="btn-gold inline-flex items-center gap-2.5 text-base">
              <PlayCircle style={{ width: '18px', height: '18px' }} />
              Start Your First Game
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode={authMode} onSuccess={() => setShowAuthModal(false)} onSwitchMode={m => setAuthMode(m)} />
    </>
  );
};

export default HowItWorks;