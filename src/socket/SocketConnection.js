import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:3000", {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
});

export default socket;
