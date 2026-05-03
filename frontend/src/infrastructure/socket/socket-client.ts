import { io, Socket } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    throw new Error("Socket not initialized. Call connectSocket() first.");
  }
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(`${WS_URL}/chat`, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("[WS] Connected:", socket!.id);
  });

  socket.on("connect_error", (err) => {
    console.error("[WS] Connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[WS] Disconnected:", reason);
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
