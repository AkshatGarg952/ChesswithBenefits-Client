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
  console.log(initialTime);
  console.log(isActive);
  const [time, setTime] = useState(initialTime);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [stream, setStream] = useState(null);
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);


  const setupLocalStream = async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  // Save stream to state
  setStream(mediaStream);
  
  // Set to video ref
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = mediaStream;
  }

  // Initially mute/unmute tracks based on state
  mediaStream.getAudioTracks()[0].enabled = isMicEnabled;
  mediaStream.getVideoTracks()[0].enabled = isVideoEnabled;

  return mediaStream;
};

const toggleMic = () => {
  const track = stream?.getAudioTracks()[0];
  if (track) {
    track.enabled = !track.enabled;
    setIsMicEnabled(track.enabled);
  }
};


const toggleVideo = () => {
  const track = stream?.getVideoTracks()[0];
  if (track) {
    track.enabled = !track.enabled;
    setIsVideoEnabled(track.enabled);
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

  // Game start listener
  useEffect(() => {
    const handleGameStart = () => setHasGameStarted(true);
    socket.on("bothPlayersJoined", handleGameStart);
    return () => {
      socket.off("bothPlayersJoined", handleGameStart);
    };
  }, []);

  // WebRTC setup
  useEffect(() => {
  const setupLocalStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(mediaStream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream;
    }
    return mediaStream;
  };

  if (!isPlayer1) {
    setupLocalStream(); // Just set own video
    return;
  }
  
  if (!opponentSocketId) return;

  let peer;
  let offerTimeout;

  const handleIncomingCall = async ({ from, offer }) => {
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

    clearTimeout(offerTimeout);
  };

  const initCaller = async () => {
    const mediaStream = await setupLocalStream();
    peer = new RTCPeerConnection();
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

  const init = async () => {
    if (!isPlayer1) {
      // Just show local video for non-Player1
      await setupLocalStream();
      return;
    }

    // First wait for possible incoming call
    socket.on("incoming-call", handleIncomingCall);

    // If no incoming call after 3s, emit call-user
    offerTimeout = setTimeout(() => {
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
          console.error("ICE candidate error:", err);
        }
      }
    });
  };

  init();

  return () => {
    clearTimeout(offerTimeout);
    socket.off("incoming-call", handleIncomingCall);
    socket.off("call-answered");
    socket.off("ice-candidate");
  };

}, [opponentSocketId, isPlayer1]); // 👈 dependencies matter


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

     


{/* Video Call Area */}
<div
  className={`aspect-video relative rounded-lg lg:rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${
    isActive ? "border-orange-300 bg-orange-50" : "border-gray-300 bg-gray-50"
  }`}
>
  <video
    ref={isPlayer1 ? remoteVideoRef : localVideoRef}
    autoPlay
    playsInline
    muted={!opponentSocketId}
    className="w-full h-full object-cover rounded-lg"
  />
</div>

{/* Mic/Video Toggle Buttons */}
{!isPlayer1 && (
  <div className="mt-2 flex justify-center space-x-3 flex-wrap"> {/* Reduced mt-5 to mt-2 and added flex-wrap */}
    <button
      onClick={toggleMic}
      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow m-1"
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
      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow m-1"
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
