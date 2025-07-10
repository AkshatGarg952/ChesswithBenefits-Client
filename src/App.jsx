import ChessGame from './components/ChessGame.jsx';
import { useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { state } = useLocation();
  const color = state?.color;
  const roomId = state?.roomId;
  const userId = state?.userId;
  const commentary = state?.commentary;
  const mode = state?.mode;
  console.log(commentary);
  return( 
    <>
  <ChessGame color={color} roomId={roomId} userId={userId} commentary={commentary} mode={mode}/>
  <ToastContainer position="bottom-right" autoClose={3000} />
  </>
  )
}

export default App;