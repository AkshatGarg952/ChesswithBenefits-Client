// src/hooks/useWebRTC.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

const MEDIA_CONSTRAINTS = {
    video: { 
        width: { ideal: 640, max: 1280 }, 
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 30, max: 30 }
    },
    audio: { 
        echoCancellation: true, 
        noiseSuppression: true,
        autoGainControl: true
    },
};

export const useWebRTC = ({ socket, opponentSocketId, isCurrentUser }) => {
    // State management
    const [connectionState, setConnectionState] = useState('idle');
    const [mediaError, setMediaError] = useState(null);
    const [isMicEnabled, setMicEnabled] = useState(true);
    const [isVideoEnabled, setVideoEnabled] = useState(true);
    const [shouldInitiateCall, setShouldInitiateCall] = useState(false);

    // Refs for WebRTC components
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const pendingCandidatesRef = useRef([]);
    const hasInitializedRef = useRef(false);
    const isInitializingRef = useRef(false);

    // Cleanup function
    const cleanup = useCallback(() => {
        console.log(`🧹 Cleaning up WebRTC resources... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
        
        if (peerConnectionRef.current) {
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onconnectionstatechange = null;
            peerConnectionRef.current.onnegotiationneeded = null;
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        remoteStreamRef.current = null;
        pendingCandidatesRef.current = [];
        hasInitializedRef.current = false;
        isInitializingRef.current = false;
        setShouldInitiateCall(false);
        
        setConnectionState('idle');
        setMediaError(null);
    }, [isCurrentUser]);

    // Get user media - everyone gets their own stream
    const initializeMedia = useCallback(async () => {
        if (localStreamRef.current) return true;

        try {
            console.log(`🎥 Requesting user media... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            setConnectionState('requesting-media');
            
            const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
            localStreamRef.current = stream;
            
            stream.getVideoTracks().forEach(track => {
                track.enabled = isVideoEnabled;
            });
            stream.getAudioTracks().forEach(track => {
                track.enabled = isMicEnabled;
            });

            setMediaError(null);
            console.log(`✅ User media obtained successfully (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            return true;
        } catch (err) {
            console.error(`❌ Failed to get user media (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
            let errorMessage = 'Could not access camera/microphone';
            
            switch (err.name) {
                case 'NotAllowedError':
                    errorMessage = 'Camera/microphone access denied';
                    break;
                case 'NotFoundError':
                    errorMessage = 'No camera/microphone found';
                    break;
                case 'NotReadableError':
                    errorMessage = 'Camera/microphone is being used by another application';
                    break;
            }
            
            setMediaError(errorMessage);
            toast.error(errorMessage);
            return false;
        }
    }, [isVideoEnabled, isMicEnabled, isCurrentUser]);

    // Create peer connection - only for the initiator
    const createPeerConnection = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        console.log(`🔗 Creating new peer connection... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                console.log(`➕ Adding local track: ${track.kind} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate && opponentSocketId) {
                console.log(`🧊 Sending ICE candidate (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                socket.emit('ice-candidate', {
                    targetSocketId: opponentSocketId,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log(`📹 Received remote track: ${event.track.kind} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            const [remoteStream] = event.streams;
            remoteStreamRef.current = remoteStream;
            setConnectionState('connected');
        };

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            console.log(`🔄 Connection state changed: ${state} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            setConnectionState(state);

            switch (state) {
                case 'connected':
                    toast.success('Video call connected!');
                    break;
                case 'disconnected':
                    toast.warn('Connection lost');
                    break;
                case 'failed':
                    toast.error('Connection failed');
                    break;
            }
        };

        return pc;
    }, [socket, opponentSocketId, isCurrentUser]);

    // Function to initiate call - ONLY called by shouldInitiateCall=true side
    const initiateCall = useCallback(async () => {
        if (!shouldInitiateCall) {
            console.log(`❌ Not supposed to initiate call (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            return;
        }

        const pc = peerConnectionRef.current;
        if (!pc || !opponentSocketId) {
            console.log(`❌ Missing requirements for call initiation (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            return;
        }

        try {
            console.log(`🤝 Creating offer... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            setConnectionState('connecting');
            
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            socket.emit('call-user', {
                targetSocketId: opponentSocketId,
                offer: pc.localDescription,
            });
            
            console.log(`📤 Offer sent (${isCurrentUser ? 'Current User' : 'Opponent'})`);
        } catch (err) {
            console.error(`❌ Failed to create offer (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
            toast.error('Failed to initiate call');
        }
    }, [socket, opponentSocketId, shouldInitiateCall, isCurrentUser]);

    // Listen for opponentJoined event - but only act on it if we're the current user
    useEffect(() => {
        if (!isCurrentUser) return; // Only current user should listen to this

        const handleOpponentJoined = (data) => {
            console.log(`👥 Opponent joined event received (Current User):`, data);
            setShouldInitiateCall(data.shouldInitiateCall || false);
        };

        socket.on('opponentJoined', handleOpponentJoined);
        
        return () => {
            socket.off('opponentJoined', handleOpponentJoined);
        };
    }, [socket, isCurrentUser]);

    // Initialize WebRTC when opponent is available
    useEffect(() => {
        if (!opponentSocketId || hasInitializedRef.current || isInitializingRef.current) return;

        const initializeConnection = async () => {
            console.log(`🚀 Initializing WebRTC connection... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            isInitializingRef.current = true;
            hasInitializedRef.current = true;

            const mediaSuccess = await initializeMedia();
            if (!mediaSuccess) {
                isInitializingRef.current = false;
                return;
            }

            // Everyone creates peer connection for receiving
            createPeerConnection();
            setConnectionState('ready');

            // Only initiate call if we're supposed to AND we're the current user
            if (shouldInitiateCall && isCurrentUser) {
                console.log(`📞 Will initiate call in 2 seconds... (Current User)`);
                setTimeout(() => {
                    initiateCall();
                    isInitializingRef.current = false;
                }, 2000);
            } else {
                console.log(`👂 Waiting for incoming call... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                isInitializingRef.current = false;
            }
        };

        initializeConnection();
    }, [opponentSocketId, shouldInitiateCall, initializeMedia, createPeerConnection, initiateCall, isCurrentUser]);

    // Handle opponent disconnection
    useEffect(() => {
        if (!opponentSocketId && hasInitializedRef.current) {
            console.log(`👋 Opponent disconnected, cleaning up... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            cleanup();
        }
    }, [opponentSocketId, cleanup, isCurrentUser]);

    // Socket event handlers for WebRTC signaling
    useEffect(() => {
        const handleIncomingCall = async ({ from, offer }) => {
            if (from !== opponentSocketId) return;
            
            try {
                console.log(`📞 Handling incoming call from: ${from} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                
                let pc = peerConnectionRef.current;
                if (!pc) {
                    pc = createPeerConnection();
                }
                
                if (pc.signalingState !== 'stable') {
                    console.log(`⚠️ Peer connection not in stable state, resetting... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                    pc = createPeerConnection();
                }
                
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                console.log(`✅ Remote description set (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                
                // Process pending ICE candidates
                while (pendingCandidatesRef.current.length > 0) {
                    const candidate = pendingCandidatesRef.current.shift();
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (err) {
                        console.warn(`⚠️ Failed to add queued ICE candidate (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
                    }
                }
                
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                socket.emit('answer-call', {
                    targetSocketId: from,
                    answer: pc.localDescription,
                });
                
                console.log(`✅ Answer sent (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                setConnectionState('connecting');
            } catch (err) {
                console.error(`❌ Failed to handle incoming call (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
                toast.error('Failed to answer call');
                createPeerConnection();
            }
        };

        const handleCallAnswered = async ({ from, answer }) => {
            if (from !== opponentSocketId) return;
            
            try {
                console.log(`✅ Call answered by: ${from} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                const pc = peerConnectionRef.current;
                
                if (!pc) {
                    console.error(`❌ No peer connection for answer (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                    return;
                }
                
                if (pc.signalingState !== 'have-local-offer') {
                    console.error(`❌ Wrong signaling state for answer: ${pc.signalingState} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                    return;
                }
                
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                console.log(`✅ Remote description set from answer (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                
                // Process pending ICE candidates
                while (pendingCandidatesRef.current.length > 0) {
                    const candidate = pendingCandidatesRef.current.shift();
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (err) {
                        console.warn(`⚠️ Failed to add queued ICE candidate (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
                    }
                }
                
            } catch (err) {
                console.error(`❌ Failed to handle call answer (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
            }
        };

        const handleIceCandidate = async ({ from, candidate }) => {
            if (from !== opponentSocketId) return;
            
            try {
                const pc = peerConnectionRef.current;
                if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log(`🧊 ICE candidate added (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                } else {
                    console.log(`🧊 Queuing ICE candidate (no remote description) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                    pendingCandidatesRef.current.push(candidate);
                }
            } catch (err) {
                console.error(`❌ Failed to add ICE candidate (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
            }
        };

        const handleCallEnded = ({ from }) => {
            if (from !== opponentSocketId) return;
            console.log(`📞 Call ended by: ${from} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            cleanup();
            toast.info('Call ended by opponent');
        };

        // Register socket event listeners
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-answered', handleCallAnswered);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('call-ended', handleCallEnded);

        return () => {
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-answered', handleCallAnswered);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('call-ended', handleCallEnded);
        };
    }, [socket, opponentSocketId, createPeerConnection, cleanup, isCurrentUser]);

    // Media control functions
    const toggleMic = useCallback(() => {
        if (!localStreamRef.current) return;
        
        const audioTracks = localStreamRef.current.getAudioTracks();
        const newState = !isMicEnabled;
        
        audioTracks.forEach(track => {
            track.enabled = newState;
        });
        
        setMicEnabled(newState);
        console.log(`🎤 Microphone ${newState ? 'enabled' : 'disabled'} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
    }, [isMicEnabled, isCurrentUser]);

    const toggleVideo = useCallback(() => {
        if (!localStreamRef.current) return;
        
        const videoTracks = localStreamRef.current.getVideoTracks();
        const newState = !isVideoEnabled;
        
        videoTracks.forEach(track => {
            track.enabled = newState;
        });
        
        setVideoEnabled(newState);
        console.log(`📹 Video ${newState ? 'enabled' : 'disabled'} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
    }, [isVideoEnabled, isCurrentUser]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        localStream: localStreamRef.current,
        remoteStream: remoteStreamRef.current,
        connectionState,
        mediaError,
        isMicEnabled,
        isVideoEnabled,
        toggleMic,
        toggleVideo,
        shouldInitiateCall,
    };
};
