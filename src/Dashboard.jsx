import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Plus, LogOut, Home, BarChart3, Circle, TrendingUp, Target, Trophy, Zap } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import socket from "./socket/SocketConnection.jsx";
import { getSession, setSession, clearGameSession } from './utils/session.js';
const ChessDashboard = () => {
  clearGameSession()


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
      if (!userId) {
        setError('Please log in to view game statistics');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_SERVER_URL;


        const response = await axios.get(`${API_URL}/api/games/history/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const { totalGames, won, lost, draw, noResult } = response.data;

        const moveResponse = await axios.get(`${API_URL}/api/games/moveshistory/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const { totalMoves, brilliant, best, good, inaccurate, mistake, blunder } = moveResponse.data;

        const stats = [
          { name: 'Won', value: won, color: '#10B981' },
          { name: 'Lost', value: lost, color: '#EF4444' },
          { name: 'Draw', value: draw, color: '#F59E0B' },
          { name: 'No Result', value: noResult, color: '#9CA3AF' },
        ];

        const moveData = [
          { name: 'Brilliant', value: brilliant.count, color: '#06B6D4', percentage: brilliant.percentage },
          { name: 'Best', value: best.count, color: '#10B981', percentage: best.percentage },
          { name: 'Good', value: good.count, color: '#84CC16', percentage: good.percentage },
          { name: 'Inaccurate', value: inaccurate.count, color: '#F59E0B', percentage: inaccurate.percentage },
          { name: 'Mistake', value: mistake.count, color: '#F97316', percentage: mistake.percentage },
          { name: 'Blunder', value: blunder.count, color: '#EF4444', percentage: blunder.percentage },
        ];

        setGameStats(stats);
        setTotalGames(totalGames);
        setMoveStats(moveData);
        setTotalMoves(totalMoves);
        setLoading(false);
      } catch (err) {
        const message = err.response?.status === 401
          ? 'Invalid or unauthorized user. Please log in again.'
          : 'Failed to fetch data. Please try again later.';
        setError(message);
        setLoading(false);
        console.error(err);
      }
    };

    fetchGameHistory();
  }, [userId, token]);

  function generateRoomId() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // const handleJoinRoom = () => {
  //   if (roomId.trim()) {
  //     const rId = roomId;
  //     const c = commentaryMode;
  //     const g = mode;
  //     alert(`Joining room: ${rId} with commentary ${commentaryMode ? 'enabled' : 'disabled'}`);
  //     setCurrentView('dashboard');
  //     setRoomId('');
  //     setCommentaryMode("off");
  //     setMode("manual");
  //     socket.emit("joinRoom", { userId, roomId: rId, color: undefined });

  //     socket.once("assignedColor", (color) => {
  //       navigate("/game", {
  //         state: {
  //           color: color,
  //           roomId: rId,
  //           userId: userId,
  //           commentary: c,
  //           mode: g
  //         }
  //       });
  //     });
  //   } else {
  //     alert('Please enter a valid Room ID');
  //   }
  // };

  const handleJoinRoom = () => {
    // 1. Validate that a Room ID was entered
    if (roomId.trim()) {

      // 2. Prepare the data to be passed to the game page
      const gameData = {
        roomId: roomId,
        userId: userId,
        commentary: commentaryMode,
        mode: mode,
        color: undefined,
      };

      navigate("/game", { state: gameData });

    } else {
      alert('Please enter a valid Room ID');
    }
  };
  const handleCreateRoom = () => {
    // const rId = generatedRoomId;
    // const color = selectedPiece;
    // const c = commentaryMode;
    // const g = mode;
    const roomData = {
      roomId: generatedRoomId,
      color: selectedPiece,
      userId: userId,
      commentary: commentaryMode,
      mode: mode,
    };
    setCurrentView('dashboard');
    setSelectedPiece('white');
    setCommentaryMode("off");
    setGeneratedRoomId(generateRoomId());
    setMode("manual");

    // socket.emit("joinRoom", { userId, roomId: rId, color });

    // socket.once("assignedColor", (color) => {
    //   navigate("/game", {
    //     state: {
    //       color: color,
    //       roomId: rId,
    //       userId: userId,
    //       commentary: c,
    //       mode: g
    //     }
    //   });
    // });

    navigate("/game", { state: roomData });
  };

  const renderNavbar = () => (
    <nav className="glass border-b border-white/20 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-glow-sm">
              <span className="text-white font-bold text-lg sm:text-xl">♔</span>
            </div>
            <span className="text-xl sm:text-2xl font-display font-bold gradient-text">ChessConnect</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 ${currentView === 'dashboard'
                ? 'bg-primary-100 text-primary-700 shadow-inner'
                : 'text-gray-700 hover:bg-white/50'
                }`}
            >
              <Home size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('create')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 ${currentView === 'create'
                ? 'bg-primary-100 text-primary-700 shadow-inner'
                : 'text-gray-700 hover:bg-white/50'
                }`}
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Create</span>
            </button>

            <button
              onClick={() => setCurrentView('join')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 ${currentView === 'join'
                ? 'bg-primary-100 text-primary-700 shadow-inner'
                : 'text-gray-700 hover:bg-white/50'
                }`}
            >
              <Users size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Join</span>
            </button>

            <button
              onClick={handlePlayClick}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-50 to-red-50">
          <div className="text-center text-gray-600 text-lg">Loading statistics...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-50 to-red-50">
          <div className="text-center text-red-600 text-lg">{error}</div>
        </div>
      );
    }

    const winRate = totalGames > 0 ? ((gameStats.find(stat => stat.name === 'Won')?.value || 0) / totalGames * 100).toFixed(1) : 0;
    const bestMoves = moveStats.slice(0, 3).reduce((sum, stat) => sum + stat.value, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="card-glass border-l-4 border-primary-500 hover:shadow-glow-md transition-all duration-300 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Games</p>
                  <p className="text-3xl font-display font-bold gradient-text-purple">{totalGames}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                  <Trophy className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="card-glass border-l-4 border-success-500 hover:shadow-glow-md transition-all duration-300 animate-fade-in-up animation-delay-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Win Rate</p>
                  <p className="text-3xl font-display font-bold bg-gradient-to-r from-success-600 to-success-400 bg-clip-text text-transparent">{winRate}%</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-success-100 to-success-200 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </div>

            <div className="card-glass border-l-4 border-info-500 hover:shadow-glow-md transition-all duration-300 animate-fade-in-up animation-delay-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Moves</p>
                  <p className="text-3xl font-display font-bold bg-gradient-to-r from-info-600 to-info-400 bg-clip-text text-transparent">{totalMoves}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-info-100 to-info-200 rounded-xl">
                  <Target className="h-6 w-6 text-info-600" />
                </div>
              </div>
            </div>

            <div className="card-glass border-l-4 border-accent-500 hover:shadow-glow-md transition-all duration-300 animate-fade-in-up animation-delay-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Best Moves</p>
                  <p className="text-3xl font-display font-bold gradient-text-orange">{bestMoves}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl">
                  <Zap className="h-6 w-6 text-accent-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Game Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Game Results</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setGameChartType('pie')}
                    className={`p-2 rounded-lg ${gameChartType === 'pie'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                      }`}
                  >
                    <Circle size={20} />
                  </button>
                  <button
                    onClick={() => setGameChartType('bar')}
                    className={`p-2 rounded-lg ${gameChartType === 'bar'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                      }`}
                  >
                    <BarChart3 size={20} />
                  </button>
                </div>
              </div>

              <div className="h-80">
                {totalGames === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-600 text-lg">
                    Sorry, you have not played any games yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {gameChartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={gameStats.filter(stat => stat.value > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          labelLine={true}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {gameStats.filter(stat => stat.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <BarChart data={gameStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {gameStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Move Quality */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Move Quality</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setMoveChartType('pie')}
                    className={`p-2 rounded-lg ${moveChartType === 'pie'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                      }`}
                  >
                    <Circle size={20} />
                  </button>
                  <button
                    onClick={() => setMoveChartType('bar')}
                    className={`p-2 rounded-lg ${moveChartType === 'bar'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                      }`}
                  >
                    <BarChart3 size={20} />
                  </button>
                </div>
              </div>

              <div className="h-80">
                {totalMoves === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-600 text-lg">
                    Sorry, you have not made any moves yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {moveChartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={moveStats.filter(stat => stat.value > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          labelLine={true}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {moveStats.filter(stat => stat.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]} />
                      </PieChart>
                    ) : (
                      <BarChart data={moveStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {moveStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Stats Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Game Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Game Breakdown</h3>
              <div className="space-y-3">
                {gameStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stat.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{stat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({totalGames > 0 ? ((stat.value / totalGames) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Move Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Move Analysis</h3>
              <div className="space-y-3">
                {moveStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stat.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{stat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({stat.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderJoinRoom = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="glass-card w-full max-w-md shadow-glass-lg animate-scale-in">
        <h2 className="text-2xl sm:text-3xl font-display font-bold gradient-text mb-6 text-center">Join a Room</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID..."
              className="input-modern"
            />
          </div>

          <div>
            <label htmlFor="commentary-mode" className="block text-sm font-semibold text-gray-700 mb-2">
              Commentary Mode
            </label>
            <select
              id="commentary-mode"
              value={commentaryMode}
              onChange={(e) => setCommentaryMode(e.target.value)}
              className="input-modern"
            >
              <option value="off">Off</option>
              <option value="roast">Roast</option>
              <option value="beginner">Beginner's</option>
              <option value="hype">Hype</option>
            </select>
          </div>

          <div>
            <label htmlFor="game-mode" className="block text-sm font-semibold text-gray-700 mb-2">
              Game Mode
            </label>
            <select
              id="game-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="input-modern"
            >
              <option value="manual">Manual</option>
              <option value="voice">Voice</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleJoinRoom}
              className="btn-primary flex-1"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreateRoom = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="glass-card w-full max-w-md shadow-glass-lg animate-scale-in">
        <h2 className="text-2xl sm:text-3xl font-display font-bold gradient-text mb-6 text-center">Create a Room</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Room ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedRoomId}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-mono"
              />
              <button
                onClick={() => setGeneratedRoomId(generateRoomId())}
                className="px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all duration-300 font-semibold shadow-glow-sm"
              >
                New
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Your Piece</label>
            <div className="space-y-2">
              {['white', 'black', 'random'].map((piece) => (
                <label key={piece} className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-white/50 transition-all duration-200">
                  <input
                    type="radio"
                    name="piece"
                    value={piece}
                    checked={selectedPiece === piece}
                    onChange={(e) => setSelectedPiece(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                  />
                  <span className="text-gray-700 font-medium capitalize flex items-center gap-2">
                    {piece} {piece === 'white' ? '♔' : piece === 'black' ? '♚' : '🎲'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="commentary-mode-create" className="block text-sm font-semibold text-gray-700 mb-2">
              Commentary Mode
            </label>
            <select
              id="commentary-mode-create"
              value={commentaryMode}
              onChange={(e) => setCommentaryMode(e.target.value)}
              className="input-modern"
            >
              <option value="off">Off</option>
              <option value="roast">Roast</option>
              <option value="beginner">Beginner's</option>
              <option value="hype">Hype</option>
            </select>
          </div>

          <div>
            <label htmlFor="game-mode-create" className="block text-sm font-semibold text-gray-700 mb-2">
              Game Mode
            </label>
            <select
              id="game-mode-create"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="input-modern"
            >
              <option value="manual">Manual</option>
              <option value="voice">Voice</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRoom}
              className="btn-primary flex-1"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {renderNavbar()}
      <div className="flex-1">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'join' && renderJoinRoom()}
        {currentView === 'create' && renderCreateRoom()}
      </div>
    </div>
  );
};

export default ChessDashboard;
