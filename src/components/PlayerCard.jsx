// PlayerCard.jsx
import { Crown, Clock, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import socket from "../socket/SocketConnection.jsx";
import { useWebRTC } from '../hooks/useWebRTC.js';

const PlayerCard = ({
    playerName,
    initialTime = 600,
    isActive,
    className = "",
    isCurrentUser = false,
    color,
    opponentSocketId
}) => {
    // Timer state
    const [time, setTime] = useState(parseInt(initialTime));
    const [hasGameStarted, setHasGameStarted] = useState(!!opponentSocketId);

    // WebRTC hook
    const {
        localStream,
        remoteStream,
        connectionState,
        mediaError,
        isMicEnabled,
        isVideoEnabled,
        toggleMic,
        toggleVideo,
    } = useWebRTC({ socket, opponentSocketId, isCurrentUser });

    // Video refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Connect streams to video elements
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            console.log('🎥 Local video connected to element');
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            console.log('🎥 Remote video connected to element');
        }
    }, [remoteStream]);

    // Game start detection
    useEffect(() => {
        setHasGameStarted(!!opponentSocketId);
    }, [opponentSocketId]);

    // Timer logic
    useEffect(() => {
        if (isActive && hasGameStarted && time > 0) {
            const interval = setInterval(() => {
                setTime(prev => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isActive, hasGameStarted, time]);

    // Helper functions
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Video display logic - show local video for current user, remote for opponent
    const showLocalVideo = isCurrentUser && localStream && isVideoEnabled;
    const showRemoteVideo = !isCurrentUser && remoteStream;

    const getStatusMessage = () => {
        if (mediaError) return mediaError;
        if (!opponentSocketId) return 'Waiting for opponent...';
        
        switch (connectionState) {
            case 'idle': return 'Ready to connect';
            case 'requesting-media': return 'Requesting camera access...';
            case 'ready': return 'Ready';
            case 'connecting': return 'Connecting...';
            case 'connected': return 'Connected';
            case 'failed': return 'Connection failed';
            case 'disconnected': return 'Reconnecting...';
            case 'closed': return 'Call ended';
            default: return 'Initializing...';
        }
    };

    const getConnectionStatus = () => {
        if (!opponentSocketId) return 'waiting';
        if (connectionState === 'connected') return 'connected';
        if (connectionState === 'connecting' || connectionState === 'requesting-media') return 'connecting';
        if (connectionState === 'failed' || connectionState === 'disconnected') return 'error';
        return 'idle';
    };

    const connectionStatus = getConnectionStatus();

    return (
        <div className={`bg-white rounded-xl p-2 lg:p-4 border-2 transition-all duration-300 ${
            isActive ? 'border-orange-400 shadow-lg ring-2 ring-orange-200' : 'border-gray-200 shadow-md'
        } ${className}`}>
            
            {/* Header with Player Info and Connection Status */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    {/* Active player indicator */}
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'}`} />
                    
                    {/* Player name */}
                    <span className="font-semibold text-gray-800 text-sm">
                        {playerName}
                    </span>
                    
                    {/* Chess piece color indicator */}
                    <Crown className={`w-4 h-4 ${color === 'white' ? 'text-gray-300' : 'text-gray-800'}`} />
                    
                    {/* WebRTC connection status indicator */}
                    <div 
                        className={`w-2 h-2 rounded-full ${
                            connectionStatus === 'connected' ? 'bg-green-500' :
                            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                            connectionStatus === 'error' ? 'bg-red-500' :
                            'bg-gray-400'
                        }`} 
                        title={getStatusMessage()} 
                    />
                </div>
                
                {/* Timer display */}
                <div className={`flex items-center space-x-1 ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
                    <Clock className="w-4 h-4" />
                    <span className={`font-mono font-bold text-sm ${time < 60 ? 'text-red-500 animate-pulse' : ''}`}>
                        {formatTime(time)}
                    </span>
                </div>
            </div>

            {/* Video Area */}
            <div className={`aspect-video relative rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${
                isActive ? "border-orange-300 bg-orange-50" : "border-gray-300 bg-gray-50"
            }`}>
                
                {/* Local video (for current user) */}
                {isCurrentUser && (
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            showLocalVideo ? 'opacity-100' : 'opacity-0'
                        }`} 
                    />
                )}
                
                {/* Remote video (for opponent) */}
                {!isCurrentUser && (
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            showRemoteVideo ? 'opacity-100' : 'opacity-0'
                        }`} 
                    />
                )}
                
                {/* Status overlay - shown when no video is available */}
                {((isCurrentUser && !showLocalVideo) || (!isCurrentUser && !showRemoteVideo)) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400 p-4">
                        <div className="text-4xl mb-2">
                            {connectionStatus === 'connected' ? '📹' : 
                             connectionStatus === 'connecting' ? '⏳' :
                             connectionStatus === 'error' ? '❌' : 
                             !opponentSocketId ? '👥' : '🎥'}
                        </div>
                        <p className="text-sm font-medium">{getStatusMessage()}</p>
                        {connectionStatus === 'connecting' && (
                            <div className="mt-2 w-6 h-6 border-2 border-gray-400 border-t-orange-500 rounded-full animate-spin"></div>
                        )}
                    </div>
                )}
            </div>

            {/* Media Controls - Show for everyone who has local stream */}
            {localStream && (
                <div className="flex justify-center space-x-2 mt-3">
                    {/* Microphone toggle */}
                    <button 
                        onClick={toggleMic}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                            isMicEnabled 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                        {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    
                    {/* Video toggle */}
                    <button 
                        onClick={toggleVideo}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                            isVideoEnabled 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                </div>
            )}

            {/* Media error display */}
            {mediaError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600 text-center">{mediaError}</p>
                </div>
            )}
        </div>
    );
};

export default PlayerCard;
