import type { Server as IOServer } from "socket.io";

// Access the Socket.IO server instance stored on the global object by the socketio API route.
export function getSocketServer(): IOServer | undefined {
  const globalWithIO = globalThis as Record<string, unknown>;
  return globalWithIO.socketIO as IOServer | undefined;
}
