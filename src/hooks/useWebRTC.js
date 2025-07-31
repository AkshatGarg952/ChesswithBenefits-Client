// src/hooks/useWebRTC.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

// ICE server configuration for STUN
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

// Media constraints for video and audio
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
    const pendingAnswersRef = useRef([]); // For queuing answers if needed
    const hasInitializedRef = useRef(false);
    const isInitializingRef = useRef(false);
    const callStateRef = useRef('idle');
    const myRoleRef = useRef(null); // 'caller' or 'receiver'
    const isProcessingOfferRef = useRef(false);
    const isProcessingAnswerRef = useRef(false);

    // Debug function to log peer connection details
    const debugPeerConnection = useCallback(() => {
        const pc = peerConnectionRef.current;
        if (pc) {
            console.log(`🔍 PC Debug Info:`, {
                signalingState: pc.signalingState,
                connectionState: pc.connectionState,
                iceConnectionState: pc.iceConnectionState,
                iceGatheringState: pc.iceGatheringState,
                localDescription: pc.localDescription?.type,
                remoteDescription: pc.remoteDescription?.type,
                callState: callStateRef.current,
                role: myRoleRef.current,
                createdAt: pc._createdAt,
                currentTime: Date.now(),
                isCurrentUser
            });
        } else {
            console.log(`🔍 No peer connection exists (${isCurrentUser ? 'Current User' : 'Opponent'})`);
        }
    }, [isCurrentUser]);

    // Cleanup function to reset everything
    const cleanup = useCallback(() => {
        console.log(`🧹 Cleaning up WebRTC resources... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
        
        if (peerConnectionRef.current) {
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onconnectionstatechange = null;
            peerConnectionRef.current.onnegotiationneeded = null;
            peerConnectionRef.current.onsignalingstatechange = null;
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        remoteStreamRef.current = null;
        pendingCandidatesRef.current = [];
        pendingAnswersRef.current = [];
        hasInitializedRef.current = false;
        isInitializingRef.current = false;
        callStateRef.current = 'idle';
        myRoleRef.current = null;
        isProcessingOfferRef.current = false;
        isProcessingAnswerRef.current = false;
        setShouldInitiateCall(false);
        
        setConnectionState('idle');
        setMediaError(null);
    }, [isCurrentUser]);

    // Get user media (camera and mic)
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

    // Create peer connection with safeguards
    const createPeerConnection = useCallback((role) => {
        if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
            console.log(`⚠️ Peer connection already exists and not closed, reusing existing one (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            return peerConnectionRef.current;
        }

        console.log(`🔗 Creating new peer connection as ${role}... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;
        myRoleRef.current = role;

        pc._createdAt = Date.now();
        pc._role = role;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                console.log(`➕ Adding local track: ${track.kind} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate && opponentSocketId) {
                console.log(`🧊 Sending ICE candidate (${role}) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                socket.emit('ice-candidate', {
                    targetSocketId: opponentSocketId,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log(`📹 Received remote track: ${event.track.kind} (${role}) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            const [remoteStream] = event.streams;
            
            if (remoteStream && remoteStream.getTracks().length > 0) {
                remoteStreamRef.current = remoteStream;
                setConnectionState('connected');
                console.log(`✅ Remote stream set with ${remoteStream.getTracks().length} tracks (${role}) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            }
        };

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            console.log(`🔄 Connection state changed: ${state} (${role}) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            setConnectionState(state);

            switch (state) {
                case 'connected':
                    toast.success('Video call connected!');
                    callStateRef.current = 'connected';
                    break;
                case 'disconnected':
                    toast.warn('Connection lost');
                    break;
                case 'failed':
                    toast.error('Connection failed');
                    callStateRef.current = 'failed';
                    break;
            }
        };

        pc.onsignalingstatechange = () => {
            console.log(`🔄 Signaling state changed: ${pc.signalingState} (${role}) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
        };

        return pc;
    }, [socket, opponentSocketId, isCurrentUser]);

    // Initiate call as the caller
    const initiateCall = useCallback(async () => {
        if (!shouldInitiateCall || callStateRef.current !== 'ready') {
            console.log(`❌ Not supposed to initiate call or not ready. State: ${callStateRef.current} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            return;
        }

        if (isProcessingOfferRef.current) {
            console.log(`⚠️ Already processing offer, skipping... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            return;
        }

        isProcessingOfferRef.current = true;

        const pc = createPeerConnection('caller');
        if (!pc || !opponentSocketId) {
            console.log(`❌ Missing requirements for call initiation (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            isProcessingOfferRef.current = false;
            return;
        }

        try {
            console.log(`🤝 Creating offer... (caller) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            setConnectionState('connecting');
            callStateRef.current = 'calling';
            
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            console.log(`📤 Sending offer. Signaling state: ${pc.signalingState} (caller) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            
            socket.emit('call-user', {
                targetSocketId: opponentSocketId,
                offer: pc.localDescription,
            });
            
            console.log(`📤 Offer sent (caller) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
        } catch (error) {
            console.error(`❌ Failed to create offer (caller) (${isCurrentUser ? 'Current User' : 'Opponent'}):`, error);
            toast.error('Failed to initiate call');
            callStateRef.current = 'failed';
        } finally {
            isProcessingOfferRef.current = false;
        }
    }, [socket, opponentSocketId, shouldInitiateCall, isCurrentUser, createPeerConnection]);

    // Listen for opponentJoined event
    useEffect(() => {
        const handleOpponentJoined = (data) => {
            console.log(`👥 Opponent joined event received (${isCurrentUser ? 'Current User' : 'Opponent'}):`, data);
            
            if (isCurrentUser) {
                setShouldInitiateCall(data.shouldInitiateCall || false);
            }
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

            callStateRef.current = 'ready';
            setConnectionState('ready');

            if (shouldInitiateCall && isCurrentUser) {
                myRoleRef.current = 'caller';
                console.log(`📞 Will initiate call in 2 seconds as caller... (Current User)`);
                setTimeout(() => {
                    initiateCall();
                    isInitializingRef.current = false;
                }, 2000);
            } else {
                console.log(`👂 Waiting for incoming call... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                callStateRef.current = 'waiting';
                isInitializingRef.current = false;
            }
        };

        initializeConnection();
    }, [opponentSocketId, shouldInitiateCall, initializeMedia, initiateCall, isCurrentUser]);

    // Handle opponent disconnection
    useEffect(() => {
        if (!opponentSocketId && hasInitializedRef.current) {
            console.log(`👋 Opponent disconnected, cleaning up... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            cleanup();
        }
    }, [opponentSocketId, cleanup, isCurrentUser]);

    // Socket event handlers
    useEffect(() => {
        const handleIncomingCall = async ({ from, offer }) => {
            if (from !== opponentSocketId) return;
            
            console.log(`📞 INCOMING CALL from: ${from}. My role: ${myRoleRef.current}. Call state: ${callStateRef.current} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            
            if (callStateRef.current !== 'waiting' && callStateRef.current !== 'ready') {
                console.log(`⚠️ Not in correct state to receive call: ${callStateRef.current} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                return;
            }

            if (peerConnectionRef.current) {
                console.log(`⚠️ Already have peer connection, ignoring incoming call (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                return;
            }
            
            try {
                const pc = createPeerConnection('receiver');
                if (!pc) {
                    console.error(`❌ Failed to create peer connection for incoming call (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                    return;
                }
                
                console.log(`🔗 Created peer connection for incoming call. Signaling state: ${pc.signalingState} (receiver) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                
                callStateRef.current = 'answering';
                
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                console.log(`✅ Remote description set. New signaling state: ${pc.signalingState} (receiver) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                
                while (pendingCandidatesRef.current.length > 0) {
                    const candidate = pendingCandidatesRef.current.shift();
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        console.log(`🧊 Added queued ICE candidate (receiver) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                    } catch (err) {
                        console.warn(`⚠️ Failed to add queued ICE candidate (receiver) (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
                    }
                }
                
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                console.log(`📤 Sending answer. Signaling state: ${pc.signalingState} (receiver) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                
                socket.emit('answer-call', {
                    targetSocketId: from,
                    answer: pc.localDescription,
                });
                
                console.log(`✅ Answer sent (receiver) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                setConnectionState('connecting');
            } catch (err) {
                console.error(`❌ Failed to handle incoming call (receiver) (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
                toast.error('Failed to answer call');
                callStateRef.current = 'failed';
            }
        };

        const handleCallAnswered = async ({ from, answer }) => {
            if (from !== opponentSocketId) return;

            console.log(`✅ CALL ANSWERED by: ${from}. My role: ${myRoleRef.current}. Call state: ${callStateRef.current} (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            
            debugPeerConnection();

            if (myRoleRef.current !== 'caller') {
                console.log(`⚠️ Received answer but I'm not the caller (I'm ${myRoleRef.current}). Ignoring. (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                return;
            }

            if (isProcessingAnswerRef.current) {
                console.log(`⚠️ Already processing answer, ignoring... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                return;
            }

            isProcessingAnswerRef.current = true;

            const pc = peerConnectionRef.current;
            if (!pc) {
                console.log(`⚠️ No peer connection for answer (caller) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                isProcessingAnswerRef.current = false;
                return;
            }

            const signalingState = pc.signalingState;
            console.log(`🔍 DETAILED STATE CHECK:`, {
                signalingState,
                callState: callStateRef.current,
                pcCreatedAt: pc._createdAt,
                pcRole: pc._role,
                currentTime: Date.now(),
                isCurrentUser
            });

            if (signalingState !== 'have-local-offer') {
                console.warn(`⚠️ Signaling state is '${signalingState}' - expected 'have-local-offer'. Queuing answer... (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                pendingAnswersRef.current.push(answer);
                isProcessingAnswerRef.current = false;
                return;
            }

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                console.log(`✅ Remote description set from answer. New signaling state: ${pc.signalingState} (caller) (${isCurrentUser ? 'Current User' : 'Opponent'})`);

                callStateRef.current = 'connected';

                while (pendingCandidatesRef.current.length > 0) {
                    const candidate = pendingCandidatesRef.current.shift();
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        console.log(`🧊 Added queued ICE candidate (caller) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                    } catch (err) {
                        console.warn(`⚠️ Failed to add queued ICE candidate (caller) (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
                    }
                }

                if (pendingAnswersRef.current.length > 0) {
                    const queuedAnswer = pendingAnswersRef.current.shift();
                    await pc.setRemoteDescription(new RTCSessionDescription(queuedAnswer));
                    console.log(`✅ Processed queued answer. New signaling state: ${pc.signalingState} (caller) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                }
            } catch (err) {
                console.error(`❌ Failed to handle call answer (caller) (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
                callStateRef.current = 'failed';
            } finally {
                isProcessingAnswerRef.current = false;
            }
        };

        const handleIceCandidate = async ({ from, candidate }) => {
            if (from !== opponentSocketId) return;
            
            try {
                const pc = peerConnectionRef.current;
                if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log(`🧊 ICE candidate added (${myRoleRef.current}) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                } else {
                    console.log(`🧊 Queuing ICE candidate (no remote description yet) (${myRoleRef.current}) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
                    pendingCandidatesRef.current.push(candidate);
                }
            } catch (err) {
                console.error(`❌ Failed to add ICE candidate (${myRoleRef.current}) (${isCurrentUser ? 'Current User' : 'Opponent'}):`, err);
            }
        };

        const handleCallEnded = ({ from }) => {
            if (from !== opponentSocketId) return;
            console.log(`📞 Call ended by: ${from} (${myRoleRef.current}) (${isCurrentUser ? 'Current User' : 'Opponent'})`);
            cleanup();
            toast.info('Call ended by opponent');
        };

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
    }, [socket, opponentSocketId, createPeerConnection, cleanup, isCurrentUser, debugPeerConnection]);

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