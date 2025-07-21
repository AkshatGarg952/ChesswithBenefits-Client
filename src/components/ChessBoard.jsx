import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const ChessBoard = ({ className = "", color, onMove, gameState, status, mode, handleDraw, handleResign, gameStarted }) => {
  const isBlack = color === "black";
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({ width: 300, height: 300 });

  const [recording, setRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const spokenTextRef = useRef("");
  const recognitionRef = useRef(null);
  const isStoppingRef = useRef(false); // Add flag to track manual stopping

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Add these settings to improve stability
    recognition.maxAlternatives = 1;
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const parseSpokenMove = (text) => {
    if (!text) return null;
    const wordToNum = {
      one: "1", two: "2", three: "3", four: "4",
      five: "5", six: "6", seven: "7", eight: "8", 'ate': '8'
    };
    let cleaned = text.toLowerCase()
      .replace(/\b(one|two|three|four|five|six|seven|eight|ate)\b/g, match => wordToNum[match])
      .replace(/[^a-h1-8]/g, "");
    const squares = cleaned.match(/[a-h][1-8]/g);
    if (squares && squares.length >= 2) {
      console.log(`✅ Parsed move: from ${squares[0]} to ${squares[1]}`);
      return { from: squares[0], to: squares[1], promotion: "q" };
    }
    console.warn(`❌ Could not find a valid move in text: "${text}"`);
    return null;
  };

  const processVoiceCommand = (text) => {
    const move = parseSpokenMove(text);
    if (move) {
      const copy = new Chess(gameState.fen());
      const result = copy.move(move);
      if (result) {
        onMove(result, copy);
      } else {
        console.warn("⚠️ Invalid or illegal move:", move);
      }
    }
  };

  const startListening = async () => {
    if (recording || !recognitionRef.current) return;
    
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    // Check internet connection
    if (!navigator.onLine) {
      alert("No internet connection. Speech recognition requires an internet connection.");
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setSpokenText("");
      spokenTextRef.current = "";
      isStoppingRef.current = false; // Reset stopping flag
      
      const recognition = recognitionRef.current;
      
      // Clear any existing event handlers to avoid duplicates
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      
      // Set up event handlers
      recognition.onstart = () => {
        console.log("Speech recognition started");
        setRecording(true);
      };

      recognition.onresult = (event) => {
        let fullTranscript = "";
        let finalTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            fullTranscript += transcript;
          }
        }
        
        const currentText = finalTranscript || fullTranscript;
        spokenTextRef.current = currentText;
        setSpokenText(currentText);
        console.log("Current transcript:", currentText);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setRecording(false);
        
        // Only process the command if we manually stopped (not due to error or timeout)
        if (isStoppingRef.current && spokenTextRef.current.trim()) {
          processVoiceCommand(spokenTextRef.current);
        }
        
        isStoppingRef.current = false;
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setRecording(false);
        isStoppingRef.current = false;
        
        switch(event.error) {
          case 'not-allowed':
            alert("Microphone permission was denied. Please allow microphone access and try again.");
            break;
          case 'no-speech':
            console.log("No speech detected - this is normal, recognition will continue");
            // Don't show alert for no-speech as it's common
            break;
          case 'audio-capture':
            alert("No microphone was found. Please check your microphone connection.");
            break;
          case 'network':
            alert("Network error: Please check your internet connection and try again. You can also try refreshing the page.");
            break;
          case 'service-not-allowed':
            alert("Speech recognition service is not allowed. This may be due to browser settings or network restrictions.");
            break;
          case 'aborted':
            console.log("Speech recognition was aborted");
            break;
          default:
            console.warn(`Speech recognition error: ${event.error}`);
            alert(`Speech recognition error: ${event.error}. Try refreshing the page or using a different browser.`);
        }
      };

      // Start recognition
      recognition.start();
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecording(false);
      
      if (error.name === 'NotAllowedError') {
        alert("Microphone access denied. Please allow microphone permissions in your browser settings.");
      } else if (error.name === 'NotFoundError') {
        alert("No microphone found. Please connect a microphone and try again.");
      } else {
        alert("Error starting voice recognition. Please check your microphone settings.");
      }
    }
  };

  const stopListening = () => {
    if (!recording || !recognitionRef.current) return;
    
    isStoppingRef.current = true; // Set flag to indicate manual stop
    recognitionRef.current.stop();
  };

  const onDrop = (from, to) => {
    const copy = new Chess(gameState.fen());
    const move = copy.move({ from, to, promotion: "q" });
    console.log("Move attempt:", move);
    if (move) {
      console.log("Valid move");
      onMove(move, copy);
      return true;
    }
    return false;
  };

  if (!gameState) return null;

  const isVoiceSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  return (
    <div className={`relative bg-white rounded-xl p-3 shadow-lg border ${className}`}>
      {status === "win" && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={400} recycle={false} />}
      <Chessboard
        position={gameState.fen()}
        boardOrientation={isBlack ? "black" : "white"}
        onPieceDrop={onDrop}
        isDraggablePiece={({ piece }) => !(!piece || status || mode === "voice" || !gameStarted) && (isBlack ? piece.startsWith("b") : piece.startsWith("w"))}
      />
      
      <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded" onClick={handleDraw}>🤝 Offer Draw</button>
        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded" onClick={handleResign}>🏳️ Resign</button>
        {mode === "voice" && isVoiceSupported && !recording && (
          <button onClick={startListening} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded">🎙️ Start Voice</button>
        )}
        {mode === "voice" && isVoiceSupported && recording && (
          <button onClick={stopListening} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded animate-pulse">🛑 Stop Voice & Make Move</button>
        )}
        {mode === "voice" && !isVoiceSupported && (
          <div className="text-red-600 text-sm">Voice recognition not supported in this browser</div>
        )}
      </div>

      {/* Add visual feedback for voice recognition */}
      {mode === "voice" && recording && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-blue-700 font-medium">Listening...</span>
          </div>
          {spokenText && (
            <div className="text-sm text-gray-700">
              <strong>Heard:</strong> "{spokenText}"
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Say your move like "e2 to e4" or "knight to f3"
          </div>
        </div>
      )}
      
      <AnimatePresence>
        {status && (
          <motion.div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-6 rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
            <h2 className="text-3xl font-bold mb-4">
              {status === "draw" && "🤝 Game Draw!"}
              {status === "win" && "🏆 You Won!"}
              {status === "lose" && "💔 You Lost!"}
            </h2>
            {(status === "draw" || status === "lose") && (<motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>{status === "draw" ? "♟️♟️♟️" : "😢"}</motion.div>)}
            <button onClick={() => navigate("/dashboard")} className="mt-6 bg-white text-black px-6 py-2 rounded-full">Go to Dashboard</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChessBoard;
