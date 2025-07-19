import { Video, Crown, Clock, Mic, MicOff, VideoOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import socket from "../socket/SocketConnection.jsx";

const PlayerCard = ({
  playerName,
  initialTime = 600,
  isActive,
  isPlayer1 = false,
  className = "",
  opponentSocketId
}) => {
  const [time, setTime] = useState(initialTime);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [stream, setStream] = useState(null);

  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const offerTimeoutRef = useRef(null);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (isActive && hasGameStarted && time > 0) {
      interval = setInterval(() => {
        setTime(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, time, hasGameStarted]);


  useEffect(() => {   
    const handleGameStart = () => setHasGameStarted(true);
    socket.on("bothPlayersJoined", handleGameStart);
    return () => {
      socket.off("bothPlayersJoined", handleGameStart);
    };
  }, []);

  
  // Setup Local Stream and WebRTC
  useEffect(() => {
    const setupLocalStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
        mediaStream.getAudioTracks()[0].enabled = isMicEnabled;
        mediaStream.getVideoTracks()[0].enabled = isVideoEnabled;
        return mediaStream;
      } catch (err) {
        console.error("Failed to access media devices:", err);
      }
    };

    const initCaller = async () => {
      const mediaStream = await setupLocalStream();
      const peer = new RTCPeerConnection();
      peerRef.current = peer;

      mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));

      peer.onicecandidate = e => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            targetSocketId: opponentSocketId,
            candidate: e.candidate
          });
        }
      };

      peer.ontrack = e => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call-user", {
        targetSocketId: opponentSocketId,
        offer
      });
    };

    const handleIncomingCall = async ({ from, offer }) => {
      const mediaStream = await setupLocalStream();
      const peer = new RTCPeerConnection();
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

      clearTimeout(offerTimeoutRef.current);
    };

    const init = async () => {
      if (!isPlayer1) {
        await setupLocalStream();
        return;
      }

      if (!opponentSocketId) return;

      socket.on("incoming-call", handleIncomingCall);

      offerTimeoutRef.current = setTimeout(() => {
        initCaller();
      }, 3000);

      socket.on("call-answered", async ({ answer }) => {
        if (peerRef.current) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (peerRef.current) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error("ICE error:", err);
          }
        }
      });
    };

    init();

    return () => {
      clearTimeout(offerTimeoutRef.current);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-answered");
      socket.off("ice-candidate");
    };
  }, [opponentSocketId, isPlayer1]);

  // Ensure video loads stream after render
  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-xl lg:rounded-2xl p-2 lg:p-4 border-2 transition-all duration-300 ${
      isActive
        ? 'border-orange-400 shadow-lg shadow-orange-100 ring-2 ring-orange-200'
        : 'border-gray-200 shadow-md'
    } ${className}`}>
      {/* Player Info */}
      <div className="flex items-center justify-between mb-1.5 lg:mb-4">
        <div className="flex items-center space-x-1 lg:space-x-2">
          <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${
            isActive ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="font-semibold text-gray-800 text-xs lg:text-base">{playerName}</span>
          {!isPlayer1 && <Crown className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" />}
        </div>
        <div className={`flex items-center space-x-1 ${
          isActive ? 'text-orange-600' : 'text-gray-600'
        }`}>
          <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
          <span className={`font-mono font-bold text-xs lg:text-sm ${
            time < 60 ? 'text-red-500' : ''
          }`}>{formatTime(time)}</span>
        </div>
      </div>

      {/* Video Area */}
      <div className={`aspect-video relative rounded-lg lg:rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${
        isActive ? "border-orange-300 bg-orange-50" : "border-gray-300 bg-gray-50"
      }`}>
        {isPlayer1 ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
        ) : (
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg" />
        )}
      </div>

  
    </div>
  );
};

export default PlayerCard;
