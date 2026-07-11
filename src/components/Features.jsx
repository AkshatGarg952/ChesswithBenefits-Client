import React from 'react';
import { Users, Video, MessageCircle, Brain, Mic, TrendingUp, ChevronRight } from 'lucide-react';

const features = [
  {
    Icon: Users,
    title: "Private Game Rooms",
    description: "Create exclusive chess rooms and invite friends for private matches with custom settings and commentary.",
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.15)',
    emoji: '🏰',
  },
  {
    Icon: Video,
    title: "Live Video Calls",
    description: "See your opponent's reactions in real-time with integrated peer-to-peer video calling during every match.",
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)',
    border: 'rgba(74,222,128,0.15)',
    emoji: '📹',
  },
  {
    Icon: MessageCircle,
    title: "Real-Time Chat",
    description: "Communicate with your opponent through our built-in chat system with full message history persistence.",
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
    border: 'rgba(251,146,60,0.15)',
    emoji: '💬',
  },
  {
    Icon: Brain,
    title: "AI Commentary",
    description: "Choose from Roast, Beginner's or Hype commentary modes — the AI watches every move and reacts instantly.",
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.1)',
    border: 'rgba(192,132,252,0.15)',
    emoji: '🧠',
  },
  {
    Icon: Mic,
    title: "Voice Command Moves",
    description: "Control your pieces with your voice — just say the move and watch it execute on the board instantly.",
    color: '#c9a84c',
    bg: 'rgba(201,168,76,0.1)',
    border: 'rgba(201,168,76,0.15)',
    emoji: '🎤',
  },
  {
    Icon: TrendingUp,
    title: "Move Quality Analysis",
    description: "Get instant feedback on every move — from Brilliant ✨ to Blunder 💥 — with detailed post-game stats.",
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.15)',
    emoji: '📊',
  },
];

const Features = () => (
  <section id="features" style={{ background: '#0a0a0f', paddingTop: '6rem', paddingBottom: '6rem', position: 'relative' }}>
    {/* Ambient glow */}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 40% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="badge-gold mb-4 inline-flex">
          <span>⚡</span> Platform Features
        </span>
        <h2 className="text-4xl md:text-5xl font-black mt-4 mb-5 text-white" style={{ fontFamily: 'Cinzel, serif' }}>
          Built for Champions
        </h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(220,210,185,0.55)', lineHeight: 1.7 }}>
          Everything you need for the ultimate chess experience — social, analytical, and immersive.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ Icon, title, description, color, bg, border, emoji }, i) => (
          <div key={i}
            className="group relative rounded-2xl p-6 transition-all duration-300 cursor-default"
            style={{
              background: 'linear-gradient(145deg, rgba(18,15,28,0.9), rgba(12,10,20,0.95))',
              border: `1px solid ${border}`,
              animationDelay: `${i * 80}ms`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${bg.replace('0.1)', '0.08)')}`;
              e.currentTarget.style.borderColor = color + '40';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.borderColor = border;
            }}>

            {/* Top gradient line */}
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: `linear-gradient(90deg, transparent, ${color}60, transparent)`, borderRadius: '9999px' }} />

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                style={{ background: bg, border: `1px solid ${border}` }}>
                {emoji}
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-auto"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon style={{ width: '16px', height: '16px', color }} />
              </div>
            </div>

            <h3 className="text-base font-bold mb-2 text-white">{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(220,210,185,0.5)' }}>{description}</p>

            <div className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color }}>
              Learn more <ChevronRight style={{ width: '12px', height: '12px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;