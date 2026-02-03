import { Server as SocketServer } from "socket.io";
import { NextApiRequest } from "next";
import { ResponseWithSocket } from "@/shared/types/socket";
import { auth } from "@/infrastructure/auth/auth";

const SocketHandler = async (req: NextApiRequest, res: ResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log("Socket is already attached");
    return res.end();
  }

  const io = new SocketServer(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
    pingTimeout: 10000,
    pingInterval: 5000,
    upgradeTimeout: 5000,
  });

  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("No auth token provided"));
      }

      const headers = new Headers();
      headers.set("Authorization", `Bearer ${token}`);

      const session = await auth.api.getSession({
        headers,
      });

      if (!session?.user) {
        return next(new Error("Invalid token"));
      }

      socket.data.user = session.user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Event handlers
  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log("User connected:", user.id);

    // Join user's personal room
    socket.join(`user:${user.id}`);

    // Chat room handling
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${user.id} joined conversation ${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${user.id} left conversation ${conversationId}`);
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", user.id);
    });
  });

  res.socket.server.io = io;
  console.log("Socket server initialized");
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default SocketHandler;
