import { NextResponse } from "next/server";
import { Server } from "socket.io";

const handler = async (req: Request) => {
  try {
    // @ts-expect-error - handle upgrade
    if (!req.socket.server.io) {
      console.log("Socket.io server initialization");

      // @ts-expect-error - initialize socket server
      const io = new Server(req.socket.server, {
        path: "/api/socket/io",
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
        allowEIO3: true,
      });

      // @ts-expect-error - store io instance
      req.socket.server.io = io;

      // Initialize socket connections
      io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("join-conversation", (conversationId) => {
          socket.join(`conversation:${conversationId}`);
          console.log(
            `Socket ${socket.id} joined conversation ${conversationId}`,
          );
        });

        socket.on("leave-conversation", (conversationId) => {
          socket.leave(`conversation:${conversationId}`);
          console.log(
            `Socket ${socket.id} left conversation ${conversationId}`,
          );
        });

        socket.on("disconnect", () => {
          console.log("Client disconnected:", socket.id);
        });
      });
    }

    return NextResponse.json(
      { success: true, message: "Socket server running" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Socket server error:", error);
    return NextResponse.json(
      { success: false, message: "Socket server error", error },
      { status: 500 },
    );
  }
};

export { handler as GET, handler as POST };
