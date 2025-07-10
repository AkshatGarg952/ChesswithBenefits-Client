import { io } from "socket.io-client";


const socket = io("https://chesswithbenefits-server.onrender.com", {
  transports: ["websocket", 'polling'],
  autoConnect: true, 
});

export default socket;
