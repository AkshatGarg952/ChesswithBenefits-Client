import { Video, Crown, Clock, Mic, MicOff, VideoOff, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { socket } from "../socket/SocketConnection.js";

const PlayerCard = ({
  playerName,
  initialTime = 600,
  isActive,
  isCurrentUser = false,
  className = "",
  color,
  gameId,
  onTimeExpired,
  compact = false,
}) => {
  const [time, setTime] = useState(initialTime);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [stream, setStream] = useState(null);
  const [opponentSocketId, setOpponentSocketId] = useState(null);

  const opponentSocketIdRef = useRef(null);
  const timerRef = useRef(null);
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => { setTime(initialTime); }, [initialTime]);
  useEffect(() => { opponentSocketIdRef.current = opponentSocketId; }, [opponentSocketId]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => setTime(prev => prev > 0 ? prev - 1 : 0), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const sync = setInterval(() => socket.emit("timer-update", { gameId, color, timeRemaining: time }), 5000);
    return () => clearInterval(sync);
  }, [isActive, time, gameId, color]);

  useEffect(() => {
    const h = () => clearInterval(timerRef.current);
    socket.on("gameOver", h);
    return () => socket.off("gameOver", h);
  }, []);

  const formatTime = t => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  const isLowTime = time < 60;

  const getSharedStream = async () => {
    if (window.localChessStream?.active) return window.localChessStream;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      window.localChessStream = s;
      return s;
    } catch { return null; }
  };

  const toggleMic = () => {
    const s = window.localChessStream || streamRef.current;
    if (s) {
      const t = s.getAudioTracks()[0];
      if (t) { t.enabled = !t.enabled; setIsMicEnabled(t.enabled); }
    }
  };

  const toggleVideo = () => {
    const s = window.localChessStream || streamRef.current;
    if (s) {
      const t = s.getVideoTracks()[0];
      if (t) { t.enabled = !t.enabled; setIsVideoEnabled(t.enabled); }
    }
  };

  useEffect(() => {
    const handleGameStart = async data => {
      const { opponentSocketId: id } = data;
      setHasGameStarted(true);
      setOpponentSocketId(id);
    };
    socket.on("bothPlayersJoined", handleGameStart);
    socket.on("opponentJoined", data => { setHasGameStarted(true); if (data.opponentSocketId) setOpponentSocketId(data.opponentSocketId); });
    return () => { socket.off("bothPlayersJoined", handleGameStart); socket.off("opponentJoined"); };
  }, []);

  useEffect(() => {
    const setupLocal = async () => {
      const s = await getSharedStream();
      if (!s) return;
      streamRef.current = s;
      setStream(s);
      if (localVideoRef.current) { localVideoRef.current.srcObject = s; localVideoRef.current.muted = true; }
      const a = s.getAudioTracks()[0], v = s.getVideoTracks()[0];
      if (a) setIsMicEnabled(a.enabled);
      if (v) setIsVideoEnabled(v.enabled);
    };

    if (isCurrentUser) { setupLocal(); return; }

    let peer;
    const setupCall = async () => await getSharedStream();

    const handleIncoming = async ({ from, offer }) => {
      if (opponentSocketIdRef.current && from !== opponentSocketIdRef.current) return;
      if (peerRef.current) peerRef.current.close();
      const s = await setupCall();
      if (!s) return;
      peer = new RTCPeerConnection();
      peerRef.current = peer;
      s.getTracks().forEach(t => peer.addTrack(t, s));
      peer.onicecandidate = e => { if (e.candidate) socket.emit("ice-candidate", { targetSocketId: from, candidate: e.candidate }); };
      peer.ontrack = e => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const ans = await peer.createAnswer();
      await peer.setLocalDescription(ans);
      socket.emit("answer-call", { targetSocketId: from, answer: ans });
    };

    const handleAnswered = async ({ answer }) => {
      if (peerRef.current) try { await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer)); } catch {}
    };

    const handleIce = async ({ candidate }) => {
      if (peerRef.current) try { await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    };

    socket.on("incoming-call", handleIncoming);
    socket.on("call-answered", handleAnswered);
    socket.on("ice-candidate", handleIce);

    if (opponentSocketId) {
      (async () => {
        if (color === 'black' && opponentSocketId) {
          if (peerRef.current) peerRef.current.close();
          const s = await setupCall();
          if (s) {
            const np = new RTCPeerConnection();
            peerRef.current = np; peer = np;
            s.getTracks().forEach(t => np.addTrack(t, s));
            np.onicecandidate = e => { if (e.candidate) socket.emit("ice-candidate", { targetSocketId: opponentSocketId, candidate: e.candidate }); };
            np.ontrack = e => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
            const offer = await np.createOffer();
            await np.setLocalDescription(offer);
            socket.emit("call-user", { targetSocketId: opponentSocketId, offer });
          }
        }
      })();
    }

    return () => {
      socket.off("incoming-call", handleIncoming);
      socket.off("call-answered", handleAnswered);
      socket.off("ice-candidate", handleIce);
      if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
      setStream(null);
    };
  }, [opponentSocketId, isCurrentUser, color]);

  const pieceSymbol = color === 'white' ? '♔' : '♚';
  const connected = isCurrentUser ? !!stream : !!opponentSocketId;

  // ── COMPACT MODE (mobile) ─────────────────────────────────────────────
  if (compact) {
    return (
      <div className={`player-card ${isActive ? 'active' : ''} ${className}`}
        style={{ padding: '0.5rem 0.625rem' }}>
        <div className="flex items-center justify-between gap-1.5">
          {/* Avatar + name */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="relative w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
              style={{ background: isActive ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <span style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.4))' }}>{pieceSymbol}</span>
              {isCurrentUser && <Crown className="absolute -top-1.5 -right-1.5 h-3 w-3 text-[#c9a84c]" fill="#c9a84c" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold truncate" style={{ color: isActive ? '#e8e0d0' : 'rgba(220,210,185,0.6)', lineHeight: 1.2, maxWidth: '80px' }}>{playerName}</p>
              <p className="text-[9px] capitalize" style={{ color: 'rgba(201,168,76,0.5)' }}>{color}</p>
            </div>
          </div>
          {/* Timer */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg font-mono font-bold text-xs transition-all shrink-0`}
            style={{
              background: isLowTime ? 'rgba(248,113,113,0.15)' : isActive ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isLowTime ? 'rgba(248,113,113,0.3)' : isActive ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.08)'}`,
              color: isLowTime ? '#f87171' : isActive ? '#c9a84c' : 'rgba(220,210,185,0.5)',
            }}>
            <Clock style={{ width: '10px', height: '10px' }} />
            <span className={isLowTime && isActive ? 'animate-pulse' : ''}>{formatTime(time)}</span>
          </div>
        </div>
        {/* Active indicator strip */}
        {isActive && (
          <div className="mt-1.5 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.5), rgba(201,168,76,0.15))' }} />
        )}
      </div>
    );
  }

  // ── FULL MODE (tablet / desktop) ──────────────────────────────────────
  return (
    <div className={`player-card ${isActive ? 'active' : ''} ${className}`}
      style={{ padding: '0.875rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: isActive ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <span style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.4))' }}>{pieceSymbol}</span>
            {isCurrentUser && <Crown className="absolute -top-1.5 -right-1.5 h-3 w-3 text-[#c9a84c]" fill="#c9a84c" />}
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: isActive ? '#e8e0d0' : 'rgba(220,210,185,0.6)', lineHeight: 1.2 }}>{playerName}</p>
            <p className="text-[10px] capitalize" style={{ color: 'rgba(201,168,76,0.5)' }}>{color}</p>
          </div>
        </div>
        {/* Timer */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg font-mono font-bold text-sm transition-all`}
          style={{
            background: isLowTime ? 'rgba(248,113,113,0.15)' : isActive ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isLowTime ? 'rgba(248,113,113,0.3)' : isActive ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.08)'}`,
            color: isLowTime ? '#f87171' : isActive ? '#c9a84c' : 'rgba(220,210,185,0.5)',
          }}>
          <Clock style={{ width: '11px', height: '11px' }} />
          <span className={isLowTime && isActive ? 'animate-pulse' : ''}>{formatTime(time)}</span>
        </div>
      </div>

      {/* Video area */}
      <div className="relative rounded-xl overflow-hidden" style={{
        aspectRatio: '4/3',
        background: 'rgba(0,0,0,0.4)',
        border: isActive ? '1px solid rgba(201,168,76,0.25)' : '1px solid rgba(255,255,255,0.06)',
      }}>
        {isCurrentUser ? (
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <video ref={remoteVideoRef} autoPlay playsInline muted={false} className="w-full h-full object-cover" />
        )}

        {/* Placeholder overlay */}
        {((isCurrentUser && !stream) || (!isCurrentUser && !remoteVideoRef.current?.srcObject)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-3xl opacity-30">{pieceSymbol}</span>
            <p className="text-[10px] font-medium" style={{ color: 'rgba(220,210,185,0.35)' }}>
              {isCurrentUser ? 'Your Video' : `Waiting...`}
            </p>
          </div>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] text-green-400 font-medium">TURN</span>
          </div>
        )}
      </div>

      {/* Controls */}
      {isCurrentUser && (stream || streamRef.current) && (
        <div className="mt-2 flex justify-center gap-2">
          <button onClick={toggleMic}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: isMicEnabled ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', border: `1px solid ${isMicEnabled ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}` }}
            title={isMicEnabled ? "Mute" : "Unmute"}>
            {isMicEnabled ? <Mic style={{ width: '14px', height: '14px', color: '#4ade80' }} /> : <MicOff style={{ width: '14px', height: '14px', color: '#f87171' }} />}
          </button>
          <button onClick={toggleVideo}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: isVideoEnabled ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', border: `1px solid ${isVideoEnabled ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}` }}
            title={isVideoEnabled ? "Turn Off Video" : "Turn On Video"}>
            {isVideoEnabled ? <Video style={{ width: '14px', height: '14px', color: '#4ade80' }} /> : <VideoOff style={{ width: '14px', height: '14px', color: '#f87171' }} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
