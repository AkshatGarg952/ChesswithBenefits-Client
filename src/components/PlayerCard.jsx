import { Crown, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import socket from "../socket/SocketConnection.jsx";

const PlayerCard = ({
  playerName,
  initialTime = 600,
  isActive,
  isPlayer1 = false,
  className = ""
}) => {
  const [time, setTime] = useState(initialTime);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [opponentSocketId, setOpponentSocketId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // For debugging

  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingIceCandidates = useRef([]);
  const isInitiator = useRef(false);
  const isConnectionActive = useRef(true);

  const setupLocalStream = async () => {
    if (localStream) return localStream;
    try {
      console.log('Setting up local stream...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      
      setLocalStream(mediaStream);
      console.log('Local stream created successfully');

      // Set local video for the current player
      if (isPlayer1 && localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
        console.log('Local video set for Player 1');
      } else if (!isPlayer1 && localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
        console.log('Local video set for Player 2');
      }

      // Apply current audio/video settings
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
      console.log(`Processing ${pendingIceCandidates.current.length} pending ICE candidates`);
      while (pendingIceCandidates.current.length > 0) {
        const candidate = pendingIceCandidates.current.shift();
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Added pending ICE candidate');
        } catch (err) {
          console.error("Error adding pending ICE candidate:", err);
        }
      }
    }
  };

  const createPeerConnection = async () => {
    if (peerRef.current) {
      console.log('Closing existing peer connection');
      peerRef.current.close();
    }

    console.log('Creating new peer connection');
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    peerRef.current = peer;

    // Add connection state change listener for debugging
    peer.onconnectionstatechange = () => {
      console.log('Connection state:', peer.connectionState);
      setConnectionStatus(peer.connectionState);
    };

    peer.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peer.iceConnectionState);
    };

    const mediaStream = await setupLocalStream();
    if (mediaStream) {
      console.log('Adding local tracks to peer connection');
      mediaStream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind);
        peer.addTrack(track, mediaStream);
      });
    }

    peer.onicecandidate = (e) => {
      if (e.candidate && isConnectionActive.current && opponentSocketId) {
        console.log('Sending ICE candidate to:', opponentSocketId);
        socket.emit("ice-candidate", {
          targetSocketId: opponentSocketId,
          candidate: e.candidate
        });
      }
    };

    peer.ontrack = (e) => {
      console.log('Received remote track:', e.track.kind);
      if (e.streams && e.streams[0] && isConnectionActive.current) {
        console.log('Setting remote stream');
        setRemoteStream(e.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
          console.log('Remote video stream attached');
        }
      }
    };

    return peer;
  };

  const initiatePeerCall = async (targetSocketId) => {
    if (!isConnectionActive.current) return;
    try {
      console.log('Initiating peer call to:', targetSocketId);
      const peer = await createPeerConnection();
      isInitiator.current = true;

      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peer.setLocalDescription(offer);

      console.log("Sending offer to:", targetSocketId);
      socket.emit("call-user", {
        targetSocketId: targetSocketId,
        offer
      });
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (isActive && hasGameStarted && time > 0) {
      interval = setInterval(() => {
        setTime(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, time, hasGameStarted]);

  // Game start detection
  useEffect(() => {
    const handleGameStart = () => {
      console.log('Game started');
      setHasGameStarted(true);
    };
    socket.on("bothPlayersJoined", handleGameStart);
    return () => socket.off("bothPlayersJoined", handleGameStart);
  }, []);

  // WebRTC Event Handlers
  useEffect(() => {
    const handleOpponentJoined = async ({ opponentSocketId: oppSocketId }) => {
      console.log("Opponent joined with socket ID:", oppSocketId);
      setOpponentSocketId(oppSocketId);

      // Wait a bit to ensure both clients are ready
      setTimeout(async () => {
        const mediaStream = await setupLocalStream();
        if (mediaStream) {
          console.log("Initiating call after opponent joined");
          await initiatePeerCall(oppSocketId);
        } else {
          console.warn("Failed to get media stream for call");
        }
      }, 1000);
    };

    const handleIncomingCall = async ({ from, offer }) => {
      console.log("Incoming call from:", from);
      if (!isConnectionActive.current) return;

      setOpponentSocketId(from);
      try {
        const peer = await createPeerConnection();
        isInitiator.current = false;

        console.log('Setting remote description from offer');
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        
        const answer = await peer.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await peer.setLocalDescription(answer);

        console.log('Sending answer to:', from);
        socket.emit("answer-call", { targetSocketId: from, answer });
        
        // Process pending ICE candidates after setting remote description
        await processPendingIceCandidates();
      } catch (error) {
        console.error('Error handling incoming call:', error);
      }
    };

    const handleCallAnswered = async ({ from, answer }) => {
      console.log("Call answered by:", from);
      if (!isConnectionActive.current || !peerRef.current) return;

      try {
        if (peerRef.current.signalingState === 'have-local-offer') {
          console.log('Setting remote description from answer');
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          await processPendingIceCandidates();
        } else {
          console.warn('Unexpected signaling state:', peerRef.current.signalingState);
        }
      } catch (error) {
        console.error('Error handling call answer:', error);
      }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      console.log("Received ICE candidate from:", from);
      if (!isConnectionActive.current || !peerRef.current) return;

      try {
        if (peerRef.current.remoteDescription) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Added ICE candidate immediately');
        } else {
          console.log('Queuing ICE candidate for later');
          pendingIceCandidates.current.push(candidate);
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    };

    const handleCallEnded = ({ from }) => {
      console.log("Call ended by:", from);
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      setRemoteStream(null);
      setOpponentSocketId(null);
      setConnectionStatus('disconnected');
      pendingIceCandidates.current = [];
    };

    // Initialize local stream on component mount
    setupLocalStream();

    socket.on("opponentJoined", handleOpponentJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      isConnectionActive.current = false;
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      pendingIceCandidates.current = [];
      socket.off("opponentJoined", handleOpponentJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-answered", handleCallAnswered);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
    };
  }, []);

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Update track enabled state when mic/video toggles change
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = isMicEnabled);
      localStream.getVideoTracks().forEach(track => track.enabled = isVideoEnabled);
    }
  }, [isMicEnabled, isVideoEnabled, localStream]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show local video for own card, remote video for opponent's card
  const shouldShowLocalVideo = localStream && (
    (isPlayer1 && !remoteStream) || (!isPlayer1 && !remoteStream)
  );
  const shouldShowRemoteVideo = remoteStream && opponentSocketId;

  return (
    <div className={`bg-white rounded-xl p-2 lg:p-4 border-2 transition-all duration-300 ${
      isActive ? 'border-orange-400 shadow-lg ring-2 ring-orange-200' : 'border-gray-200 shadow-md'
    } ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="font-semibold text-gray-800 text-sm">
            {playerName}
            <span className="ml-1 text-xs text-gray-500">
              ({opponentSocketId ? "Opponent" : "You"})
            </span>
          </span>
          {!isPlayer1 && <Crown className="w-4 h-4 text-yellow-500" />}
        </div>
        <div className={`flex items-center space-x-1 ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
          <Clock className="w-4 h-4" />
          <span className={`font-mono font-bold text-sm ${time < 60 ? 'text-red-500' : ''}`}>
            {formatTime(time)}
          </span>
        </div>
      </div>

      <div className={`aspect-video relative rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${
        isActive ? "border-orange-300 bg-orange-50" : "border-gray-300 bg-gray-50"
      }`}>
        {shouldShowLocalVideo ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
          />
        ) : shouldShowRemoteVideo ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📹</div>
            <p className="text-sm">
              {!opponentSocketId 
                ? "Waiting for opponent..." 
                : `Connection: ${connectionStatus}`
              }
            </p>
            {opponentSocketId && (
              <p className="text-xs mt-1">
                Opponent ID: {opponentSocketId.substring(0, 8)}...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
