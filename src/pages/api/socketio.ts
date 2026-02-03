import { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { auth } from "@/infrastructure/auth/auth";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io: IOServer;
    };
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    if (!res.socket.server.io) {
      console.log("Setting up Socket.IO server...");

      const io = new IOServer(res.socket.server, {
        path: "/api/socketio",
        addTrailingSlash: false,
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          methods: ["GET", "POST"],
          credentials: true,
          allowedHeaders: ["content-type", "authorization"],
        },
        connectTimeout: 10000,
        pingTimeout: 5000,
        pingInterval: 3000,
        upgradeTimeout: 5000,
        maxHttpBufferSize: 1e6,
      });

      // Socket middleware for authentication
      io.use(async (socket, next) => {
        try {
          // 1) Try bearer token
          const token = socket.handshake.auth?.token as string | undefined;
          if (token) {
            const headers = new Headers();
            headers.set("Authorization", `Bearer ${token}`);
            const session = await auth.api.getSession({ headers });
            if (session?.user?.id) {
              socket.data.userId = session.user.id;
              socket.data.user = session.user;
              return next();
            }
          }

          // 2) Try cookies from handshake
          const headerEntries = new Headers();
          for (const [key, value] of Object.entries(socket.request.headers)) {
            if (typeof value === "string") {
              headerEntries.set(key, value);
            }
          }
          const cookieSession = await auth.api.getSession({ headers: headerEntries });
          if (cookieSession?.user?.id) {
            socket.data.userId = cookieSession.user.id;
            socket.data.user = cookieSession.user;
            return next();
          }

          // If still no auth, allow connection but without user data
          console.warn("Socket connected without auth; some events may be limited");
          return next();
        } catch (error) {
          console.error("Socket middleware error:", error);
          next(new Error("Authentication failed"));
        }
      });

      // Socket event handlers
      io.on("connection", async (socket) => {
        try {
          console.log("New client connected:", socket.id);
          socket.emit("connected", { id: socket.id });

          // Join user room by id for targeted notifications
          if (socket.data.userId) {
            socket.join(`user:${socket.data.userId}`);
          }

          // Handle conversation room joining
          socket.on("join_conversation", (payload: string | { conversationId?: string }) => {
            try {
              const conversationId =
                typeof payload === "string" ? payload : payload?.conversationId;
              if (!conversationId) return;
              socket.join(`conversation:${conversationId}`);
              console.log(
                `Socket ${socket.id} joined conversation ${conversationId}`,
              );
            } catch (error) {
              console.error("Error joining conversation:", error);
              socket.emit("error", { message: "Failed to join conversation" });
            }
          });

          // Handle conversation room leaving
          socket.on("leave_conversation", (payload: string | { conversationId?: string }) => {
            try {
              const conversationId =
                typeof payload === "string" ? payload : payload?.conversationId;
              if (!conversationId) return;
              socket.leave(`conversation:${conversationId}`);
              console.log(
                `Socket ${socket.id} left conversation ${conversationId}`,
              );
            } catch (error) {
              console.error("Error leaving conversation:", error);
              socket.emit("error", { message: "Failed to leave conversation" });
            }
          });

          // Handle client disconnection
          socket.on("disconnect", (reason) => {
            console.log(`Client ${socket.id} disconnected:`, reason);
          });

          // Handle errors
          socket.on("error", (error) => {
            console.error("Socket error:", error);
          });
        } catch (error) {
          console.error("Error in connection handler:", error);
          socket.emit("error", { message: "Internal server error" });
        }
      });

      res.socket.server.io = io;
      // Expose globally so route handlers can emit events
      (globalThis as Record<string, unknown>).socketIO = io;
      console.log("Socket.IO server initialized successfully");
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Socket.IO server error:", error);
    res.status(500).json({ error: "Failed to initialize Socket.IO server" });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
