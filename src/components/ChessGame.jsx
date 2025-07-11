import { useEffect, useState} from 'react';
import { RotateCcw, MessageCircle } from 'lucide-react';
import PlayerCard from './PlayerCard';
import MoveHistory from './MoveHistory';
import Chat from './Chat';
import ChessBoard from './ChessBoard';
import MobilePanel from './MobilePanel';
import socket from "../socket/SocketConnection.jsx";
import chatStorage from "../storage/ChatStorage.js";
import { Chess } from "chess.js";
import { toast } from 'react-toastify';
import { getSession, setSession, clearGameSession } from '../utils/session.js';

const useWindowSize = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
};

const ChessGame = ({color, roomId, userId, commentary, mode}) => {
  console.log(color, userId, roomId, commentary, mode);
  const screenWidth = useWindowSize();
  const isMobile = screenWidth <= 690;
  const [currentPlayer, setCurrentPlayer] = useState(getSession("currentPlayer") || 'white');
  const [showMoveHistory, setShowMoveHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [moves, setMoves] = useState(getSession("moves") || []);
  const [gameState, setGameState] = useState(() => {
  const fen = getSession("fen"); 
  try {
    return fen ? new Chess(fen) : new Chess();  
  } catch {
    return new Chess();
  }
});
  const [gameId, setgameId] = useState(getSession("gameId") || null);
  const [status, setStatus] = useState(null);
  const[opponentSocketId, setopponentSocketId] = useState(null);
  const [drawOfferVisible, setDrawOfferVisible] = useState(false);
  // const [gameStarted, setGameStarted] = useState(getSession("gameStarted") || false);
  const [gameStarted, setGameStarted] = useState(() => getSession("gameStarted") === "true");
  
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [messages, setMessages] = useState(() => {
  return chatStorage.get(roomId, userId);
});

console.log("le re lund ke1", getSession("currentPlayer"));
console.log("le re lund ke2", getSession("fen"));
console.log("le re lund ke3", getSession("moves"));
console.log("le re lund ke4", getSession("gameId"));
console.log("le re lund ke5", getSession("gameStarted"));
console.log(userId);
const player1 = {
    name: "Opponent",
    initialTime: sessionStorage.getItem("time"),
    isActive: currentPlayer !== color
  };
  
  const player2 = {
    name: "You",
    initialTime: sessionStorage.getItem("time"),
    isActive: currentPlayer === color
  };




function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.pitch = 1.1;
  u.rate = 1;
  window.speechSynthesis.speak(u);
}

  useEffect(() => {
  if (userId && roomId && color) {
    socket.emit("joinRoom", { userId, roomId, color });
  }
}, []);

useEffect(() => {
  const handleD = ()=>{
      setDrawOfferVisible(true);
  }

  const handleR = ()=>{
   setStatus("win");
  }

  const DrawA = ()=>{
    setStatus("draw")
  }

  const DrawR = ()=>{
      toast.info("Opponent rejected your draw offer ❌");
  }
  const handleBothPlayersJoined = async ({ gameId, fen, moves, opponentSocketId}) => {
       setopponentSocketId(opponentSocketId);
       setgameId(gameId);
      //  setGameStarted(true);
       console.log("Both players joined. Initial state:", { fen, moves });

       const { Chess } = await import("chess.js");
        const chess = new Chess(fen);
      
      setGameState(chess);
      setMoves(moves || []);


      const nextTurn = chess.turn() === 'w' ? 'white' : 'black';
      setCurrentPlayer(nextTurn);
      

      setSession("gameId", gameId);
      setSession("fen", fen);
      setSession("moves", moves || []);
      setSession("currentPlayer", nextTurn);
      setSession("gameStarted", "true");

      setGameStarted(true);
  };

  socket.on("bothPlayersJoined", handleBothPlayersJoined);

  socket.on("Opponent Draw", handleD);
  socket.on("Opponent Resign", handleR);
  socket.on("DrawAccepted", DrawA);
  socket.on("DrawDeclined", DrawR);

  return () => {
    socket.off("bothPlayersJoined", handleBothPlayersJoined);
    socket.off("Opponent Draw", handleD);
    socket.off("Opponent Resign", handleR);
    socket.off("DrawAccepted", DrawA);
    socket.off("DrawDeclined", DrawR);
  };
}, []);

  
  useEffect(() => {
  console.log("I AM LISTENING!");
  const handleReceiveMessage = (serverMessage) => {
    console.log("Receiving the message!");
    console.log(serverMessage);
    const incomingMsg = {
      id:Date.now(),
      message: serverMessage.message,
      isSent: false,
      time: new Date(serverMessage.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    handleSendMessage(incomingMsg);
  };
  socket.on("ReceiveMessage", handleReceiveMessage);
  return () => {
    socket.off("ReceiveMessage", handleReceiveMessage);
  };
}, []);


useEffect(() => {
  const handleReceiveMove = async ({ move, fen, gameStatus, winner, allMoves }) => {
    console.log("Received move from opponent:", move);
    
    const pkg = await import("chess.js");
    const { Chess } = pkg;
    const chess = new Chess(fen); 
    
    setGameState(chess);

setSession("fen", chess.fen());



    setMoves(allMoves);
    setSession("moves", allMoves);
    

    const nextPlayer = chess.turn() === 'w' ? 'white' : 'black';
  setCurrentPlayer(nextPlayer);
  setSession("currentPlayer", nextPlayer)
  
    // Check for end game status
    if (gameStatus === "drawn" || gameStatus === "finished") {
      setStatus(true);
    }

    // 🎙️ Trigger commentary only if mode is not off
    if (commentary && commentary === "hype") {
      const lastMoves = allMoves.map(m => m.san || m); // fallback in case moves aren't parsed
      const isUserMove = false;

      const prompt = {
        move: move.san,
        fen,
        lastMoves,
        isUserMove,
        mode: commentary
      };

      console.log(prompt);

      try {
        const res = await fetch("https://chesswithbenefits-server.onrender.com/api/commentary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });

        const data = await res.json();
        console.log("commentary i got", data);
        if (data.commentary) speak(data.commentary);
      } catch (err) {
        console.error("AI commentary error:", err);
      }
    }
  };



  socket.on("receiveMove", handleReceiveMove);

  return () => {
    socket.off("receiveMove", handleReceiveMove);
  };
}, [commentary, moves, userId]);



  console.log(messages);
 
  const handleMove = async (move, updatedGame) => {
  socket.emit("SendMove", { move, gameId, userId, roomId });
  const newMoves = [...moves, move.san];
  setSession("moves", newMoves);
  setMoves(newMoves);

  setGameState(updatedGame);
setSession("fen", updatedGame.fen());


  const nextPlayer = updatedGame.turn() === 'w' ? 'white' : 'black';
  setCurrentPlayer(nextPlayer);
  setSession("currentPlayer", nextPlayer)
  if (commentary && commentary !== "off") {
    const lastMoves = [...moves, move.san]; 
    const fen = updatedGame.fen();
    const isUserMove = true;

    const prompt = {
      move: move.san,
      fen,
      lastMoves,
      isUserMove,
      mode: commentary
    }

    try {
      const res = await fetch("https://chesswithbenefits-server.onrender.com/api/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      console.log("commentary i got" ,data);
      speak(data.commentary);
    } catch (err) {
      console.error("AI commentary error:", err);
    }
  }

};


  const handleSendMessage = (message) => {
    chatStorage.add(roomId,userId, message);
    setMessages(prevMessages => [...prevMessages, message]);
  };




const handleDraw = ()=>{
  socket.emit("Draw", {roomId});
}

const handleResign = ()=>{
  setStatus("lose");
  socket.emit("Resign", {roomId, gameId, userId});
}

const acceptDraw = () => {
  socket.emit("DrawAccepted", { roomId, gameId});
  setDrawOfferVisible(false);
  setStatus("draw");
};

const declineDraw = () => {
  socket.emit("DrawDeclined", { roomId});
  setDrawOfferVisible(false);
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-1 lg:p-4">
      {/* Desktop Layout (visible ≥ 691px) */}
      {!isMobile && (
        <div className="grid grid-cols-4 gap-4 max-w-6xl mx-auto">
          <div className="space-y-4">
            <PlayerCard
              playerName={player1.name}
              initialTime={player1.initialTime}
              isActive={player1.isActive}
              isPlayer1={true}
              opponentSocketId={opponentSocketId}
            />
            <MoveHistory moves={moves} className="h-80" />
          </div>

          <div className="col-span-2 min-h-[500px]">
            <ChessBoard
              color={color}
              onMove={handleMove}
              gameState={gameState}
              status={status}
              mode={mode}
              handleDraw={handleDraw}
              handleResign={handleResign}
              gameStarted={gameStarted}
              isDraggablePiece={({ piece }) => {
    if (!piece) return false;

    
    return (isBlack && piece.startsWith('b')) || (!isBlack && piece.startsWith('w'));
  }}
            />
          </div>

          <div className="space-y-4">
            <PlayerCard
              playerName={player2.name}
              initialTime={player2.initialTime}
              isActive={player2.isActive}
            />
            <Chat
              className="h-80"
              messages={messages}
              onSendMessage={handleSendMessage}
              roomId={roomId}
            />
          </div>
        </div>
      )}

      {/* Mobile Layout (≤ 690px) */}
      {isMobile && (
        <div className="w-full max-w-[400px] mx-auto space-y-3 px-2">
          {/* Players */}
          <div className="grid grid-cols-2 gap-2">
            <PlayerCard
              playerName={player1.name}
              initialTime={player1.initialTime}
              isActive={player1.isActive}
              isPlayer1={true}
              className="h-44"
              opponentSocketId={opponentSocketId}
            />
            <PlayerCard
              playerName={player2.name}
              initialTime={player2.initialTime}
              isActive={player2.isActive}
              className="h-44"
            />
          </div>

          {/* ChessBoard */}
          <div className="h-[450px] w-full">
            <ChessBoard
            color={color}
              onMove={handleMove}
              gameState={gameState}
              status={status}
              mode={mode}
              handleDraw={handleDraw}
              handleResign={handleResign}
              gameStarted={gameStarted}
            />
          </div>

          {/* FAB Buttons */}
          <div className="fixed bottom-3 left-3 right-3 flex justify-between pointer-events-none z-10">
            <button
              onClick={() => setShowMoveHistory(true)}
              className="w-11 h-11 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 hover:scale-110 pointer-events-auto"
            >
              <RotateCcw className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="w-11 h-11 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 hover:scale-110 pointer-events-auto"
            >
              <MessageCircle className="w-4 h-4 mx-auto" />
            </button>
          </div>

          {/* Panels */}
          <MobilePanel
            isOpen={showMoveHistory}
            onClose={() => setShowMoveHistory(false)}
            title="Move History"
          >
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <MoveHistory moves={moves} />
            </div>
          </MobilePanel>

          <MobilePanel
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            title="Chat"
          >
            <Chat
              className="h-full border-0 shadow-none rounded-none max-h-[60vh] overflow-y-auto"
              messages={messages}
              onSendMessage={handleSendMessage}
              roomId={roomId}
            />
          </MobilePanel>
        </div>
      )}


      {drawOfferVisible && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🤝 Opponent offered a draw
      </h2>
      <p className="mb-6 text-gray-600">Do you want to accept it?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={acceptDraw}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          ✅ Accept
        </button>
        <button
          onClick={declineDraw}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          ❌ Decline
        </button>
      </div>
    </div>
  </div>
)}


{showBackWarning && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        ⚠️ Are you sure you want to leave?
      </h2>
      <p className="mb-6 text-gray-600">Please finish the game before going to dashboard.</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowBackWarning(false)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          🚀 Continue Game
        </button>
        <button
          onClick={() => {
            setStatus("lose");
            socket.emit("Resign", { roomId, gameId, userId });
            setShowBackWarning(false);
            

             window.removeEventListener('popstate', handleBackNavigation); // Optional
    window.history.go(-3); // Go back to real page
            
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          🔚 Finish Game
        </button>
      </div>
    </div>
  </div>
)}


    </div>


  );
};

export default ChessGame;
