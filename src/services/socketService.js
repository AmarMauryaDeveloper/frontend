import { io } from "socket.io-client";

let socket = null;

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const connectSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  // Socket connects to host backend URL
  socket = io(BACKEND_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("Socket client connected successfully");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
