import { io } from "socket.io-client";

// Get server URL from environment variable with fallback
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

console.log("🔌 Initializing socket connection to:", SERVER_URL);

const socket = io(SERVER_URL, {
  transports: ["websocket", 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Connection event handlers
socket.on("connect", () => {
  console.log("✅ Socket connected successfully:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
  console.error("Server URL:", SERVER_URL);
  console.error("Make sure the server is running and VITE_SERVER_URL is set correctly");
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    // Server disconnected the socket, reconnect manually
    socket.connect();
  }
});

socket.on("reconnect", (attemptNumber) => {
  console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
});

socket.on("reconnect_attempt", (attemptNumber) => {
  console.log("🔄 Attempting to reconnect... (attempt", attemptNumber, ")");
});

socket.on("reconnect_error", (error) => {
  console.error("❌ Reconnection error:", error.message);
});

socket.on("reconnect_failed", () => {
  console.error("❌ Failed to reconnect after maximum attempts");
});

// Error event handler
socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});

export default socket;
