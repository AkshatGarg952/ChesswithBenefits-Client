import { useEffect, useState } from 'react';
import { RotateCcw, MessageCircle, X, Crown } from 'lucide-react';
import PlayerCard from './PlayerCard';
import MoveHistory from './MoveHistory';
import Chat from './Chat';
import ChessBoard from './ChessBoard';
import MobilePanel from './MobilePanel';
import { socket } from "../socket/SocketConnection.js";
import chatStorage from "../storage/ChatStorage.js";
import { Chess } from "chess.js";
import { toast } from 'react-toastify';
import { getSession, setSession, clearGameSession } from '../utils/session.js';

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const h = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return size;
};

const ChessGame = ({ color, roomId, userId, commentary, mode }) => {
  const { width: screenWidth, height: screenHeight } = useWindowSize();
  const isMobile = screenWidth < 640;
  const isTablet = screenWidth >= 640 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;
  const isLandscape = screenWidth > screenHeight;

  const effectiveUserId    = userId    || getSession("userId");
  const effectiveRoomId    = roomId    || getSession("roomId");
  const effectiveColor     = color     || getSession("color");
  const effectiveCommentary = commentary || getSession("commentary");
  const effectiveMode      = mode      || getSession("mode");

  useEffect(() => {
    if (userId)     setSession("userId", userId);
    if (roomId)     setSession("roomId", roomId);
    if (color)      setSession("color", color);
    if (commentary) setSession("commentary", commentary);
    if (mode)       setSession("mode", mode);
  }, [userId, roomId, color, commentary, mode]);

  const [playerColor, setPlayerColor]   = useState(effectiveColor);
  const [currentPlayer, setCurrentPlayer] = useState(getSession("currentPlayer") || 'white');
  const [showMoveHistory, setShowMoveHistory] = useState(false);
  const [showChat, setShowChat]         = useState(false);
  const [moves, setMoves]               = useState(getSession("moves") || []);
  const [gameState, setGameState]       = useState(() => {
    const fen = getSession("fen");
    try { return fen ? new Chess(fen) : new Chess(); } catch { return new Chess(); }
  });
  const [gameId, setgameId]             = useState(getSession("gameId") || null);
  const [status, setStatus]             = useState(null);
  const [opponentSocketId, setOpponentSocketId] = useState(null);
  const [drawOfferVisible, setDrawOfferVisible] = useState(false);
  const [gameStarted, setGameStarted]   = useState(() => getSession("gameStarted") === "true");
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [messages, setMessages]         = useState(() => chatStorage.get(effectiveRoomId, effectiveUserId));
  const [gameOverData, setGameOverData] = useState(null);
  const [whiteTimeLeft, setWhiteTimeLeft] = useState(600);
  const [blackTimeLeft, setBlackTimeLeft] = useState(600);

  const isBlack = playerColor === 'black';
  const [player1, setPlayer1] = useState({ name: "Opponent", initialTime: isBlack ? blackTimeLeft : whiteTimeLeft, isActive: currentPlayer !== playerColor });
  const [player2, setPlayer2] = useState({ name: "You",      initialTime: isBlack ? whiteTimeLeft : blackTimeLeft, isActive: currentPlayer === playerColor });

  function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.pitch = 1.1; u.rate = 1;
    window.speechSynthesis.speak(u);
  }

  useEffect(() => {
    const h = (data) => { setGameOverData(data); setStatus(data.status); };
    socket.on("gameOver", h);
    return () => socket.off("gameOver", h);
  }, []);

  useEffect(() => {
    if (effectiveUserId && effectiveRoomId) {
      socket.emit("joinRoom", { userId: effectiveUserId, roomId: effectiveRoomId, color: effectiveColor });
      const h = c => setPlayerColor(c);
      socket.on("assignedColor", h);
      return () => socket.off("assignedColor", h);
    }
  }, [effectiveUserId, effectiveRoomId, effectiveColor]);

  useEffect(() => {
    const h = () => { toast.error("Your opponent has disconnected."); setOpponentSocketId(null); setGameStarted(false); };
    socket.on("opponent-disconnected", h);
    return () => socket.off("opponent-disconnected", h);
  }, []);

  useEffect(() => {
    const handleBoth = async ({ gameId, fen, moves, opponentSocketId, whiteTimeLeft, blackTimeLeft }) => {
      setWhiteTimeLeft(whiteTimeLeft); setBlackTimeLeft(blackTimeLeft);
      if (playerColor === 'white') {
        setPlayer2(p => ({ ...p, initialTime: whiteTimeLeft }));
        setPlayer1(p => ({ ...p, initialTime: blackTimeLeft }));
      } else {
        setPlayer2(p => ({ ...p, initialTime: blackTimeLeft }));
        setPlayer1(p => ({ ...p, initialTime: whiteTimeLeft }));
      }
      setOpponentSocketId(opponentSocketId);
      const { Chess: C } = await import("chess.js");
      const chess = new C(fen);
      setGameState(chess); setMoves(moves || []);
      const next = chess.turn() === 'w' ? 'white' : 'black';
      setCurrentPlayer(next);
      setSession("gameId", gameId); setSession("fen", fen); setSession("moves", moves || []);
      setSession("currentPlayer", next); setSession("gameStarted", "true");
      setgameId(gameId); setGameStarted(true);
    };
    socket.on("bothPlayersJoined", handleBoth);
    socket.on("Opponent Draw", () => setDrawOfferVisible(true));
    socket.on("Opponent Resign", () => setStatus("win"));
    socket.on("DrawAccepted", () => setStatus("draw"));
    socket.on("DrawDeclined", () => toast.info("Opponent rejected your draw offer"));
    return () => {
      socket.off("bothPlayersJoined", handleBoth);
      socket.off("Opponent Draw"); socket.off("Opponent Resign");
      socket.off("DrawAccepted"); socket.off("DrawDeclined");
    };
  }, [playerColor]);

  useEffect(() => {
    const h = (sm) => {
      const msg = { id: Date.now(), message: sm.message, isSent: false, time: new Date(sm.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      handleSendMessage(msg);
    };
    socket.on("ReceiveMessage", h);
    return () => socket.off("ReceiveMessage", h);
  }, [effectiveRoomId, effectiveUserId]);

  useEffect(() => {
    const handleMove = async ({ move, fen, gameStatus, winner, allMoves, whiteTimeLeft: sw, blackTimeLeft: sb }) => {
      const { Chess: C } = await import("chess.js");
      const chess = new C(fen);
      setGameState(chess); setSession("fen", chess.fen());
      setMoves(allMoves); setSession("moves", allMoves);
      if (sw !== undefined && sb !== undefined) {
        setWhiteTimeLeft(sw); setBlackTimeLeft(sb);
        if (playerColor === 'white') { setPlayer1(p => ({ ...p, initialTime: sb })); setPlayer2(p => ({ ...p, initialTime: sw })); }
        else { setPlayer1(p => ({ ...p, initialTime: sw })); setPlayer2(p => ({ ...p, initialTime: sb })); }
      }
      const next = chess.turn() === 'w' ? 'white' : 'black';
      setCurrentPlayer(next); setSession("currentPlayer", next);
      if (gameStatus === "drawn" || gameStatus === "finished") setStatus(winner ? (winner === effectiveUserId ? "win" : "lose") : "draw");
      if (effectiveCommentary === "hype") {
        const prompt = { move: move.san, fen, lastMoves: allMoves.map(m => m.san || m), isUserMove: false, mode: effectiveCommentary };
        try {
          const r = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/commentary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
          const d = await r.json();
          if (d.commentary) speak(d.commentary);
        } catch {}
      }
    };
    socket.on("receiveMove", handleMove);
    socket.on("moveRejected", (d) => { console.error("Move rejected:", d); toast.error(`Move rejected. Resyncing...`); window.location.reload(); });
    return () => { socket.off("receiveMove", handleMove); socket.off("moveRejected"); };
  }, [effectiveCommentary, moves, effectiveUserId]);

  const handleMove = async (move, updatedGame) => {
    const gId = getSession("gameId") || gameId;
    socket.emit("SendMove", { move, gameId: gId, userId: effectiveUserId, roomId: effectiveRoomId });
    const newMoves = [...moves, move.san];
    setSession("moves", newMoves); setMoves(newMoves);
    setGameState(updatedGame); setSession("fen", updatedGame.fen());
    const next = updatedGame.turn() === 'w' ? 'white' : 'black';
    setCurrentPlayer(next); setSession("currentPlayer", next);
    if (effectiveCommentary !== "off") {
      const prompt = { move: move.san, fen: updatedGame.fen(), lastMoves: newMoves, isUserMove: true, mode: effectiveCommentary };
      try {
        const r = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/commentary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
        const d = await r.json();
        if (d.commentary) speak(d.commentary);
      } catch {}
    }
  };

  const handleSendMessage = (msg) => {
    chatStorage.add(effectiveRoomId, effectiveUserId, msg);
    setMessages(prev => [...prev, msg]);
  };

  const handleDraw = () => {
    if (!effectiveRoomId) { toast.error("Error: Room ID invalid."); return; }
    socket.emit("Draw", { roomId: effectiveRoomId });
    toast.info("Draw offer sent!");
  };

  const handleResign = () => {
    const gId = getSession("gameId") || gameId;
    if (!effectiveRoomId || !gId || !effectiveUserId) { toast.error("Missing game data."); return; }
    setStatus("lose");
    socket.emit("Resign", { roomId: effectiveRoomId, gameId: gId, userId: effectiveUserId });
  };

  const acceptDraw  = () => { const gId = getSession("gameId") || gameId; socket.emit("DrawAccepted", { roomId: effectiveRoomId, gameId: gId }); setDrawOfferVisible(false); setStatus("draw"); };
  const declineDraw = () => { socket.emit("DrawDeclined", { roomId: effectiveRoomId }); setDrawOfferVisible(false); };

  const ModalOverlay = ({ children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-sm mx-4 animate-scale-in" style={{ background: 'linear-gradient(145deg, rgba(18,15,28,0.99), rgba(12,10,20,1))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>

      {/* ── DESKTOP LAYOUT (≥1024px) ─────────────────────────────────── */}
      {isDesktop && (
        <div className="flex items-start gap-4 max-w-[1400px] mx-auto p-4">
          {/* Left sidebar */}
          <div className="flex flex-col gap-4" style={{ width: '240px', flexShrink: 0 }}>
            <PlayerCard key="opp" playerName={player1.name} initialTime={player1.initialTime} isActive={player1.isActive} isCurrentUser={false} color={playerColor === 'white' ? 'black' : 'white'} opponentSocketId={opponentSocketId} />
            <MoveHistory moves={moves} className="flex-1" style={{ minHeight: 0 }} />
          </div>
          {/* Board — takes remaining space */}
          <div className="flex-1 min-w-0">
            <ChessBoard key={`board-${gameId || 'new'}`} color={playerColor} onMove={handleMove} gameState={gameState} status={status} gameStarted={gameStarted} currentPlayer={currentPlayer} mode={effectiveMode} handleDraw={handleDraw} handleResign={handleResign} />
          </div>
          {/* Right sidebar */}
          <div className="flex flex-col gap-4" style={{ width: '240px', flexShrink: 0 }}>
            <PlayerCard key={`me-${effectiveUserId}`} playerName={player2.name} initialTime={player2.initialTime} isActive={player2.isActive} isCurrentUser={true} color={playerColor} opponentSocketId={opponentSocketId} />
            <Chat className="flex-1" messages={messages} onSendMessage={handleSendMessage} roomId={effectiveRoomId} />
          </div>
        </div>
      )}

      {/* ── TABLET LAYOUT (640px – 1023px) ──────────────────────────── */}
      {isTablet && (
        <div className="flex flex-col gap-3 max-w-[900px] mx-auto p-3">
          {/* Player cards row */}
          <div className="grid grid-cols-2 gap-3">
            <PlayerCard key="tab-opp" playerName={player1.name} initialTime={player1.initialTime} isActive={player1.isActive} isCurrentUser={false} color={playerColor === 'white' ? 'black' : 'white'} opponentSocketId={opponentSocketId} />
            <PlayerCard key={`tab-me-${effectiveUserId}`} playerName={player2.name} initialTime={player2.initialTime} isActive={player2.isActive} isCurrentUser={true} color={playerColor} opponentSocketId={opponentSocketId} />
          </div>
          {/* Board + sidebar row */}
          <div className="flex gap-3 items-start">
            {/* Board — takes ~60% width */}
            <div style={{ flex: '0 0 58%', minWidth: 0 }}>
              <ChessBoard key={`tab-board-${gameId || 'new'}`} color={playerColor} onMove={handleMove} gameState={gameState} status={status} gameStarted={gameStarted} currentPlayer={currentPlayer} mode={effectiveMode} handleDraw={handleDraw} handleResign={handleResign} />
            </div>
            {/* Sidebar — move history + chat */}
            <div className="flex flex-col gap-3" style={{ flex: '1 1 0%', minWidth: 0 }}>
              <MoveHistory moves={moves} className="h-56" />
              <Chat className="h-56" messages={messages} onSendMessage={handleSendMessage} roomId={effectiveRoomId} />
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE LAYOUT (<640px) ───────────────────────────────────── */}
      {isMobile && (
        <div className="w-full mx-auto" style={{ paddingBottom: isLandscape ? '0.5rem' : '5rem' }}>
          {/* Player cards - compact row */}
          <div className="grid grid-cols-2 gap-2 px-2 pt-2 pb-1">
            <PlayerCard key="mob-opp" playerName={player1.name} initialTime={player1.initialTime} isActive={player1.isActive} isCurrentUser={false} color={playerColor === 'white' ? 'black' : 'white'} opponentSocketId={opponentSocketId} compact />
            <PlayerCard key={`mob-me-${effectiveUserId}`} playerName={player2.name} initialTime={player2.initialTime} isActive={player2.isActive} color={playerColor} isCurrentUser={true} opponentSocketId={opponentSocketId} compact />
          </div>
          {/* Chess board — fills screen width with aspect ratio padding */}
          <div className="px-2">
            <ChessBoard key={`mob-board-${gameId || 'new'}`} color={playerColor} onMove={handleMove} gameState={gameState} status={status} mode={effectiveMode} handleDraw={handleDraw} handleResign={handleResign} gameStarted={gameStarted} currentPlayer={currentPlayer} />
          </div>
          {/* FABs — fixed, above safe area */}
          <div className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-safe"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))', background: 'linear-gradient(to top, rgba(10,10,15,0.95) 0%, transparent 100%)', pointerEvents: 'none' }}>
            <div className="flex justify-between items-center py-2" style={{ pointerEvents: 'auto' }}>
              <button onClick={() => setShowMoveHistory(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #8b6914)', boxShadow: '0 8px 25px rgba(201,168,76,0.4)' }}>
                <RotateCcw className="w-4 h-4 text-[#0a0a0f]" />
                <span className="text-xs font-bold text-[#0a0a0f]">Moves</span>
              </button>
              <button onClick={() => setShowChat(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #8b6914)', boxShadow: '0 8px 25px rgba(201,168,76,0.4)' }}>
                <MessageCircle className="w-4 h-4 text-[#0a0a0f]" />
                <span className="text-xs font-bold text-[#0a0a0f]">Chat</span>
              </button>
            </div>
          </div>
          <MobilePanel isOpen={showMoveHistory} onClose={() => setShowMoveHistory(false)} title="Move History">
            <div className="p-4 overflow-y-auto" style={{ maxHeight: isLandscape ? '50vh' : '65vh' }}><MoveHistory moves={moves} /></div>
          </MobilePanel>
          <MobilePanel isOpen={showChat} onClose={() => setShowChat(false)} title="Chat">
            <Chat className="h-full border-0 shadow-none rounded-none overflow-y-auto" style={{ maxHeight: isLandscape ? '50vh' : '65vh' }} messages={messages} onSendMessage={handleSendMessage} roomId={effectiveRoomId} />
          </MobilePanel>
        </div>
      )}

      {/* Draw offer modal */}
      {drawOfferVisible && (
        <ModalOverlay>
          <div className="text-center">
            <div className="text-4xl mb-3">🤝</div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Draw Offered</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(220,210,185,0.55)' }}>Your opponent is offering a draw. Do you accept?</p>
            <div className="flex gap-3">
              <button onClick={declineDraw} className="btn-dark flex-1">Decline</button>
              <button onClick={acceptDraw} className="btn-gold flex-1">Accept</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Back warning modal */}
      {showBackWarning && (
        <ModalOverlay>
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Cinzel, serif' }}>Leave the Game?</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(220,210,185,0.55)' }}>Please finish the game before going to dashboard.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowBackWarning(false)} className="btn-dark flex-1">Stay</button>
              <button onClick={() => {
                setStatus("lose");
                const gId = getSession("gameId") || gameId;
                socket.emit("Resign", { roomId: effectiveRoomId, gameId: gId, userId: effectiveUserId });
                setShowBackWarning(false);
              }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
                Resign & Leave
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default ChessGame;
