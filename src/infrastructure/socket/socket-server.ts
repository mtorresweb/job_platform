import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { auth } from "../auth/auth";

export class SocketService {
  private static instance: SocketService;
  private io: SocketServer;

  private constructor(httpServer: HTTPServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  public static getInstance(httpServer?: HTTPServer): SocketService {
    if (!SocketService.instance && httpServer) {
      SocketService.instance = new SocketService(httpServer);
    }
    return SocketService.instance;
  }

  private async setupMiddleware() {
    // Middleware de autenticación
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("No auth token provided"));
        } // Verificar token con better-auth
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
      } catch {
        next(new Error("Authentication failed"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      const user = socket.data.user;
      console.log(`User ${user.id} connected`);

      // Unirse a sala personal
      socket.join(`user:${user.id}`);

      // Manejar mensajes de chat
      socket.on("join_conversation", (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
      });

      socket.on("leave_conversation", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
      });

      socket.on("send_message", async (data) => {
        const { conversationId, content, type = "TEXT" } = data;

        // Aquí deberías validar que el usuario puede enviar mensajes a esta conversación
        // y guardar el mensaje en la base de datos

        const message = {
          id: Date.now().toString(), // Temporal, usar UUID real
          conversationId,
          senderId: user.id,
          content,
          type,
          sentAt: new Date(),
          isRead: false,
        };

        // Emitir a todos los usuarios en la conversación
        this.io
          .to(`conversation:${conversationId}`)
          .emit("new_message", message);
      }); // Manejar notificaciones
      socket.on("mark_notification_read", () => {
        // Marcar notificación como leída en la base de datos
        // Emitir actualización si es necesario
      });

      // Manejar desconexión
      socket.on("disconnect", () => {
        console.log(`User ${user.id} disconnected`);
      });
    });
  }
  // Métodos públicos para enviar notificaciones
  public async sendNotificationToUser(
    userId: string,
    notification: Record<string, unknown>,
  ) {
    this.io.to(`user:${userId}`).emit("notification", notification);
  }

  public async sendMessageToConversation(
    conversationId: string,
    message: Record<string, unknown>,
  ) {
    this.io.to(`conversation:${conversationId}`).emit("new_message", message);
  }

  public async notifyBookingUpdate(
    userId: string,
    booking: Record<string, unknown>,
  ) {
    this.io.to(`user:${userId}`).emit("booking_update", booking);
  }

  public getIO(): SocketServer {
    return this.io;
  }
}
