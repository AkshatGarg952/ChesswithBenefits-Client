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
  gameId, // Added gameId prop
  onTimeExpired // Added callback prop
}) => {
  const [time, setTime] = useState(initialTime);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [stream, setStream] = useState(null);
  const [opponentSocketId, setOpponentSocketId] = useState(null);
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


const setupLocalStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    
    streamRef.current = mediaStream;
    setStream(mediaStream);
    
    // Set to video ref
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream;
    }

    // Initially mute/unmute tracks based on state
    const audioTrack = mediaStream.getAudioTracks()[0];
    const videoTrack = mediaStream.getVideoTracks()[0];
    
    if (audioTrack) {
      audioTrack.enabled = isMicEnabled;
    }
    if (videoTrack) {
      videoTrack.enabled = isVideoEnabled;
    }

    return mediaStream;
  };

  const toggleMic = () => {
    console.log('Toggle mic clicked, stream:', streamRef.current);
    
    // Try to get track from streamRef first, then from video element as fallback
    let track = streamRef.current?.getAudioTracks()[0];
    
    // Fallback: get from video element if streamRef is not available
    if (!track && localVideoRef.current && localVideoRef.current.srcObject) {
      track = localVideoRef.current.srcObject.getAudioTracks()[0];
    }
    
    console.log('Audio track:', track);
    
    if (track) {
      track.enabled = !track.enabled;
      setIsMicEnabled(track.enabled);
      console.log('Mic toggled to:', track.enabled);
    } else {
      console.error('No audio track available');
    }
  };

  const toggleVideo = () => {
    console.log('Toggle video clicked, stream:', streamRef.current);
    
    // Try to get track from streamRef first, then from video element as fallback
    let track = streamRef.current?.getVideoTracks()[0];
    
    // Fallback: get from video element if streamRef is not available
    if (!track && localVideoRef.current && localVideoRef.current.srcObject) {
      track = localVideoRef.current.srcObject.getVideoTracks()[0];
    }
    
    console.log('Video track:', track);
    
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
      console.log('Video toggled to:', track.enabled);
    } else {
      console.error('No video track available');
    }
  };

  // WebRTC caller function
  const initCaller = async (targetSocketId) => {
    console.log(`📱 White player initiating call to:`, targetSocketId);
    
    // Cleanup existing connection if any
    if (peerRef.current) {
      peerRef.current.close();
    }
    
    const mediaStream = await setupLocalStream();
    const peer = new RTCPeerConnection();
    peerRef.current = peer;

    mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));

    peer.onicecandidate = e => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          targetSocketId: targetSocketId,
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
      targetSocketId: targetSocketId,
      offer
    });
  };

  // Game start listener with opponent socket ID from event
  useEffect(() => {
    const handleGameStart = async (data) => {
      console.log("🎮 Both players joined!", data);
      
      // Extract opponent socket ID from the event
      const { opponentSocketId: receivedOpponentSocketId, gameId, moves, fen, opponentUserId, opponentColor } = data;
      
      setHasGameStarted(true);
      setOpponentSocketId(receivedOpponentSocketId);
      
      console.log("Opponent Socket ID:", receivedOpponentSocketId);
      console.log("My Color:", color);
      console.log("Opponent Color:", opponentColor);
      
      // White player initiates call immediately when both players join
      if (color === 'white' && receivedOpponentSocketId && !isCurrentUser) {
        console.log("🤍 White player: Initiating call as both players joined");
        try {
          await initCaller(receivedOpponentSocketId);
        } catch (error) {
          console.error("Failed to initiate call:", error);
        }
      }
    };

    socket.on("bothPlayersJoined", handleGameStart);
    
    return () => {
      socket.off("bothPlayersJoined", handleGameStart);
    };
  }, [color, isCurrentUser]);

  // WebRTC setup
  useEffect(() => {
    const setupLocalStreamForCurrentUser = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      // Store in both ref and state
      streamRef.current = mediaStream;
      setStream(mediaStream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      
      // Set initial track states
      const audioTrack = mediaStream.getAudioTracks()[0];
      const videoTrack = mediaStream.getVideoTracks()[0];
      
      if (audioTrack) {
        audioTrack.enabled = isMicEnabled;
      }
      if (videoTrack) {
        videoTrack.enabled = isVideoEnabled;
      }
      
      return mediaStream;
    };

    if (isCurrentUser) {
      setupLocalStreamForCurrentUser();
      return;
    }
    
    if (!opponentSocketId) return;

    let peer;

    const handleIncomingCall = async ({ from, offer }) => {
      console.log(`📞 Incoming call received by ${color} player from:`, from);
      
      // Cleanup existing connection if any
      if (peerRef.current) {
        peerRef.current.close();
      }
      
      const mediaStream = await setupLocalStream();
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

    const init = async () => {
      if (isCurrentUser) {
        await setupLocalStreamForCurrentUser();
        return;
      }

      // Always listen for incoming calls (both colors can receive)
      socket.on("incoming-call", handleIncomingCall);

      if (color === 'white') {
        console.log("🤍 White player: Will initiate call when both players join");
      } else if (color === 'black') {
        console.log("⚫ Black player: Waiting for incoming call only");
      }

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
            console.error("ICE candidate error:", err);
          }
        }
      });
    };

    init();

    return () => {
      // Better cleanup
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      
      // Clean up stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setStream(null);

      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-answered");
      socket.off("ice-candidate");
    };

  }, [opponentSocketId, isCurrentUser, color, isMicEnabled, isVideoEnabled]);


  // Connection status with clearer role descriptions
  const getConnectionStatus = () => {
    if (!opponentSocketId) return "👥 Waiting for opponent...";
    
    if (!hasGameStarted) return "⏳ Waiting for game start...";
    
    if (isCurrentUser) {
      return "👤 Your video";
    }
    
    if (color === 'white') {
      return "🤍 White Player";
    } else if (color === 'black') {
      return "⚫ Black Player";  
    }
    
    return "🎥 Ready";
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
          {isCurrentUser && <Crown className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" />}
          {/* Color-based role indicator */}
          <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${
            color === 'white' ? 'bg-gray-200 border border-gray-400' : 'bg-gray-800'
          }`} title={`${color} pieces`} />
          {/* Connection status indicator */}
          <span className="text-xs text-gray-500">{getConnectionStatus()}</span>
        </div>
        <div className={`flex items-center space-x-1 ${
          isActive ? 'text-orange-600' : 'text-gray-600'
        }`}>
          <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
          <span className={`font-mono font-bold text-xs lg:text-sm ${
            time < 60 ? 'text-red-500 animate-pulse' : ''
          }`}>{formatTime(time)}</span>
        </div>
      </div>

      {/* Video Call Area */}
      <div
        className={`aspect-video relative rounded-lg lg:rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isActive ? "border-orange-300 bg-orange-50" : "border-gray-300 bg-gray-50"
        }`}
      >
        {/* Conditional video display based on user role and color */}
        {isCurrentUser ? (
          // Current User: Always show local video
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted={true} // Always muted for local user to avoid feedback
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          // Opponent Display: Show remote video based on color/role
          <>
            {color === 'white' ? (
              // White Player (Caller): Show answer received (remote video from black player)
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false} // Unmuted to hear opponent
                className="w-full h-full object-cover rounded-lg"
              />
            ) : color === 'black' ? (
              // Black Player (Receiver): Show offer received (remote video from white player)  
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false} // Unmuted to hear opponent
                className="w-full h-full object-cover rounded-lg"
              />
            ) : null}
          </>
        )}
        
        {/* Show role indicator when no video stream */}
        {!stream && (
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

      {/* Mic/Video Toggle Buttons - Only show when stream is available */}
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
