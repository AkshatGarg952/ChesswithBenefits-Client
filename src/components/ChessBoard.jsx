import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = 'en-US';

const ChessBoard = ({ className = "", color, onMove, gameState, status, mode, handleDraw, handleResign, gameStarted }) => {
  const isBlack = color === "black";
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({ width: 300, height: 300 });
  const [recording, setRecording] = useState(false);


  
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

useEffect(() => {
  // If mode is switched away from voice, stop listening
  if (mode !== "voice") {
    stopListening();
  }

  return () => {
    stopListening(); // cleanup
  };
}, [mode]);



const startListening = () => {
  if (!recording) {
    try {
      recognition.start();
      setRecording(true);
      console.log("🎙️ Listening for one command...");
    } catch (e) {
      console.warn("⚠️ Failed to start recognition:", e);
    }
  }
};

const stopListening = () => {
  try {
    recognition.stop();
    setRecording(false);
    console.log("🛑 Voice recognition stopped.");
  } catch (e) {
    console.warn("⚠️ Failed to stop recognition:", e);
  }
};


recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
  console.log("🎤 Heard:", transcript);

  if (transcript.startsWith("jarvis")) {
    const command = transcript.replace("jarvis", "").trim();
    handleVoiceCommand(command);
  } else {
    console.log("Ignoring non-Jarvis command");
  }
};
  

recognition.onend = () => {
  console.log("🎤 onend triggered");
  setRecording(false); // Make sure buttons update properly
};




recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();

  console.log("🎤 Heard:", transcript);

  if (transcript.startsWith("jarvis")) {
    const command = transcript.replace("jarvis", "").trim();
    handleVoiceCommand(command);
  } else {
    console.log("Ignoring non-Jarvis command");
  }
};

const handleVoiceCommand = (command) => {
  const move = parseSpokenMove(command);
  console.log("♟️ Parsed move from voice:", move);

  if (move) {
    const copy = new Chess(gameState.fen());
    const result = copy.move(move);
    if (result) {
      console.log("✅ Move made by voice:", result);
      onMove(result, copy);
    } else {
      console.warn("❌ Invalid move:", move);
    }
  } else {
    console.warn("❌ Could not parse move from command:", command);
  }
};



  const onDrop = (from, to) => {
    const copy = new Chess(gameState.fen());
    const move = copy.move({ from, to, promotion: "q" });
    if (move) {
      onMove(move, copy);
      return true;
    }
    return false;
  };

const parseSpokenMove = (text) => {
  const wordToNum = {
    one: "1", two: "2", three: "3", four: "4",
    five: "5", six: "6", seven: "7", eight: "8",
  };

  // Normalize input
  let cleaned = text
    .toLowerCase()
    .replace(/\b(one|two|three|four|five|six|seven|eight)\b/g, (match) => wordToNum[match])
    .replace(/\b(to|too|two)\b/g, " ") // ignore "to"/"two"
    .replace(/\bmove\b/g, "") // ignore word "move"
    .replace(/[^a-h1-8\s]/g, "") // strip non-chess junk
    .replace(/\s+/g, " ")
    .trim();

  console.log("🧹 Cleaned voice input:", cleaned);

  const tokens = cleaned.split(" ");
  if (tokens.length < 2) {
    console.warn("⚠️ Not enough tokens to form a move:", tokens);
    return null;
  }

  // Try combining tokens into two valid squares
  const validSquare = (s) => /^[a-h][1-8]$/.test(s);
  const possibleCombos = [];

  // Try all 2-token combinations
  for (let i = 0; i < tokens.length - 1; i++) {
    const from = tokens[i] + tokens[i + 1];
    if (validSquare(from)) {
      for (let j = i + 2; j < tokens.length - 1; j++) {
        const to = tokens[j] + tokens[j + 1];
        if (validSquare(to)) {
          possibleCombos.push({ from, to });
        }
      }
    }
  }

  if (possibleCombos.length > 0) {
    const move = possibleCombos[0]; // pick the first valid one
    return { ...move, promotion: "q" };
  }

  console.warn("❌ No valid from/to square found in:", tokens);
  return null;
};


  if (!gameState) return null;

  return (
    <div className={`relative bg-white rounded-xl p-3 shadow-lg border ${className}`}>
      {status === "win" && (
        <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={400} recycle={false} />
      )}

      <Chessboard
        position={gameState.fen()}
        boardOrientation={isBlack ? "black" : "white"}
        onPieceDrop={onDrop}
        isDraggablePiece={({ piece }) => {
          console.log("🚫 Piece drag check:", {
    piece,
    status,
    mode,
    gameStarted,
    color,
    isBlack,
    canDrag: !!piece && !status && mode !== "voice" && gameStarted && (isBlack ? piece.startsWith("b") : piece.startsWith("w")),
  });
          if (!piece || status || mode === "voice" || !gameStarted) return false;
          return (isBlack ? piece.startsWith("b") : piece.startsWith("w"));
        }}
      />

      <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
  <button
    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
    onClick={handleDraw}
  >
    🤝 Offer Draw
  </button>

  <button
    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
    onClick={handleResign}
  >
    🏳️ Resign
  </button>

  {mode === "voice" && (
    <>
      <button
        onClick={startListening}
        disabled={recording}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
      >
        🎙 Start Voice
      </button>

      <button
        onClick={stopListening}
        disabled={!recording}
        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
      >
        🛑 Cancel Voice
      </button>
    </>
  )}
</div>




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
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                {status === "draw" ? "♟️♟️♟️" : "😢"}
              </motion.div>
            )}
            <button onClick={() => navigate("/dashboard")} className="mt-6 bg-white text-black px-6 py-2 rounded-full">
              Go to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>


  );
};

export default ChessBoard;