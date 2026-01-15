import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';

const ChessBoard = ({ className = "", color, onMove, gameState, status, mode, handleDraw, handleResign, gameStarted, currentPlayer }) => {
  const isBlack = color === "black";
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({ width: 300, height: 300 });

  const [recording, setRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [networkErrorOccurred, setNetworkErrorOccurred] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [browserInfo, setBrowserInfo] = useState("");

  const spokenTextRef = useRef("");
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const maxRetries = 3;

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Detect Brave browser

  const onDrop = useCallback((from, to) => {
    const copy = new Chess(gameState.fen());
    const move = copy.move({ from, to, promotion: "q" });
    if (move) {
      onMove(move, copy);
      return true;
    }
    return false;
  }, [gameState, onMove]);


  const detectBrave = useCallback(async () => {
    // Method 1: Direct brave detection
    if (navigator.brave && navigator.brave.isBrave) {
      return true;
    }

    // Method 2: Feature detection for Brave
    try {
      if (navigator.brave) {
        const isBrave = await navigator.brave.isBrave();
        if (isBrave) return true;
      }
    } catch (e) {
      // Ignore errors
    }

    // Method 3: User agent hints (fallback)
    if (navigator.userAgent.includes('Brave')) {
      return true;
    }

    return false;
  }, []);

  // Get browser info for debugging
  const getBrowserInfo = useCallback(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
      return "Chrome";
    } else if (userAgent.includes('Edge')) {
      return "Edge (Limited Support)";
    } else if (userAgent.includes('Firefox')) {
      return "Firefox (Not Supported)";
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return "Safari (Limited Support)";
    } else {
      return "Unknown Browser";
    }
  }, []);

  // Check if speech recognition is supported
  const checkSpeechSupport = useCallback(async () => {
    console.log("=== CHECKING SPEECH SUPPORT ===");
    console.log("Current URL:", window.location.href);
    console.log("Protocol:", window.location.protocol);
    console.log("Hostname:", window.location.hostname);
    console.log("User Agent:", navigator.userAgent);

    // Check if it's Brave browser
    const isBrave = await detectBrave();
    if (isBrave) {
      console.log("❌ Brave browser detected - Speech recognition disabled for privacy");
      setBrowserInfo("Brave Browser (Blocks Speech for Privacy)");
      return false;
    }

    // Set browser info
    setBrowserInfo(getBrowserInfo());

    const hasWebkit = 'webkitSpeechRecognition' in window;
    const hasStandard = 'SpeechRecognition' in window;
    console.log("Has webkit:", hasWebkit);
    console.log("Has standard:", hasStandard);

    const isSupported = hasWebkit || hasStandard;
    console.log("API supported:", isSupported);

    if (!isSupported) {
      console.log("❌ Speech Recognition API not available");
      return false;
    }

    // Check secure context - be more permissive for development
    const isSecure = window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.includes('.local');

    console.log("Is secure context:", isSecure);

    if (!isSecure) {
      console.warn("❌ Speech recognition requires HTTPS or localhost");
      setBrowserInfo(getBrowserInfo() + " (Requires HTTPS)");
      return false;
    }

    // Try to create an instance to verify it really works
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const testRecognition = new SpeechRecognition();
      console.log("✅ Successfully created SpeechRecognition instance");

      // Test basic properties
      testRecognition.continuous = false;
      testRecognition.interimResults = false;
      testRecognition.lang = 'en-US';

      console.log("✅ Speech Recognition fully supported");
      return true;
    } catch (error) {
      console.error("❌ Failed to create SpeechRecognition instance:", error);
      setBrowserInfo(getBrowserInfo() + " (API Error)");
      return false;
    }
  }, [detectBrave, getBrowserInfo]);

  // Test network connectivity to speech service
  const testSpeechService = useCallback(async () => {
    try {
      // Test if we can reach Google's speech service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.warn("Network connectivity test failed:", error);
      return false;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeech = async () => {
      const isSupported = await checkSpeechSupport();
      setSpeechSupported(isSupported);

      if (!isSupported) {
        console.warn("Speech recognition not supported");
        return;
      }

      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Configure recognition with stable settings
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognitionRef.current = recognition;

        // Test network connectivity on initialization
        testSpeechService().then(connected => {
          if (!connected) {
            console.warn("Speech service connectivity test failed");
            setNetworkErrorOccurred(true);
          }
        });

      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        setSpeechSupported(false);
      }
    };

    initializeSpeech();

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error("Error cleaning up recognition:", error);
        }
        recognitionRef.current = null;
      }
    };
  }, [checkSpeechSupport, testSpeechService]);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      setPermissionGranted(false);

      if (error.name === 'NotAllowedError') {
        alert("Microphone access denied. Please allow microphone permissions and try again.");
      } else if (error.name === 'NotFoundError') {
        alert("No microphone found. Please connect a microphone and try again.");
      } else {
        alert("Error accessing microphone. Please check your microphone settings.");
      }
      return false;
    }
  }, []);

  const parseSpokenMove = useCallback((text) => {
    if (!text) return null;

    const wordToNum = {
      one: "1", two: "2", three: "3", four: "4",
      five: "5", six: "6", seven: "7", eight: "8",
      ate: "8", to: "2", too: "2", for: "4", fore: "4"
    };

    let cleaned = text.toLowerCase()
      .replace(/\b(one|two|three|four|five|six|seven|eight|ate|to|too|for|fore)\b/g, match => wordToNum[match] || match)
      .replace(/[^a-h1-8\s]/g, "")
      .replace(/\s+/g, "");

    console.log("Cleaned text:", cleaned);

    const squares = cleaned.match(/[a-h][1-8]/g);
    if (squares && squares.length >= 2) {
      const move = { from: squares[0], to: squares[1], promotion: "q" };
      console.log("Parsed move:", move);
      return move;
    }

    console.warn(`❌ Could not find a valid move in text: "${text}" (cleaned: "${cleaned}")`);
    return null;
  }, []);

  // const processVoiceCommand = useCallback((text) => {
  //   console.log("Processing voice command:", text);
  //   const move = parseSpokenMove(text);
  //   if (move) {
  //     const copy = new Chess(gameState.fen());
  //     const result = copy.move(move);
  //     if (result) {
  //       console.log("✅ Valid move executed:", result);
  //       onMove(result, copy);
  //       setNetworkErrorOccurred(false);
  //       setRetryCount(0);
  //     } else {
  //       console.warn("⚠️ Invalid or illegal move:", move);
  //       alert(`Invalid move: ${move.from} to ${move.to}. Please try again.`);
  //     }
  //   } else {
  //     alert(`Could not understand the move from: "${text}". Please say something like "e2 to e4"`);
  //   }
  // }, [gameState, onMove, parseSpokenMove]);

  const processVoiceCommand = useCallback((text) => {
    console.log("Processing voice command:", text);
    const move = parseSpokenMove(text);
    if (move) {
      // Call onDrop instead of duplicating the logic
      const success = onDrop(move.from, move.to);
      if (success) {
        console.log("✅ Valid move executed via voice:", move);
        setNetworkErrorOccurred(false);
        setRetryCount(0);
      } else {
        console.warn("⚠️ Invalid or illegal move:", move);
        alert(`Invalid move: ${move.from} to ${move.to}. Please try again.`);
      }
    } else {
      alert(`Could not understand the move from: "${text}". Please say something like "e2 to e4"`);
    }
  }, [onDrop, parseSpokenMove]); // Remove gameState and onMove from dependencies, add onDrop


  const startListening = useCallback(async () => {
    console.log("🔍 Attempting to start voice recognition...");
    console.log("📍 Current URL:", window.location.href);
    console.log("🔒 Protocol:", window.location.protocol);
    console.log("🌐 Online status:", navigator.onLine);

    if (isRecordingRef.current || !recognitionRef.current) {
      console.log("❌ Already recording or no recognition available");
      return;
    }

    // Reset error states
    setNetworkErrorOccurred(false);

    // Test network connectivity first
    console.log("🌐 Testing network connectivity...");
    const isConnected = await testSpeechService();
    if (!isConnected) {
      console.error("❌ Network connectivity test failed");
      setNetworkErrorOccurred(true);
      alert("Network error: Cannot connect to speech recognition service. Please check your internet connection and try again.");
      return;
    }
    console.log("✅ Network connectivity test passed");

    // Check permissions
    console.log("🎙️ Requesting microphone permission...");
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      console.log("❌ Microphone permission denied");
      return;
    }
    console.log("✅ Microphone permission granted");

    try {
      setSpokenText("");
      spokenTextRef.current = "";
      isRecordingRef.current = true;

      const recognition = recognitionRef.current;

      // Clear any existing handlers to prevent conflicts
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;

      // Add a timeout for starting recognition
      const startTimeout = setTimeout(() => {
        if (isRecordingRef.current && !recording) {
          console.error("⏰ Speech recognition start timeout");
          isRecordingRef.current = false;
          setNetworkErrorOccurred(true);
          recognition.abort();
          alert("Speech recognition failed to start. This may be due to network issues or browser restrictions.");
        }
      }, 10000); // 10 second timeout

      // Set up event handlers
      recognition.onstart = () => {
        clearTimeout(startTimeout);
        console.log("✅ Speech recognition started successfully");
        setRecording(true);
        setNetworkErrorOccurred(false);
      };

      recognition.onresult = (event) => {
        let fullTranscript = "";
        let isFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          fullTranscript += result[0].transcript;
          if (result.isFinal) {
            isFinal = true;
          }
        }

        console.log("📝 Speech result:", fullTranscript, "Final:", isFinal);
        spokenTextRef.current = fullTranscript;
        setSpokenText(fullTranscript);

        // If we have a final result, process it immediately
        if (isFinal && fullTranscript.trim()) {
          console.log("🎯 Processing final command:", fullTranscript);
          recognition.stop(); // Stop listening after getting final result
        }
      };

      recognition.onend = () => {
        clearTimeout(startTimeout);
        console.log("🛑 Speech recognition ended normally");
        isRecordingRef.current = false;
        setRecording(false);

        if (spokenTextRef.current.trim()) {
          console.log("🎯 Processing command:", spokenTextRef.current);
          processVoiceCommand(spokenTextRef.current);
        } else {
          console.log("⚠️ No speech detected");
        }
      };

      recognition.onerror = (event) => {
        clearTimeout(startTimeout);
        console.error("❌ Speech recognition error:", event.error);
        console.error("🔍 Error details:", event);

        isRecordingRef.current = false;
        setRecording(false);

        switch (event.error) {
          case 'network':
            console.error("🌐 Network error - Google's speech service unavailable");
            setNetworkErrorOccurred(true);
            // Don't show alert immediately, let user try retry button
            break;
          case 'service-not-allowed':
            console.error("🚫 Speech service not allowed");
            setNetworkErrorOccurred(true);
            alert("Speech recognition service is blocked. This may be due to network restrictions or privacy settings.");
            break;
          case 'not-allowed':
            console.error("🚫 Permission denied");
            alert("Microphone permission was denied. Please allow microphone access in your browser settings and refresh the page.");
            break;
          case 'no-speech':
            console.log("🔇 No speech detected - user can try again");
            // Don't set network error for no speech
            break;
          case 'audio-capture':
            console.error("🎙️ Audio capture error");
            alert("Microphone error: Cannot capture audio. Please check your microphone connection and permissions.");
            break;
          case 'aborted':
            console.log("⏹️ Speech recognition was aborted");
            break;
          default:
            console.error(`❓ Unknown error: ${event.error}`);
            setNetworkErrorOccurred(true);
            break;
        }
      };

      console.log("🚀 Starting speech recognition...");
      recognition.start();

    } catch (error) {
      console.error("💥 Exception starting speech recognition:", error);
      isRecordingRef.current = false;
      setRecording(false);
      setNetworkErrorOccurred(true);
      alert(`Failed to start voice recognition: ${error.message}`);
    }
  }, [requestMicrophonePermission, processVoiceCommand, testSpeechService, recording]);

  const stopListening = useCallback(() => {
    if (!isRecordingRef.current || !recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
      isRecordingRef.current = false;
      setRecording(false);
    }
  }, []);

  const handleTextInput = useCallback((e) => {
    if (e.key === 'Enter') {
      processVoiceCommand(e.target.value);
      e.target.value = '';
    }
  }, [processVoiceCommand]);



  if (!gameState) return null;

  return (
    <div className={`relative bg-white rounded-xl p-3 shadow-lg border ${className}`}>
      {status === "win" && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={400} recycle={false} />}

      <Chessboard
        position={gameState.fen()}
        boardOrientation={isBlack ? "black" : "white"}
        onPieceDrop={onDrop}
        isDraggablePiece={({ piece }) => {
          if (!gameStarted || status || mode === "voice" || !piece) {
            return false;
          }
          const isMyTurn = currentPlayer === color;
          const myPiecePrefix = color === 'black' ? 'b' : 'w';
          return isMyTurn && piece.startsWith(myPiecePrefix);
        }}
      />

      <div className="mt-4 flex flex-wrap justify-center items-center gap-4 relative z-20">
        <button
          className={`font-semibold px-4 py-2 rounded ${status
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600'
            } text-white`}
          onClick={handleDraw}
          disabled={!!status}
        >
          🤝 Offer Draw
        </button>

        <button
          className={`font-semibold px-4 py-2 rounded ${status
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          onClick={handleResign}
          disabled={!!status}
        >
          🏳️ Resign
        </button>

        {mode === "voice" && speechSupported && !networkErrorOccurred && !recording && (
          <button
            onClick={startListening}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            🎙️ Start Voice
          </button>
        )}

        {mode === "voice" && speechSupported && networkErrorOccurred && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                console.log("🔄 Manually retrying voice recognition...");
                setNetworkErrorOccurred(false);
                setRetryCount(0);
                startListening();
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded"
            >
              🔄 Retry Voice Recognition
            </button>
            <div className="text-xs text-red-600 text-center">
              Speech recognition failed. Try the retry button or use text input below.
            </div>
          </div>
        )}

        {mode === "voice" && speechSupported && !networkErrorOccurred && recording && (
          <button
            onClick={stopListening}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded animate-pulse"
          >
            🛑 Stop Recording
          </button>
        )}

        {mode === "voice" && (!speechSupported || networkErrorOccurred) && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-red-600 text-sm text-center">
              {!speechSupported
                ? `Voice recognition not supported (${browserInfo}). Use text input below:`
                : "Network error - using text input:"}
            </div>
            <input
              type="text"
              placeholder="Type your move (e.g., 'e2 e4')"
              className="px-3 py-2 border rounded text-sm w-48"
              onKeyPress={handleTextInput}
            />
            <div className="text-xs text-gray-500 text-center">
              Press Enter to make move
            </div>
          </div>
        )}
      </div>

      {mode === "voice" && recording && (
        <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <strong>Listening...</strong>
          </div>
          {spokenText && (
            <div className="mt-1 text-gray-700">
              Heard: "{spokenText}"
            </div>
          )}
          <div className="mt-1 text-xs text-gray-500">
            Say your move like "e2 to e4" or "knight f3"
          </div>
        </div>
      )}

      {mode === "voice" && !speechSupported && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
          <strong>Browser: {browserInfo}</strong>
          <div className="mt-1">
            <strong>Voice recognition requirements:</strong>
            <ul className="mt-1 text-xs list-disc list-inside">
              <li>Use Chrome browser (recommended)</li>
              <li>Ensure you're on HTTPS or localhost</li>
              <li>Allow microphone permissions</li>
              <li>Avoid Brave browser (blocks for privacy)</li>
            </ul>
          </div>
        </div>
      )}

      <AnimatePresence>
        {status && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-6 rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              {status === "draw" && "🤝 Game Draw!"}
              {status === "win" && "🏆 You Won!"}
              {status === "lose" && "💔 You Lost!"}
            </h2>
            {(status === "draw" || status === "lose") && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                {status === "draw" ? "♟️♟️♟️" : "😢"}
              </motion.div>
            )}
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 bg-white text-black px-6 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChessBoard;
