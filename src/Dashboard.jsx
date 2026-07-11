import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Plus, LogOut, Home, BarChart3, Circle, TrendingUp, Target, Trophy, Zap, Crown, RefreshCw, Swords, ChevronRight, Shuffle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { socket } from "./socket/SocketConnection.js";
import { clearGameSession } from './utils/session.js';

const ChessDashboard = () => {
  clearGameSession();

  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const userId = sessionStorage.getItem('user');
  const [currentView, setCurrentView] = useState('dashboard');
  const [gameChartType, setGameChartType] = useState('pie');
  const [moveChartType, setMoveChartType] = useState('pie');
  const [roomId, setRoomId] = useState('');
  const [selectedPiece, setSelectedPiece] = useState('white');
  const [commentaryMode, setCommentaryMode] = useState("off");
  const [gameStats, setGameStats] = useState([]);
  const [moveStats, setMoveStats] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatedRoomId, setGeneratedRoomId] = useState(generateRoomId());
  const [mode, setMode] = useState("manual");

  const handlePlayClick = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate('/');
  };

  useEffect(() => {
    const fetchGameHistory = async () => {
      if (!userId) { setError('Please log in to view game statistics'); setLoading(false); return; }
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_SERVER_URL;
        const response = await axios.get(`${API_URL}/api/games/history/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        const { totalGames, won, lost, draw, noResult } = response.data;
        const moveResponse = await axios.get(`${API_URL}/api/games/moveshistory/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        const { totalMoves, brilliant, best, good, inaccurate, mistake, blunder } = moveResponse.data;

        setGameStats([
          { name: 'Won',       value: won,            color: '#4ade80' },
          { name: 'Lost',      value: lost,           color: '#f87171' },
          { name: 'Draw',      value: draw,           color: '#c9a84c' },
          { name: 'No Result', value: noResult,       color: '#6b7280' },
        ]);
        setMoveStats([
          { name: 'Brilliant',  value: brilliant.count,  color: '#06b6d4', percentage: brilliant.percentage },
          { name: 'Best',       value: best.count,       color: '#4ade80', percentage: best.percentage },
          { name: 'Good',       value: good.count,       color: '#a3e635', percentage: good.percentage },
          { name: 'Inaccurate', value: inaccurate.count, color: '#c9a84c', percentage: inaccurate.percentage },
          { name: 'Mistake',    value: mistake.count,    color: '#fb923c', percentage: mistake.percentage },
          { name: 'Blunder',    value: blunder.count,    color: '#f87171', percentage: blunder.percentage },
        ]);
        setTotalGames(totalGames);
        setTotalMoves(totalMoves);
        setLoading(false);
      } catch (err) {
        setError(err.response?.status === 401 ? 'Invalid or unauthorized user.' : 'Failed to fetch data.');
        setLoading(false);
      }
    };
    fetchGameHistory();
  }, [userId, token]);

  function generateRoomId() { return Math.random().toString(36).substr(2, 8).toUpperCase(); }

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      navigate("/game", { state: { roomId, userId, commentary: commentaryMode, mode, color: undefined } });
    } else {
      alert('Please enter a valid Room ID');
    }
  };

  const handleCreateRoom = () => {
    const roomData = { roomId: generatedRoomId, color: selectedPiece, userId, commentary: commentaryMode, mode };
    setCurrentView('dashboard');
    setSelectedPiece('white');
    setCommentaryMode("off");
    setGeneratedRoomId(generateRoomId());
    setMode("manual");
    navigate("/game", { state: roomData });
  };

  // ─── NAVBAR ───
  const renderNavbar = () => (
    <nav style={{
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(201,168,76,0.15)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #8b6914)', boxShadow: '0 0 15px rgba(201,168,76,0.35)' }}>
              <Crown className="h-5 w-5 text-[#0a0a0f]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', background: 'linear-gradient(135deg, #f5e6c3, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Chess with Benefits
            </span>
          </div>

          {/* Nav items */}
          <div className="flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', Icon: Home },
              { id: 'create',    label: 'Create',    Icon: Plus },
              { id: 'join',      label: 'Join',      Icon: Users },
            ].map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setCurrentView(id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px]"
                style={{
                  background: currentView === id ? 'rgba(201,168,76,0.15)' : 'transparent',
                  color: currentView === id ? '#c9a84c' : 'rgba(220,210,185,0.6)',
                  border: currentView === id ? '1px solid rgba(201,168,76,0.25)' : '1px solid transparent',
                }}>
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}

            <button onClick={handlePlayClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ml-2"
              style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  // ─── DASHBOARD ───
  const renderDashboard = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">♔</div>
          <p className="text-[rgba(220,210,185,0.5)] text-sm tracking-wider uppercase">Loading statistics...</p>
        </div>
      </div>
    );

    if (error) return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center px-4 py-8 rounded-2xl" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );

    const winRate = totalGames > 0 ? ((gameStats.find(s => s.name === 'Won')?.value || 0) / totalGames * 100).toFixed(1) : 0;
    const bestMoves = moveStats.slice(0, 3).reduce((sum, s) => sum + s.value, 0);

    const statCards = [
      { label: 'Total Games', value: totalGames, Icon: Trophy,    color: '#c9a84c', bg: 'rgba(201,168,76,0.1)' },
      { label: 'Win Rate',    value: `${winRate}%`, Icon: TrendingUp, color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
      { label: 'Total Moves', value: totalMoves, Icon: Target,    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
      { label: 'Best Moves',  value: bestMoves,  Icon: Zap,       color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
    ];

    const tooltipStyle = {
      contentStyle: { background: 'rgba(15,13,24,0.97)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '0.75rem', color: '#e8e0d0' },
      labelStyle: { color: '#c9a84c', fontWeight: 600 },
    };

    return (
      <div className="min-h-screen p-4 sm:p-6" style={{ background: '#0a0a0f' }}>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Welcome */}
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>Your Dashboard</h2>
            <p className="text-[rgba(220,210,185,0.5)] text-sm mt-1">Track your performance and start new games</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {statCards.map(({ label, value, Icon, color, bg }, i) => (
              <div key={label} className="stat-card" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium tracking-wider uppercase mb-2" style={{ color: 'rgba(220,210,185,0.5)' }}>{label}</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color }}>{value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon style={{ width: '18px', height: '18px', color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Results */}
            <div className="card-dark p-5" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Game Results</h3>
                <div className="flex gap-1.5">
                  {[{ type: 'pie', Icon: Circle }, { type: 'bar', Icon: BarChart3 }].map(({ type, Icon }) => (
                    <button key={type} onClick={() => setGameChartType(type)}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        background: gameChartType === type ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.04)',
                        color: gameChartType === type ? '#c9a84c' : 'rgba(220,210,185,0.5)',
                        border: `1px solid ${gameChartType === type ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: '280px' }}>
                {totalGames === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Trophy className="w-10 h-10" style={{ color: 'rgba(201,168,76,0.2)' }} />
                    <p className="text-sm" style={{ color: 'rgba(220,210,185,0.4)' }}>No games played yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {gameChartType === 'pie' ? (
                      <PieChart>
                        <Pie data={gameStats.filter(s => s.value > 0)} cx="50%" cy="50%" outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine fill="#8884d8" dataKey="value">
                          {gameStats.filter(s => s.value > 0).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                      </PieChart>
                    ) : (
                      <BarChart data={gameStats} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" />
                        <XAxis dataKey="name" angle={-30} textAnchor="end" height={50} fontSize={11} tick={{ fill: 'rgba(220,210,185,0.6)' }} />
                        <YAxis fontSize={11} tick={{ fill: 'rgba(220,210,185,0.6)' }} />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {gameStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Move Quality */}
            <div className="card-dark p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Move Quality</h3>
                <div className="flex gap-1.5">
                  {[{ type: 'pie', Icon: Circle }, { type: 'bar', Icon: BarChart3 }].map(({ type, Icon }) => (
                    <button key={type} onClick={() => setMoveChartType(type)}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        background: moveChartType === type ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.04)',
                        color: moveChartType === type ? '#c9a84c' : 'rgba(220,210,185,0.5)',
                        border: `1px solid ${moveChartType === type ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: '280px' }}>
                {totalMoves === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Zap className="w-10 h-10" style={{ color: 'rgba(201,168,76,0.2)' }} />
                    <p className="text-sm" style={{ color: 'rgba(220,210,185,0.4)' }}>No moves recorded yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {moveChartType === 'pie' ? (
                      <PieChart>
                        <Pie data={moveStats.filter(s => s.value > 0)} cx="50%" cy="50%" outerRadius={100}
                          label={({ name, percentage }) => `${name} ${percentage}%`} labelLine dataKey="value">
                          {moveStats.filter(s => s.value > 0).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip {...tooltipStyle} formatter={(v, n, p) => [`${v} (${p.payload.percentage}%)`, n]} />
                      </PieChart>
                    ) : (
                      <BarChart data={moveStats} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" />
                        <XAxis dataKey="name" angle={-30} textAnchor="end" height={50} fontSize={11} tick={{ fill: 'rgba(220,210,185,0.6)' }} />
                        <YAxis fontSize={11} tick={{ fill: 'rgba(220,210,185,0.6)' }} />
                        <Tooltip {...tooltipStyle} formatter={(v, n, p) => [`${v} (${p.payload.percentage}%)`, n]} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {moveStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { title: 'Game Breakdown', data: gameStats, total: totalGames, showPct: true },
              { title: 'Move Analysis',  data: moveStats, total: totalMoves, showPct: false },
            ].map(({ title, data, total, showPct }) => (
              <div key={title} className="card-dark p-5">
                <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
                <div className="space-y-2">
                  {data.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color, boxShadow: `0 0 6px ${stat.color}60` }} />
                        <span className="text-sm font-medium" style={{ color: 'rgba(220,210,185,0.8)' }}>{stat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-white">{stat.value}</span>
                        <span className="text-xs ml-2" style={{ color: 'rgba(220,210,185,0.45)' }}>
                          ({showPct
                            ? total > 0 ? ((stat.value / total) * 100).toFixed(1) : 0
                            : stat.percentage || 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  };

  // ─── SHARED FORM SECTIONS ───
  const LabeledField = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(220,210,185,0.65)' }}>{label}</label>
      {children}
    </div>
  );

  // ─── JOIN ROOM ───
  const renderJoinRoom = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4" style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-md animate-scale-in">
        <div className="card-dark p-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <Users className="h-5 w-5" style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>Join a Room</h2>
              <p className="text-xs" style={{ color: 'rgba(220,210,185,0.5)' }}>Enter room code to join a game</p>
            </div>
          </div>

          <div className="space-y-4">
            <LabeledField label="Room ID">
              <input type="text" value={roomId} onChange={e => setRoomId(e.target.value)}
                placeholder="Enter room code (e.g. ABCD1234)" className="input-dark" />
            </LabeledField>

            <LabeledField label="Commentary Mode">
              <select value={commentaryMode} onChange={e => setCommentaryMode(e.target.value)} className="select-dark">
                <option value="off">Off</option>
                <option value="roast">Roast</option>
                <option value="beginner">Beginner's</option>
                <option value="hype">Hype</option>
              </select>
            </LabeledField>

            <LabeledField label="Game Mode">
              <select value={mode} onChange={e => setMode(e.target.value)} className="select-dark">
                <option value="manual">Manual</option>
                <option value="voice">Voice</option>
              </select>
            </LabeledField>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setCurrentView('dashboard')} className="btn-dark flex-1">Cancel</button>
              <button onClick={handleJoinRoom} className="btn-gold flex-1 flex items-center justify-center gap-2">
                <Swords className="h-4 w-4" /> Join Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── CREATE ROOM ───
  const renderCreateRoom = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4" style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-md animate-scale-in">
        <div className="card-dark p-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <Plus className="h-5 w-5 text-[#c9a84c]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>Create a Room</h2>
              <p className="text-xs" style={{ color: 'rgba(220,210,185,0.5)' }}>Set up your game and invite a friend</p>
            </div>
          </div>

          <div className="space-y-4">
            <LabeledField label="Room Code">
              <div className="flex gap-2">
                <input type="text" value={generatedRoomId} readOnly
                  className="flex-1 input-dark font-mono tracking-widest text-[#c9a84c]" />
                <button onClick={() => setGeneratedRoomId(generateRoomId())}
                  className="px-3 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.12)'}>
                  <RefreshCw className="h-4 w-4" /> New
                </button>
              </div>
            </LabeledField>

            <LabeledField label="Choose Your Side">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'white',  label: 'White', icon: '♔' },
                  { val: 'black',  label: 'Black', icon: '♚' },
                  { val: 'random', label: 'Random', icon: '🎲' },
                ].map(({ val, label, icon }) => (
                  <button key={val} onClick={() => setSelectedPiece(val)}
                    className="py-3 rounded-xl flex flex-col items-center gap-1 text-sm font-medium transition-all"
                    style={{
                      background: selectedPiece === val ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedPiece === val ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: selectedPiece === val ? '#c9a84c' : 'rgba(220,210,185,0.6)',
                    }}>
                    <span className="text-xl">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </LabeledField>

            <LabeledField label="Commentary Mode">
              <select value={commentaryMode} onChange={e => setCommentaryMode(e.target.value)} className="select-dark">
                <option value="off">Off</option>
                <option value="roast">Roast</option>
                <option value="beginner">Beginner's</option>
                <option value="hype">Hype</option>
              </select>
            </LabeledField>

            <LabeledField label="Game Mode">
              <select value={mode} onChange={e => setMode(e.target.value)} className="select-dark">
                <option value="manual">Manual</option>
                <option value="voice">Voice</option>
              </select>
            </LabeledField>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setCurrentView('dashboard')} className="btn-dark flex-1">Cancel</button>
              <button onClick={handleCreateRoom} className="btn-gold flex-1 flex items-center justify-center gap-2">
                <ChevronRight className="h-4 w-4" /> Create Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      {renderNavbar()}
      <div className="flex-1 overflow-auto">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'join'      && renderJoinRoom()}
        {currentView === 'create'    && renderCreateRoom()}
      </div>
    </div>
  );
};

export default ChessDashboard;
