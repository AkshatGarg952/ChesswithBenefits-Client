import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  { name: "Alex Chen",         role: "Chess Master",      avatar: "AC", color: '#c9a84c', rating: 5, content: "The AI commentary is absolutely brilliant! It's like having a grandmaster explain every move. The voice control feature is completely game-changing.", highlight: "Like having a grandmaster by your side" },
  { name: "Sarah Williams",    role: "Tournament Player", avatar: "SW", color: '#60a5fa', rating: 5, content: "Playing chess while on video call brings back the social aspect of the game. The move analysis helps me understand my mistakes instantly.", highlight: "Brings back the social essence of chess" },
  { name: "Michael Rodriguez", role: "Chess Enthusiast",  avatar: "MR", color: '#4ade80', rating: 5, content: "I've played chess for years, but this platform took my game to the next level. Different commentary modes keep every game interesting and educational.", highlight: "Took my game to the next level" },
  { name: "Emma Thompson",     role: "Chess Coach",       avatar: "ET", color: '#c084fc', rating: 5, content: "As a coach, I love how this platform helps my students learn. The move quality analysis is perfect for teaching chess principles.", highlight: "Perfect for teaching chess principles" },
  { name: "David Kim",         role: "Software Dev",      avatar: "DK", color: '#fb923c', rating: 5, content: "Voice commands work flawlessly! I can play without even touching my mouse. The technology behind this is impressive.", highlight: "Voice commands work flawlessly!" },
  { name: "Lisa Anderson",     role: "Chess Streamer",    avatar: "LA", color: '#34d399', rating: 5, content: "My viewers love the entertaining commentary mode! It makes streams more engaging and helps explain complex positions in a fun way.", highlight: "Makes every stream more engaging" },
];

const stats = [
  { val: '10K+', label: 'Active Players' },
  { val: '50K+', label: 'Games Played' },
  { val: '4.9★', label: 'Avg. Rating' },
  { val: '95%',  label: 'Satisfaction' },
];

const Testimonials = () => (
  <section id="testimonials" style={{ background: '#0a0a0f', paddingTop: '6rem', paddingBottom: '6rem', position: 'relative' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,168,76,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-16">
        <span className="badge-gold mb-4 inline-flex"><span>⭐</span> Testimonials</span>
        <h2 className="text-4xl md:text-5xl font-black mt-4 mb-5 text-white" style={{ fontFamily: 'Cinzel, serif' }}>What Players Say</h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(220,210,185,0.5)' }}>
          Thousands of chess players have transformed their game with our platform.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {testimonials.map(({ name, role, avatar, color, rating, content, highlight }, i) => (
          <div key={i} className="rounded-2xl p-6 transition-all duration-300"
            style={{ background: 'linear-gradient(145deg, rgba(18,15,28,0.9), rgba(12,10,20,0.95))', border: '1px solid rgba(201,168,76,0.1)', animationDelay: `${i * 60}ms` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.1)'; e.currentTarget.style.boxShadow = ''; }}>

            <div className="flex items-center justify-between mb-4">
              <Quote style={{ width: '20px', height: '20px', color: 'rgba(201,168,76,0.2)' }} />
              <div className="flex gap-0.5">
                {[...Array(rating)].map((_, i) => <Star key={i} style={{ width: '12px', height: '12px', color: '#c9a84c', fill: '#c9a84c' }} />)}
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(220,210,185,0.65)' }}>{content}</p>

            <div className="rounded-xl px-3 py-2 mb-4 border-l-2" style={{ background: `${color}0d`, borderColor: `${color}50` }}>
              <p className="text-xs font-semibold italic" style={{ color }}>&ldquo;{highlight}&rdquo;</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-[#0a0a0f]"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
                {avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{name}</p>
                <p className="text-xs" style={{ color: 'rgba(220,210,185,0.4)' }}>{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
        style={{ background: 'rgba(201,168,76,0.1)', boxShadow: '0 0 40px rgba(201,168,76,0.06)' }}>
        {stats.map(({ val, label }) => (
          <div key={label} className="text-center py-8 px-4" style={{ background: 'linear-gradient(145deg, rgba(15,13,24,0.98), rgba(10,10,18,1))' }}>
            <p className="text-3xl font-black mb-1" style={{ background: 'linear-gradient(135deg, #f5e6c3, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</p>
            <p className="text-xs tracking-wider uppercase" style={{ color: 'rgba(220,210,185,0.45)' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;