import { Video, Crown, Clock, Mic, MicOff, VideoOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import socket from "../socket/SocketConnection.jsx";

const PlayerCard = ({
  playerName,
  initialTime = 600,
  isActive,
  isCurrentUser = false,
  className = "",
  color,
  gameId,
  onTimeExpired
}) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [stream, setStream] = useState(null);
  const [opponentSocketId, setOpponentSocketId] = useState(null);

  // Ref for opponentSocketId to access current value in listeners without re-binding
  const opponentSocketIdRef = useRef(null);

  useEffect(() => {
    opponentSocketIdRef.current = opponentSocketId;
  }, [opponentSocketId]);

  const timerRef = useRef(null);
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);


  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const syncInterval = setInterval(() => {
      socket.emit("timer-update", {
        gameId,
        color,
        timeRemaining: time,
      });
    }, 5000);
    return () => clearInterval(syncInterval);
  }, [isActive, time, gameId, color]);


  useEffect(() => {
    const handleGameOver = () => clearInterval(timerRef.current);
    socket.on("gameOver", handleGameOver);
    return () => socket.off("gameOver", handleGameOver);
  }, []);

  const formatTime = (t) => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Shared stream acquisition helper
  const getSharedStream = async () => {
    if (window.localChessStream && window.localChessStream.active) {
      return window.localChessStream;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      window.localChessStream = mediaStream;
      return mediaStream;
    } catch (e) {
      console.error("Failed to get stream:", e);
      return null;
    }
  };


  const toggleMic = () => {
    const s = window.localChessStream || streamRef.current;
    if (s) {
      const track = s.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMicEnabled(track.enabled);
      }
    }
  };

  const toggleVideo = () => {
    const s = window.localChessStream || streamRef.current;
    if (s) {
      const track = s.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoEnabled(track.enabled);
      }
    }
  };

  // Game start listener
  useEffect(() => {
    const handleGameStart = async (data) => {
      console.log("🎮 Both players joined!", data);
      const { opponentSocketId: receivedOpponentSocketId } = data;
      setHasGameStarted(true);
      setOpponentSocketId(receivedOpponentSocketId);
    };

    socket.on("bothPlayersJoined", handleGameStart);
    // Also listen for opponentJoined (for the player who was already there)
    socket.on("opponentJoined", (data) => {
      console.log("🎮 Opponent joined!", data);
      setHasGameStarted(true);
      if (data.opponentSocketId) {
        setOpponentSocketId(data.opponentSocketId);
      }
    });

    return () => {
      socket.off("bothPlayersJoined", handleGameStart);
      socket.off("opponentJoined");
    };
  }, []);

  // WebRTC setup
  useEffect(() => {
    const setupLocalStreamForCurrentUser = async () => {
      try {
        const mediaStream = await getSharedStream();
        if (!mediaStream) return;

        streamRef.current = mediaStream;
        setStream(mediaStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
          localVideoRef.current.muted = true;
        }

        const audioTrack = mediaStream.getAudioTracks()[0];
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (audioTrack) setIsMicEnabled(audioTrack.enabled);
        if (videoTrack) setIsVideoEnabled(videoTrack.enabled);

        return mediaStream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    if (isCurrentUser) {
      setupLocalStreamForCurrentUser();
      return;
    }

    // --- Connection Logic for Opponent Card ---

    let peer;

    // Helper to get stream for calling
    const setupCallStream = async () => {
      return await getSharedStream();
    };

    // --- STABLE EVENT HANDLERS ---
    // These use refs to access current state without triggering re-effects

    const handleIncomingCall = async ({ from, offer }) => {
      const currentOpponentId = opponentSocketIdRef.current;

      console.log(`📞 Incoming call from: ${from}. Current Opponent: ${currentOpponentId}`);

      // Basic validation: Is this call from the person we think is our opponent?
      // Or if we don't have an opponent yet, maybe we accept it? 
      // Safer to accept if it matches or if we are waiting.
      if (currentOpponentId && from !== currentOpponentId) {
        console.warn("Mismatch in opponent ID. Ignoring.");
        return;
      }

      if (peerRef.current) {
        peerRef.current.close();
      }

      const mediaStream = await setupCallStream();
      if (!mediaStream) return;

      peer = new RTCPeerConnection();
      peerRef.current = peer;

      mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));

      peer.onicecandidate = e => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            targetSocketId: from,
            candidate: e.candidate
          });
        }
      };

      peer.ontrack = e => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer-call", {
        targetSocketId: from,
        answer
      });
    };

    const handleCallAnswered = async ({ answer }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) {
          console.error("Set remote desc error", e);
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("ICE error", err);
        }
      }
    };

    // Register Listeners ONCE
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);

    // Initiation Logic (Triggered when opponentSocketId changes)
    const initiateCall = async () => {
      if (color === 'black' && opponentSocketId) {
        console.log("⚪ Initiating call to:", opponentSocketId);

        if (peerRef.current) peerRef.current.close();

        const mediaStream = await setupCallStream();
        if (mediaStream) {
          const newPeer = new RTCPeerConnection();
          peerRef.current = newPeer;
          peer = newPeer;

          mediaStream.getTracks().forEach(track => newPeer.addTrack(track, mediaStream));

          newPeer.onicecandidate = e => {
            if (e.candidate) {
              socket.emit("ice-candidate", {
                targetSocketId: opponentSocketId,
                candidate: e.candidate
              });
            }
          };

          newPeer.ontrack = e => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = e.streams[0];
            }
          };

          const offer = await newPeer.createOffer();
          await newPeer.setLocalDescription(offer);

          socket.emit("call-user", {
            targetSocketId: opponentSocketId,
            offer
          });
        }
      }
    };

    if (opponentSocketId) {
      initiateCall();
    }

    return () => {
      // Clean up listeners when component unmounts
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-answered", handleCallAnswered);
      socket.off("ice-candidate", handleIceCandidate);

      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      setStream(null);
    };

    // Vital: We only re-run this effect if `opponentSocketId` (initiation target) changes. 
    // We do NOT include mic/video state.
  }, [opponentSocketId, isCurrentUser, color]);

  // ... (Render Helpers) ...
  const getConnectionStatus = () => {
    if (!opponentSocketId) return "👥 Waiting for opponent...";
    if (!hasGameStarted) return "⏳ Waiting for game start...";
    if (isCurrentUser) return "👤 Your video";
    if (color === 'white') return "🤍 White Player";
    else if (color === 'black') return "⚫ Black Player";
    return "🎥 Ready";
  };

  return (
    <div className={`bg-white rounded-xl lg:rounded-2xl p-2 lg:p-4 border-2 transition-all duration-300 ${isActive
        ? 'border-orange-400 shadow-lg shadow-orange-100 ring-2 ring-orange-200'
        : 'border-gray-200 shadow-md'
      } ${className}`}>
      {/* Player Info */}
      <div className="flex items-center justify-between mb-1.5 lg:mb-4">
        <div className="flex items-center space-x-1 lg:space-x-2">
          <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${isActive ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'
            }`} />
          <span className="font-semibold text-gray-800 text-xs lg:text-base">{playerName}</span>
          {isCurrentUser && <Crown className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" />}
          <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${color === 'white' ? 'bg-gray-200 border border-gray-400' : 'bg-gray-800'
            }`} title={`${color} pieces`} />
          <span className="text-xs text-gray-500">{getConnectionStatus()}</span>
        </div>
        <div className={`flex items-center space-x-1 ${isActive ? 'text-orange-600' : 'text-gray-600'
          }`}>
          <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
          <span className={`font-mono font-bold text-xs lg:text-sm ${time < 60 ? 'text-red-500 animate-pulse' : ''
            }`}>{formatTime(time)}</span>
        </div>
      </div>

      {/* Video Call Area */}
      <div
        className={`aspect-video relative rounded-lg lg:rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${isActive ? "border-orange-300 bg-orange-50" : "border-gray-300 bg-gray-50"
          }`}
      >
        {isCurrentUser ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted={true}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover rounded-lg"
            />
          </>
        )}

        {((isCurrentUser && !stream) || (!isCurrentUser && !remoteVideoRef.current?.srcObject)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-2">
              {isCurrentUser ? '👤' : (color === 'white' ? '🤍' : '⚫')}
            </div>
            <p className="text-sm font-medium">
              {isCurrentUser
                ? 'Your Video'
                : (color === 'white' ? 'White Player' : 'Black Player')
              }
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isCurrentUser
                ? 'Local Stream'
                : 'Waiting for connection...'
              }
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      {isCurrentUser && (stream || streamRef.current) && (
        <div className="mt-2 flex justify-center space-x-3 flex-wrap">
          <button
            onClick={toggleMic}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow m-1 transition-colors"
            title={isMicEnabled ? "Mute Mic" : "Unmute Mic"}
          >
            {isMicEnabled ? (
              <Mic className="w-5 h-5 text-green-600" />
            ) : (
              <MicOff className="w-5 h-5 text-red-500" />
            )}
          </button>
          <button
            onClick={toggleVideo}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow m-1 transition-colors"
            title={isVideoEnabled ? "Turn Off Video" : "Turn On Video"}
          >
            {isVideoEnabled ? (
              <Video className="w-5 h-5 text-green-600" />
            ) : (
              <VideoOff className="w-5 h-5 text-red-500" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
