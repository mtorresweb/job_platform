"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../auth/auth-client";

export class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  public connect(token: string) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      {
        auth: {
          token,
        },
        autoConnect: true,
      },
    );

    this.setupEventHandlers();
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // Métodos para mensajería
  public joinConversation(conversationId: string) {
    this.socket?.emit("join_conversation", conversationId);
  }

  public leaveConversation(conversationId: string) {
    this.socket?.emit("leave_conversation", conversationId);
  }

  public sendMessage(
    conversationId: string,
    content: string,
    type: string = "TEXT",
  ) {
    this.socket?.emit("send_message", {
      conversationId,
      content,
      type,
    });
  }

  // Métodos para notificaciones
  public markNotificationRead(notificationId: string) {
    this.socket?.emit("mark_notification_read", notificationId);
  }
}

// Hook para usar Socket.io en componentes React
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useCurrentUser();

  useEffect(() => {
    if (!user) {
      // Desconectar si no hay usuario
      SocketClient.getInstance().disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    // Conectar con token del usuario (necesitarás implementar obtención del token)
    const socketInstance = SocketClient.getInstance().connect("user-token"); // Reemplazar con token real
    setSocket(socketInstance);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
    };
  }, [user]);

  return {
    socket,
    isConnected,
    socketClient: SocketClient.getInstance(),
  };
}
