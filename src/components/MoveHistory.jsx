import { History } from 'lucide-react';

const MoveHistory = ({ moves, className = "" }) => {
  const grouped = [];
  for (let i = 0; i < moves.length; i += 2) {
    grouped.push({ num: Math.floor(i / 2) + 1, white: moves[i], black: moves[i + 1] });
  }

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(145deg, rgba(18,15,28,0.95), rgba(12,10,20,0.98))', border: '1px solid rgba(201,168,76,0.12)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(201,168,76,0.04)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <History style={{ width: '14px', height: '14px', color: '#c9a84c' }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: 'rgba(220,210,185,0.85)' }}>Move History</span>
        {moves.length > 0 && (
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)' }}>
            {moves.length}
          </span>
        )}
      </div>

      {/* Moves */}
      <div className="flex-1 p-2 overflow-y-auto" style={{ maxHeight: '260px' }}>
        {moves.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            <span className="text-3xl opacity-10">♟</span>
            <p className="text-xs" style={{ color: 'rgba(220,210,185,0.3)' }}>No moves yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Column headers */}
            <div className="grid grid-cols-[28px_1fr_1fr] gap-1 px-2 py-1 mb-1">
              <span className="text-[10px] font-medium" style={{ color: 'rgba(201,168,76,0.4)' }}>#</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(240,220,180,0.8)', border: '1px solid rgba(160,130,80,0.5)', display: 'inline-block' }} />
                <span className="text-[10px] font-medium" style={{ color: 'rgba(220,210,185,0.4)' }}>White</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(30,20,10,0.9)', border: '1px solid rgba(201,168,76,0.3)', display: 'inline-block' }} />
                <span className="text-[10px] font-medium" style={{ color: 'rgba(220,210,185,0.4)' }}>Black</span>
              </div>
            </div>
            {grouped.map(({ num, white, black }) => (
              <div key={num} className="move-row grid grid-cols-[28px_1fr_1fr] gap-1">
                <span className="text-[11px] font-mono" style={{ color: 'rgba(201,168,76,0.4)' }}>{num}.</span>
                <span className="text-[12px] font-mono font-semibold" style={{ color: '#e8e0d0' }}>{white}</span>
                <span className="text-[12px] font-mono font-semibold" style={{ color: black ? '#e8e0d0' : 'transparent' }}>{black || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;