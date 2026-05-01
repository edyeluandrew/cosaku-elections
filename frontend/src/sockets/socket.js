import { io } from "socket.io-client";

// Determine Socket URL based on environment
let SOCKET_URL;

if (import.meta.env.VITE_SOCKET_URL) {
  // Use explicit environment variable if set
  SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
} else if (import.meta.env.DEV) {
  // Development mode: use localhost
  SOCKET_URL = "http://localhost:5000";
} else {
  // Production mode: use Render backend
  SOCKET_URL = "https://cosaku-elections.onrender.com";
}

console.log("🔌 Socket Configuration:");
console.log("   VITE_SOCKET_URL:", import.meta.env.VITE_SOCKET_URL);
console.log("   Environment:", import.meta.env.DEV ? "development" : "production");
console.log("   Using SOCKET_URL:", SOCKET_URL);

const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

export default socket;
