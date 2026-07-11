import React, { useState } from 'react';
import { Brain, Zap, Smile, ChevronLeft, ChevronRight } from 'lucide-react';

const modes = [
  {
    icon: Brain, emoji: '🧠',
    title: "Beginner's Mode",
    description: "Clean, educational commentary that explains every move in simple terms. Perfect for learning chess fundamentals.",
    example: "White develops the knight to f3, controlling the center and preparing kingside castling. A classic opening principle!",
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.2)',
  },
  {
    icon: Zap, emoji: '⚡',
    title: "Hype Mode",
    description: "Explosive, high-energy commentary that hypes up every move like a crowd-roaring esports tournament.",
    example: "THAT KNIGHT FORK IS ABSOLUTELY INSANE!! The crowd is going WILD — this move could turn the entire game around!",
    color: '#c9a84c',
    bg: 'rgba(201,168,76,0.1)',
    border: 'rgba(201,168,76,0.2)',
  },
  {
    icon: Smile, emoji: '🔥',
    title: "Roast Mode",
    description: "Brutally honest, comedic commentary that roasts bad moves and celebrates brilliant ones with savage humor.",
    example: "Bro really just walked the queen into a fork... my grandma plays better blindfolded. Is this a joke or a chess game?",
    color: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.2)',
  },
];

const AICommentary = () => {
  const [active, setActive] = useState(0);
  const { icon: Icon, emoji, title, description, example, color, bg, border } = modes[active];

  return (
    <section style={{ background: '#0d0b18', paddingTop: '6rem', paddingBottom: '6rem', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="badge-gold mb-4 inline-flex"><span>🤖</span> AI Commentary</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-5 text-white" style={{ fontFamily: 'Cinzel, serif' }}>3 Commentary Modes</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(220,210,185,0.5)', lineHeight: 1.7 }}>
            Choose how the AI narrates your game — educational, hype, or ruthlessly funny.
          </p>
        </div>

        {/* Mode selectors */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {modes.map((m, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250 flex items-center gap-2"
              style={{
                background: active === i ? m.bg : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active === i ? m.border : 'rgba(255,255,255,0.08)'}`,
                color: active === i ? m.color : 'rgba(220,210,185,0.5)',
                transform: active === i ? 'scale(1.04)' : 'scale(1)',
              }}>
              <span>{m.emoji}</span> {m.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Active mode card */}
        <div className="rounded-3xl p-8 transition-all duration-300" style={{ background: 'linear-gradient(145deg, rgba(18,15,28,0.95), rgba(12,10,20,0.98))', border: `1px solid ${border}`, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${bg}` }}>
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl mb-4" style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon style={{ width: '32px', height: '32px', color }} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm" style={{ color: 'rgba(220,210,185,0.55)', maxWidth: '500px', margin: '0 auto' }}>{description}</p>
          </div>

          {/* Quote */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg, border: `1px solid ${border}` }}>
                <Brain style={{ width: '14px', height: '14px', color }} />
              </div>
              <div>
                <p className="text-xs mb-1.5 font-semibold tracking-wider uppercase" style={{ color }}>AI Commentary</p>
                <p className="text-sm leading-relaxed italic" style={{ color: 'rgba(220,210,185,0.75)' }}>
                  &ldquo;{example}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-between items-center">
            <button onClick={() => setActive(p => (p - 1 + modes.length) % modes.length)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: 'rgba(220,210,185,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(220,210,185,0.4)'}>
              <ChevronLeft style={{ width: '16px', height: '16px' }} /> Prev
            </button>
            <div className="flex gap-2">
              {modes.map((m, i) => (
                <div key={i} onClick={() => setActive(i)} className="cursor-pointer rounded-full transition-all duration-300"
                  style={{ width: active === i ? '24px' : '8px', height: '8px', background: active === i ? m.color : 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
            <button onClick={() => setActive(p => (p + 1) % modes.length)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: 'rgba(220,210,185,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(220,210,185,0.4)'}>
              Next <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AICommentary;