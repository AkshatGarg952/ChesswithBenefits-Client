import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Handshake, Flag, RotateCcw, LayoutDashboard } from 'lucide-react';

const ChessBoard = ({ className = "", color, onMove, gameState, status, mode, handleDraw, handleResign, gameStarted, currentPlayer }) => {
  const isBlack = color === "black";
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [boardWidth, setBoardWidth] = useState(300);
  const containerRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [networkErrorOccurred, setNetworkErrorOccurred] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [browserInfo, setBrowserInfo] = useState("");

  const spokenTextRef = useRef("");
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Track confetti window size
  useEffect(() => {
    const h = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Dynamically measure container width for the board
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) setBoardWidth(w);
      }
    });
    observer.observe(containerRef.current);
    // Initial measurement
    const w = Math.floor(containerRef.current.getBoundingClientRect().width);
    if (w > 0) setBoardWidth(w);
    return () => observer.disconnect();
  }, []);

  const onDrop = useCallback((from, to) => {
    const copy = new Chess(gameState.fen());
    const move = copy.move({ from, to, promotion: "q" });
    if (move) { onMove(move, copy); return true; }
    return false;
  }, [gameState, onMove]);

  const detectBrave = useCallback(async () => {
    if (navigator.brave?.isBrave) return true;
    try { if (navigator.brave) { const b = await navigator.brave.isBrave(); if (b) return true; } } catch {}
    return navigator.userAgent.includes('Brave');
  }, []);

  const getBrowserInfo = useCallback(() => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edge')) return "Chrome";
    if (ua.includes('Edge')) return "Edge";
    if (ua.includes('Firefox')) return "Firefox";
    if (ua.includes('Safari') && !ua.includes('Chrome')) return "Safari";
    return "Unknown";
  }, []);

  const checkSpeechSupport = useCallback(async () => {
    if (await detectBrave()) { setBrowserInfo("Brave (Blocks Speech)"); return false; }
    setBrowserInfo(getBrowserInfo());
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    if (!supported) return false;
    const secure = ['https:', 'http:'].includes(window.location.protocol) ||
      ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (!secure) return false;
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      new SR();
      return true;
    } catch { return false; }
  }, [detectBrave, getBrowserInfo]);

  const testSpeechService = useCallback(async () => {
    try {
      const c = new AbortController();
      setTimeout(() => c.abort(), 5000);
      await fetch('https://www.google.com/favicon.ico', { method: 'HEAD', mode: 'no-cors', signal: c.signal });
      return true;
    } catch { return false; }
  }, []);

  useEffect(() => {
    const init = async () => {
      const sup = await checkSpeechSupport();
      setSpeechSupported(sup);
      if (!sup) return;
      try {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const r = new SR();
        r.continuous = false; r.interimResults = false; r.lang = 'en-US'; r.maxAlternatives = 1;
        recognitionRef.current = r;
        testSpeechService().then(ok => { if (!ok) setNetworkErrorOccurred(true); });
      } catch { setSpeechSupported(false); }
    };
    init();
    return () => { if (recognitionRef.current) try { recognitionRef.current.abort(); } catch {} };
  }, [checkSpeechSupport, testSpeechService]);

  const requestMicPermission = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach(t => t.stop());
      setPermissionGranted(true);
      return true;
    } catch (e) {
      setPermissionGranted(false);
      if (e.name === 'NotAllowedError') alert("Microphone access denied.");
      else if (e.name === 'NotFoundError') alert("No microphone found.");
      else alert("Microphone error.");
      return false;
    }
  }, []);

  const parseSpokenMove = useCallback((text) => {
    if (!text) return null;
    const map = { one:"1",two:"2",three:"3",four:"4",five:"5",six:"6",seven:"7",eight:"8",ate:"8",to:"2",too:"2",for:"4",fore:"4" };
    let c = text.toLowerCase()
      .replace(/\b(one|two|three|four|five|six|seven|eight|ate|to|too|for|fore)\b/g, m => map[m] || m)
      .replace(/[^a-h1-8\s]/g, "").replace(/\s+/g, "");
    const sq = c.match(/[a-h][1-8]/g);
    return sq?.length >= 2 ? { from: sq[0], to: sq[1], promotion: "q" } : null;
  }, []);

  const processVoiceCommand = useCallback((text) => {
    const move = parseSpokenMove(text);
    if (move) {
      const ok = onDrop(move.from, move.to);
      if (ok) { setNetworkErrorOccurred(false); }
      else alert(`Invalid move: ${move.from} to ${move.to}`);
    } else {
      alert(`Could not parse: "${text}". Say something like "e2 to e4"`);
    }
  }, [onDrop, parseSpokenMove]);

  const startListening = useCallback(async () => {
    if (isRecordingRef.current || !recognitionRef.current) return;
    setNetworkErrorOccurred(false);
    const connected = await testSpeechService();
    if (!connected) { setNetworkErrorOccurred(true); return; }
    const hasPerm = await requestMicPermission();
    if (!hasPerm) return;

    try {
      setSpokenText(""); spokenTextRef.current = ""; isRecordingRef.current = true;
      const r = recognitionRef.current;
      r.onstart = null; r.onresult = null; r.onend = null; r.onerror = null;

      const t = setTimeout(() => { if (isRecordingRef.current) { isRecordingRef.current = false; setNetworkErrorOccurred(true); r.abort(); } }, 10000);

      r.onstart = () => { clearTimeout(t); setRecording(true); setNetworkErrorOccurred(false); };
      r.onresult = ev => {
        let full = ""; let isFinal = false;
        for (let i = 0; i < ev.results.length; i++) { full += ev.results[i][0].transcript; if (ev.results[i].isFinal) isFinal = true; }
        spokenTextRef.current = full; setSpokenText(full);
        if (isFinal && full.trim()) r.stop();
      };
      r.onend = () => {
        clearTimeout(t); isRecordingRef.current = false; setRecording(false);
        if (spokenTextRef.current.trim()) processVoiceCommand(spokenTextRef.current);
      };
      r.onerror = ev => {
        clearTimeout(t); isRecordingRef.current = false; setRecording(false);
        if (['network','service-not-allowed','not-allowed','audio-capture'].includes(ev.error)) setNetworkErrorOccurred(true);
      };
      r.start();
    } catch (e) {
      isRecordingRef.current = false; setRecording(false); setNetworkErrorOccurred(true);
    }
  }, [requestMicPermission, processVoiceCommand, testSpeechService, recording]);

  const stopListening = useCallback(() => {
    if (!isRecordingRef.current || !recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch { isRecordingRef.current = false; setRecording(false); }
  }, []);

  const handleTextInput = useCallback((e) => {
    if (e.key === 'Enter') { processVoiceCommand(e.target.value); e.target.value = ''; }
  }, [processVoiceCommand]);

  if (!gameState) return null;

  const isMyTurn = currentPlayer === color;
  const btnBase = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200";

  return (
    <div className={`relative ${className}`} style={{ overflow: 'hidden' }}>
      {status === "win" && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={400} recycle={false} colors={['#c9a84c','#f5e6c3','#8b6914','#e0bd6a']} />}

      {/* Board wrapper */}
      <div className="board-container">
        {/* Turn indicator */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-green-400 animate-pulse' : 'bg-[rgba(220,210,185,0.3)]'}`} />
            <span className="text-xs font-medium" style={{ color: isMyTurn ? '#4ade80' : 'rgba(220,210,185,0.45)' }}>
              {!gameStarted ? 'Waiting for opponent...' : isMyTurn ? 'Your Turn' : "Opponent's Turn"}
            </span>
          </div>
          {gameStarted && (
            <div className="text-xs font-mono px-2 py-0.5 rounded-lg" style={{ background: 'rgba(201,168,76,0.1)', color: 'rgba(201,168,76,0.6)', border: '1px solid rgba(201,168,76,0.15)' }}>
              {currentPlayer === 'white' ? '♔' : '♚'} {currentPlayer}
            </div>
          )}
        </div>

        {/* Board measurement + render */}
        <div ref={containerRef} style={{ width: '100%' }}>
          <Chessboard
            position={gameState.fen()}
            boardOrientation={isBlack ? "black" : "white"}
            onPieceDrop={onDrop}
            boardWidth={boardWidth || undefined}
            isDraggablePiece={({ piece }) => {
              if (!gameStarted || status || mode === "voice" || !piece) return false;
              return currentPlayer === color && piece.startsWith(color === 'black' ? 'b' : 'w');
            }}
            customBoardStyle={{
              borderRadius: '6px',
              boxShadow: '0 0 40px rgba(0,0,0,0.6)',
            }}
            customDarkSquareStyle={{ backgroundColor: '#4a2d0e' }}
            customLightSquareStyle={{ backgroundColor: '#e8d5a0' }}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex flex-wrap justify-center items-center gap-2">
          <button
            className={btnBase}
            style={{
              background: status ? 'rgba(255,255,255,0.04)' : 'rgba(201,168,76,0.12)',
              border: `1px solid ${status ? 'rgba(255,255,255,0.08)' : 'rgba(201,168,76,0.25)'}`,
              color: status ? 'rgba(220,210,185,0.3)' : '#c9a84c',
              cursor: status ? 'not-allowed' : 'pointer',
            }}
            onClick={handleDraw} disabled={!!status}>
            <Handshake style={{ width: '15px', height: '15px' }} /> Offer Draw
          </button>

          <button
            className={btnBase}
            style={{
              background: status ? 'rgba(255,255,255,0.04)' : 'rgba(248,113,113,0.1)',
              border: `1px solid ${status ? 'rgba(255,255,255,0.08)' : 'rgba(248,113,113,0.25)'}`,
              color: status ? 'rgba(220,210,185,0.3)' : '#f87171',
              cursor: status ? 'not-allowed' : 'pointer',
            }}
            onClick={handleResign} disabled={!!status}>
            <Flag style={{ width: '15px', height: '15px' }} /> Resign
          </button>

          {/* Voice controls */}
          {mode === "voice" && speechSupported && !networkErrorOccurred && !recording && (
            <button onClick={startListening} className={btnBase}
              style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>
              <Mic style={{ width: '15px', height: '15px' }} /> Voice
            </button>
          )}
          {mode === "voice" && speechSupported && !networkErrorOccurred && recording && (
            <button onClick={stopListening} className={`${btnBase} animate-pulse`}
              style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.35)', color: '#f87171' }}>
              <MicOff style={{ width: '15px', height: '15px' }} /> Stop
            </button>
          )}
          {mode === "voice" && speechSupported && networkErrorOccurred && (
            <button onClick={() => { setNetworkErrorOccurred(false); startListening(); }} className={btnBase}
              style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)', color: '#fb923c' }}>
              <RotateCcw style={{ width: '15px', height: '15px' }} /> Retry
            </button>
          )}
          {mode === "voice" && (!speechSupported || networkErrorOccurred) && (
            <div className="flex flex-col items-center gap-1.5 w-full">
              <p className="text-xs" style={{ color: 'rgba(248,113,113,0.8)' }}>
                {!speechSupported ? `Voice not supported (${browserInfo})` : 'Network error — use text:'}
              </p>
              <input type="text" placeholder="Type move (e.g. e2 e4) + Enter"
                className="text-xs px-3 py-2 rounded-xl outline-none w-52"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: '#e8e0d0' }}
                onKeyPress={handleTextInput} />
            </div>
          )}
        </div>

        {/* Voice listening indicator */}
        {mode === "voice" && recording && (
          <div className="mt-2 px-3 py-2 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <div className="flex-1">
              <span className="text-xs font-semibold text-blue-300">Listening...</span>
              {spokenText && <p className="text-xs mt-0.5 text-[rgba(220,210,185,0.6)]">Heard: "{spokenText}"</p>}
            </div>
          </div>
        )}
      </div>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {status && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 20 }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}>

            {/* Status icon */}
            <div className="mb-4 text-6xl" style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.6))' }}>
              {status === 'win' ? '♔' : status === 'draw' ? '🤝' : '♚'}
            </div>

            <h2 className="text-4xl font-black mb-2" style={{
              fontFamily: 'Cinzel, serif',
              background: status === 'win' ? 'linear-gradient(135deg, #f5e6c3, #c9a84c)' : status === 'draw' ? 'linear-gradient(135deg, #93c5fd, #60a5fa)' : 'linear-gradient(135deg, #fca5a5, #f87171)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {status === 'win' ? 'Victory!' : status === 'draw' ? 'Draw!' : 'Defeat'}
            </h2>

            <p className="text-sm mb-6" style={{ color: 'rgba(220,210,185,0.55)' }}>
              {status === 'win' ? 'Magnificent play! You dominated the board.' : status === 'draw' ? 'A hard-fought battle ends in a draw.' : 'Better luck next time. Study and improve!'}
            </p>

            <button onClick={() => navigate("/dashboard")}
              className="btn-gold flex items-center gap-2">
              <LayoutDashboard style={{ width: '16px', height: '16px' }} />
              Back to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChessBoard;
