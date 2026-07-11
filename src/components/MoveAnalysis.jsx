import React, { useState } from 'react';
import { Gem, CheckCircle, ThumbsUp, AlertTriangle, X, Zap } from 'lucide-react';

const moveTypes = [
  { id: 'brilliant',  name: 'Brilliant',  Icon: Gem,           color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.2)',   description: 'An exceptional move showing deep calculation and creativity' },
  { id: 'best',       name: 'Best',       Icon: CheckCircle,   color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.2)',  description: 'The optimal move according to engine analysis' },
  { id: 'good',       name: 'Good',       Icon: ThumbsUp,      color: '#a3e635', bg: 'rgba(163,230,53,0.12)', border: 'rgba(163,230,53,0.2)', description: 'A solid move that maintains your position without major flaws' },
  { id: 'inaccurate', name: 'Inaccurate', Icon: AlertTriangle, color: '#c9a84c', bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.2)', description: 'A slightly suboptimal move that is still playable' },
  { id: 'mistake',    name: 'Mistake',    Icon: X,             color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.2)', description: 'A move that significantly damages your position' },
  { id: 'blunder',    name: 'Blunder',    Icon: Zap,           color: '#f87171', bg: 'rgba(248,113,113,0.12)',border: 'rgba(248,113,113,0.2)',description: 'A serious mistake that loses material or the game' },
];

const sampleMoves = [
  { move: 'Qh5+', type: 'brilliant', eval: '+2.5' },
  { move: 'Nf3',  type: 'best',      eval: '+0.2' },
  { move: 'Bc4',  type: 'good',      eval: '+0.1' },
  { move: 'h3??', type: 'blunder',   eval: '-4.2' },
  { move: 'Qg4?', type: 'mistake',   eval: '-1.8' },
];

const chessPieces = { 'white-king':'♔','white-queen':'♕','white-rook':'♖','white-bishop':'♗','white-knight':'♘','white-pawn':'♙','black-king':'♚','black-queen':'♛','black-rook':'♜','black-bishop':'♝','black-knight':'♞','black-pawn':'♟' };
const sampleBoard = [
  ['black-rook',null,null,'black-queen','black-king',null,null,'black-rook'],
  ['black-pawn','black-pawn',null,null,null,'black-pawn','black-pawn','black-pawn'],
  [null,null,'black-pawn',null,null,'black-knight',null,null],
  [null,null,null,'black-pawn','white-pawn',null,null,null],
  [null,null,'white-bishop','white-pawn',null,null,null,null],
  [null,null,'white-knight',null,null,'white-knight',null,null],
  ['white-pawn','white-pawn','white-pawn',null,null,'white-pawn','white-pawn','white-pawn'],
  ['white-rook',null,null,'white-queen','white-king',null,null,'white-rook']
];

const MoveAnalysis = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <section style={{ background: '#0a0a0f', paddingTop: '6rem', paddingBottom: '6rem', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(201,168,76,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="badge-gold mb-4 inline-flex"><span>📊</span> Move Analysis</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-5 text-white" style={{ fontFamily: 'Cinzel, serif' }}>Real-Time Move Feedback</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(220,210,185,0.5)', lineHeight: 1.7 }}>
            Every move is evaluated instantly — from Brilliant ✨ to Blunder 💥
          </p>
        </div>

        {/* Move type cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {moveTypes.map(({ id, name, Icon, color, bg, border, description }) => (
            <div key={id}
              className="rounded-2xl p-5 cursor-default transition-all duration-250"
              style={{ background: hovered === id ? bg : 'linear-gradient(145deg, rgba(18,15,28,0.9), rgba(12,10,20,0.95))', border: `1px solid ${hovered === id ? border : 'rgba(255,255,255,0.06)'}`, transform: hovered === id ? 'translateY(-4px)' : '' }}
              onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon style={{ width: '16px', height: '16px', color }} />
                </div>
                <span className="font-bold text-sm" style={{ color }}>{name}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(220,210,185,0.5)' }}>{description}</p>
            </div>
          ))}
        </div>

        {/* Demo section */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Board */}
          <div className="board-container">
            <p className="text-xs font-medium mb-3 tracking-wider uppercase" style={{ color: 'rgba(201,168,76,0.5)' }}>Sample Position</p>
            <div className="grid grid-cols-8 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.15)' }}>
              {sampleBoard.map((row, ri) => row.map((piece, ci) => {
                const light = (ri + ci) % 2 === 0;
                return (
                  <div key={`${ri}-${ci}`} className="aspect-square flex items-center justify-center text-base"
                    style={{ background: light ? 'rgba(240,220,180,0.9)' : 'rgba(70,45,20,0.95)' }}>
                    {piece && <span style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>{chessPieces[piece]}</span>}
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Move list */}
          <div className="card-dark p-6">
            <h4 className="text-base font-bold text-white mb-4">Move Analysis Feed</h4>
            <div className="space-y-2.5">
              {sampleMoves.map(({ move, type, eval: ev }, i) => {
                const mt = moveTypes.find(m => m.id === type);
                if (!mt) return null;
                const { Icon, color, bg, border, name } = mt;
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = border; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg, border: `1px solid ${border}` }}>
                        <Icon style={{ width: '13px', height: '13px', color }} />
                      </div>
                      <span className="font-mono text-base font-bold text-white">{move}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: bg, color, border: `1px solid ${border}` }}>{name}</span>
                    </div>
                    <span className="font-mono text-sm font-bold" style={{ color: ev.startsWith('+') ? '#4ade80' : '#f87171' }}>{ev}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoveAnalysis;