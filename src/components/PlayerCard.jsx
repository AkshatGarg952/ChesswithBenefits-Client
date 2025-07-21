import { Crown, Clock } from 'lucide-react';
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
  const pendingIceCandidates = useRef([]);
  const isInitiator = useRef(false);

  const setupLocalStream = async () => {
    if (stream) return stream;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);

      // ✅ Assign stream to the correct ref
      if (!isPlayer1 && localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      } else if (isPlayer1 && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = mediaStream;
      }

      mediaStream.getAudioTracks().forEach(track => track.enabled = isMicEnabled);
      mediaStream.getVideoTracks().forEach(track => track.enabled = isVideoEnabled);

      return mediaStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  };

  const processPendingIceCandidates = async () => {
    if (peerRef.current?.remoteDescription) {
      while (pendingIceCandidates.current.length > 0) {
        const candidate = pendingIceCandidates.current.shift();
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding pending ICE candidate:", err);
        }
      }
    }
  };

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
    return () => socket.off("bothPlayersJoined", handleGameStart);
  }, []);

  useEffect(() => {
    if (!opponentSocketId) {
      setupLocalStream();
      return;
    }

    let peer;
    let offerTimeout;
    let isConnectionActive = true;

    const createPeerConnection = async () => {
      if (peerRef.current) peerRef.current.close();

      peer = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerRef.current = peer;

      const mediaStream = await setupLocalStream();
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
          peer.addTrack(track, mediaStream);
        });
      }

      peer.onicecandidate = (e) => {
        if (e.candidate && isConnectionActive) {
          socket.emit("ice-candidate", {
            targetSocketId: opponentSocketId,
            candidate: e.candidate
          });
        }
      };

      peer.ontrack = (e) => {
        if (remoteVideoRef.current && isConnectionActive) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      return peer;
    };

    const handleIncomingCall = async ({ from, offer }) => {
      if (!isConnectionActive) return;
      try {
        peer = await createPeerConnection();
        isInitiator.current = false;

        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("answer-call", { targetSocketId: from, answer });
        await processPendingIceCandidates();
        clearTimeout(offerTimeout);
      } catch (error) {
        console.error('Error handling incoming call:', error);
      }
    };

    const handleCallAnswered = async ({ answer }) => {
      if (!isConnectionActive || !peerRef.current) return;
      try {
        if (peerRef.current.signalingState === 'have-local-offer') {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          await processPendingIceCandidates();
        }
      } catch (error) {
        console.error('Error handling call answer:', error);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (!isConnectionActive || !peerRef.current) return;
      if (peerRef.current.remoteDescription) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        pendingIceCandidates.current.push(candidate);
      }
    };

    const initCaller = async () => {
      if (!isConnectionActive) return;
      try {
        peer = await createPeerConnection();
        isInitiator.current = true;
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("call-user", {
          targetSocketId: opponentSocketId,
          offer
        });
      } catch (error) {
        console.error('Error initiating call:', error);
      }
    };

    const init = async () => {
      if (!isPlayer1) {
        await setupLocalStream();
        return;
      }

      socket.on("incoming-call", handleIncomingCall);
      socket.on("call-answered", handleCallAnswered);
      socket.on("ice-candidate", handleIceCandidate);

      offerTimeout = setTimeout(() => {
        if (isConnectionActive) {
          initCaller();
        }
      }, 3000);
    };

    init();

    return () => {
      isConnectionActive = false;
      clearTimeout(offerTimeout);
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      pendingIceCandidates.current = [];
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-answered", handleCallAnswered);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [opponentSocketId, isPlayer1]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-xl lg:rounded-2xl p-2 lg:p-4 border-2 transition-all duration-300 ${
      isActive ? 'border-orange-400 shadow-lg shadow-orange-100 ring-2 ring-orange-200' : 'border-gray-200 shadow-md'
    } ${className}`}>
      <div className="flex items-center justify-between mb-1.5 lg:mb-4">
        <div className="flex items-center space-x-1 lg:space-x-2">
          <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${
            isActive ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="font-semibold text-gray-800 text-xs lg:text-base">
            {playerName}
            <span className="ml-1 text-[10px] lg:text-xs text-gray-500">
              ({opponentSocketId ? "Opponent" : "You"})
            </span>
          </span>
          {!isPlayer1 && <Crown className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" />}
        </div>
        <div className={`flex items-center space-x-1 ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
          <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
          <span className={`font-mono font-bold text-xs lg:text-sm ${time < 60 ? 'text-red-500' : ''}`}>
            {formatTime(time)}
          </span>
        </div>
      </div>

      {/* ✅ Fixed Video Stream */}
      <div className={`aspect-video relative rounded-lg lg:rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${
        isActive ? "border-orange-300 bg-orange-50" : "border-gray-300 bg-gray-50"
      }`}>
        <video
          ref={!isPlayer1 ? localVideoRef : remoteVideoRef}
          autoPlay
          playsInline
          muted={!isPlayer1}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    </div>
  );
};

export default PlayerCard;
