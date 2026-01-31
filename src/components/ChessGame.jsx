import { useEffect, useState } from 'react';
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

const ChessGame = ({ color, roomId, userId, commentary, mode }) => {
  const screenWidth = useWindowSize();
  const isMobile = screenWidth <= 690;

  // --- PERSISTENCE FIX START ---
  // If props are missing (e.g., after reload), try to get them from session
  const effectiveUserId = userId || getSession("userId");
  const effectiveRoomId = roomId || getSession("roomId");
  const effectiveColor = color || getSession("color");
  const effectiveCommentary = commentary || getSession("commentary");
  const effectiveMode = mode || getSession("mode");

  useEffect(() => {
    if (userId) setSession("userId", userId);
    if (roomId) setSession("roomId", roomId);
    if (color) setSession("color", color);
    if (commentary) setSession("commentary", commentary);
    if (mode) setSession("mode", mode);
  }, [userId, roomId, color, commentary, mode]);
  // --- PERSISTENCE FIX END ---

  const [playerColor, setPlayerColor] = useState(effectiveColor);
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
  const [opponentSocketId, setOpponentSocketId] = useState(null);
  const [drawOfferVisible, setDrawOfferVisible] = useState(false);
  const [gameStarted, setGameStarted] = useState(() => getSession("gameStarted") === "true");
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [messages, setMessages] = useState(() => chatStorage.get(effectiveRoomId, effectiveUserId));
  const [gameOverData, setGameOverData] = useState(null);

  const [whiteTimeLeft, setWhiteTimeLeft] = useState(600);
  const [blackTimeLeft, setBlackTimeLeft] = useState(600);


  useEffect(() => {
    const handleGameOver = (data) => {

      setGameOverData(data);
      setStatus(data.status);
    };

    socket.on("gameOver", handleGameOver);

    return () => {
      socket.off("gameOver", handleGameOver);
    };
  }, []);


  const isBlack = playerColor === 'black';
  const [player1, setPlayer1] = useState({
    name: "Opponent",
    initialTime: isBlack ? blackTimeLeft : whiteTimeLeft,
    isActive: currentPlayer !== playerColor
  });

  const [player2, setPlayer2] = useState({
    name: "You",
    initialTime: isBlack ? whiteTimeLeft : blackTimeLeft,
    isActive: currentPlayer === playerColor
  });

  function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.pitch = 1.1;
    u.rate = 1;
    window.speechSynthesis.speak(u);
  }

  useEffect(() => {
    if (effectiveUserId && effectiveRoomId) {

      socket.emit("joinRoom", { userId: effectiveUserId, roomId: effectiveRoomId, color: effectiveColor });

      const handleColorAssignment = (assignedColor) => {

        setPlayerColor(assignedColor);
      };

      socket.on("assignedColor", handleColorAssignment);

      return () => {
        socket.off("assignedColor", handleColorAssignment);
      };
    }
  }, [effectiveUserId, effectiveRoomId, effectiveColor]);

  useEffect(() => {
    const handleOpponentDisconnected = () => {
      toast.error("Your opponent has disconnected.");
      setOpponentSocketId(null);
      setGameStarted(false);
    };

    socket.on("opponent-disconnected", handleOpponentDisconnected);

    return () => {
      socket.off("opponent-disconnected", handleOpponentDisconnected);
    };
  }, []);

  useEffect(() => {
    const handleBothPlayersJoined = async ({ gameId, fen, moves, opponentSocketId, whiteTimeLeft, blackTimeLeft }) => {

      setWhiteTimeLeft(whiteTimeLeft);
      setBlackTimeLeft(blackTimeLeft);
      if (playerColor === 'white') {
        setPlayer2(prev => ({ ...prev, initialTime: whiteTimeLeft }));
        setPlayer1(prev => ({ ...prev, initialTime: blackTimeLeft }));
      } else {
        setPlayer2(prev => ({ ...prev, initialTime: blackTimeLeft }));
        setPlayer1(prev => ({ ...prev, initialTime: whiteTimeLeft }));
      }
      setOpponentSocketId(opponentSocketId);

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

      setgameId(gameId);
      setGameStarted(true);
    };

    const handleOpponentDraw = () => setDrawOfferVisible(true);
    const handleOpponentResign = () => setStatus("win");
    const handleDrawAccepted = () => setStatus("draw");
    const handleDrawDeclined = () => toast.info("Opponent rejected your draw offer");

    socket.on("bothPlayersJoined", handleBothPlayersJoined);
    socket.on("Opponent Draw", handleOpponentDraw);
    socket.on("Opponent Resign", handleOpponentResign);
    socket.on("DrawAccepted", handleDrawAccepted);
    socket.on("DrawDeclined", handleDrawDeclined);

    return () => {
      socket.off("bothPlayersJoined", handleBothPlayersJoined);
      socket.off("Opponent Draw", handleOpponentDraw);
      socket.off("Opponent Resign", handleOpponentResign);
      socket.off("DrawAccepted", handleDrawAccepted);
      socket.off("DrawDeclined", handleDrawDeclined);
    };
  }, [playerColor]);

  useEffect(() => {
    const handleReceiveMessage = (serverMessage) => {

      const incomingMsg = {
        id: Date.now(),
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
  }, [effectiveRoomId, effectiveUserId]);

  useEffect(() => {
    const handleReceiveMove = async ({ move, fen, gameStatus, winner, allMoves, whiteTimeLeft: sWhiteTime, blackTimeLeft: sBlackTime }) => {
      const pkg = await import("chess.js");
      const { Chess } = pkg;
      const chess = new Chess(fen); // Reconstruct from FEN to be sure

      setGameState(chess);
      setSession("fen", chess.fen());

      setMoves(allMoves);
      setSession("moves", allMoves);

      // --- TIME SYNC FIX ---
      if (sWhiteTime !== undefined && sBlackTime !== undefined) {
        setWhiteTimeLeft(sWhiteTime);
        setBlackTimeLeft(sBlackTime);

        if (playerColor === 'white') {
          // I am White. Player 1 is Opponent (Black). Player 2 is Me (White).
          setPlayer1(prev => ({ ...prev, initialTime: sBlackTime }));
          setPlayer2(prev => ({ ...prev, initialTime: sWhiteTime }));
        } else {
          // I am Black. Player 1 is Opponent (White). Player 2 is Me (Black).
          setPlayer1(prev => ({ ...prev, initialTime: sWhiteTime }));
          setPlayer2(prev => ({ ...prev, initialTime: sBlackTime }));
        }
      }

      const nextPlayer = chess.turn() === 'w' ? 'white' : 'black';
      setCurrentPlayer(nextPlayer);
      setSession("currentPlayer", nextPlayer);

      if (gameStatus === "drawn" || gameStatus === "finished") setStatus(winner ? (winner === effectiveUserId ? "win" : "lose") : "draw");

      if (effectiveCommentary === "hype") {
        const lastMoves = allMoves.map(m => m.san || m);
        const prompt = {
          move: move.san,
          fen,
          lastMoves,
          isUserMove: false,
          mode: effectiveCommentary
        };

        try {
          const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/commentary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
          });
          const data = await res.json();
          if (data.commentary) speak(data.commentary);
        } catch (err) {
          console.error("AI commentary error:", err);
        }
      }
    };

    socket.on("receiveMove", handleReceiveMove);

    socket.on("moveRejected", (data) => {
      console.error("Move rejected:", data);
      toast.error(`Move rejected: ${data.error}. Resyncing...`);
      // Force reload to sync state
      window.location.reload();
    });

    return () => {
      socket.off("receiveMove", handleReceiveMove);
      socket.off("moveRejected");
    };
  }, [effectiveCommentary, moves, effectiveUserId]);

  const handleMove = async (move, updatedGame) => {
    const currentGameId = getSession("gameId") || gameId;
    socket.emit("SendMove", { move, gameId: currentGameId, userId: effectiveUserId, roomId: effectiveRoomId });
    const newMoves = [...moves, move.san];
    setSession("moves", newMoves);
    setMoves(newMoves);

    setGameState(updatedGame);
    setSession("fen", updatedGame.fen());

    const nextPlayer = updatedGame.turn() === 'w' ? 'white' : 'black';
    setCurrentPlayer(nextPlayer);
    setSession("currentPlayer", nextPlayer);

    if (effectiveCommentary !== "off") {
      const prompt = {
        move: move.san,
        fen: updatedGame.fen(),
        lastMoves: newMoves,
        isUserMove: true,
        mode: effectiveCommentary
      };

      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/commentary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        if (data.commentary) speak(data.commentary);
      } catch (err) {
        console.error("AI commentary error:", err);
      }
    }
  };

  const handleSendMessage = (message) => {
    chatStorage.add(effectiveRoomId, effectiveUserId, message);
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const handleDraw = () => {

    if (!effectiveRoomId) {
      toast.error("Error: Room ID invalid. Cannot offer draw.");
      return;
    }
    socket.emit("Draw", { roomId: effectiveRoomId });
    toast.info("Draw offer sent! Waiting for opponent...");
  };

  const handleResign = () => {
    const currentGameId = getSession("gameId") || gameId;

    if (!effectiveRoomId || !currentGameId || !effectiveUserId) {
      console.error("Missing critical data for resign:", { effectiveRoomId, currentGameId, effectiveUserId });
      toast.error("Error: Game data missing. Cannot resign.");
      return;
    }

    setStatus("lose");
    socket.emit("Resign", { roomId: effectiveRoomId, gameId: currentGameId, userId: effectiveUserId });
  };

  const acceptDraw = () => {
    const currentGameId = getSession("gameId") || gameId;
    socket.emit("DrawAccepted", { roomId: effectiveRoomId, gameId: currentGameId });
    setDrawOfferVisible(false);
    setStatus("draw");
  };

  const declineDraw = () => {
    socket.emit("DrawDeclined", { roomId: effectiveRoomId });
    setDrawOfferVisible(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-1 lg:p-4">
      {!isMobile && (
        <div className="grid grid-cols-4 gap-4 max-w-6xl mx-auto">
          <div className="space-y-4">
            <PlayerCard
              key={'opponent-card'}
              playerName={player1.name}
              initialTime={player1.initialTime}
              isActive={player1.isActive}
              isCurrentUser={false}
              color={playerColor === 'white' ? 'black' : 'white'}
              opponentSocketId={opponentSocketId}
            />
            <MoveHistory moves={moves} className="h-80" />
          </div>
          <div className="col-span-2 min-h-[500px]">
            <ChessBoard
              key={`chessboard-${gameId || 'nogame'}`}
              color={playerColor}
              onMove={handleMove}
              gameState={gameState}
              status={status}
              gameStarted={gameStarted}
              currentPlayer={currentPlayer}
              mode={effectiveMode}
              handleDraw={handleDraw}
              handleResign={handleResign}
            />
          </div>
          <div className="space-y-4">
            <PlayerCard
              key={`player2-${effectiveUserId}`}
              playerName={player2.name}
              initialTime={player2.initialTime}
              isActive={player2.isActive}
              isCurrentUser={true}
              color={playerColor}
              opponentSocketId={opponentSocketId}
            />
            <Chat
              className="h-80"
              messages={messages}
              onSendMessage={handleSendMessage}
              roomId={effectiveRoomId}
            />
          </div>
        </div>
      )}

      {isMobile && (
        <div className="w-full max-w-[400px] mx-auto space-y-3 px-2">
          <div className="grid grid-cols-2 gap-2">
            <PlayerCard
              key={`mobile-player1-${opponentSocketId || 'waiting'}`}
              playerName={player1.name}
              initialTime={player1.initialTime}
              isActive={player1.isActive}
              className="h-44"
              isCurrentUser={false}
              color={playerColor === 'white' ? 'black' : 'white'}
              opponentSocketId={opponentSocketId}
            />
            <PlayerCard
              key={`mobile-player2-${effectiveUserId}`}
              playerName={player2.name}
              initialTime={player2.initialTime}
              isActive={player2.isActive}
              color={playerColor}
              className="h-44"
              isCurrentUser={true}
              opponentSocketId={opponentSocketId}
            />
          </div>
          <div className="h-[450px] w-full">
            <ChessBoard
              key={`mobile-chessboard-${gameId || 'nogame'}`}
              color={playerColor}
              onMove={handleMove}
              gameState={gameState}
              status={status}
              mode={mode}
              handleDraw={handleDraw}
              handleResign={handleResign}
              gameStarted={gameStarted}
              currentPlayer={currentPlayer}
            />
          </div>
          <div className="fixed bottom-3 left-3 right-3 flex justify-between pointer-events-none z-10">
            <button onClick={() => setShowMoveHistory(true)} className="w-11 h-11 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 hover:scale-110 pointer-events-auto">
              <RotateCcw className="w-4 h-4 mx-auto" />
            </button>
            <button onClick={() => setShowChat(true)} className="w-11 h-11 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 hover:scale-110 pointer-events-auto">
              <MessageCircle className="w-4 h-4 mx-auto" />
            </button>
          </div>
          <MobilePanel isOpen={showMoveHistory} onClose={() => setShowMoveHistory(false)} title="Move History">
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <MoveHistory moves={moves} />
            </div>
          </MobilePanel>
          <MobilePanel isOpen={showChat} onClose={() => setShowChat(false)} title="Chat">
            <Chat className="h-full border-0 shadow-none rounded-none max-h-[60vh] overflow-y-auto" messages={messages} onSendMessage={handleSendMessage} roomId={effectiveRoomId} />
          </MobilePanel>
        </div>
      )}

      {drawOfferVisible && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Opponent offered a draw</h2>
            <p className="mb-6 text-gray-600">Do you want to accept it?</p>
            <div className="flex justify-center gap-4">
              <button onClick={acceptDraw} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Accept</button>
              <button onClick={declineDraw} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Decline</button>
            </div>
          </div>
        </div>
      )}

      {showBackWarning && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Are you sure you want to leave?</h2>
            <p className="mb-6 text-gray-600">Please finish the game before going to dashboard.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowBackWarning(false)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Continue Game</button>
              <button onClick={() => {
                setStatus("lose");
                const currentGameId = getSession("gameId") || gameId;
                socket.emit("Resign", { roomId: effectiveRoomId, gameId: currentGameId, userId: effectiveUserId });
                setShowBackWarning(false);
              }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Finish Game</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;
