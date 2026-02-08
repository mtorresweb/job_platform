"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { useUserRole } from "@/infrastructure/auth/auth-client";

// Socket Event Types
export interface SocketEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;

  // Message events
  new_message: (data: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    messageType: string;
    createdAt: string;
    sender: {
      name: string;
      avatar?: string;
    };
  }) => void;
  message_read: (data: { messageId: string; conversationId: string }) => void;
  user_typing: (data: {
    userId: string;
    conversationId: string;
    isTyping: boolean;
  }) => void;

  // Booking events
  booking_created: (data: {
    id: string;
    clientId: string;
    professionalId: string;
    serviceId: string;
    status: string;
    scheduledAt: string;
    service: {
      title: string;
    };
    client: {
      name: string;
    };
  }) => void;
  booking_confirmed: (data: { id: string; status: string }) => void;
  booking_cancelled: (data: {
    id: string;
    status: string;
    reason?: string;
  }) => void;
  booking_completed: (data: { id: string; status: string }) => void;

  // Notification events
  new_notification: (data: {
    id: string;
    title: string;
    message: string;
    type: string;
    relatedId?: string;
  }) => void;

  // User status events
  user_online: (data: { userId: string }) => void;
  user_offline: (data: { userId: string }) => void;
}

export class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;
  private token: string | null = null;
  private eventHandlers: Map<string, Set<(...args: unknown[]) => void>> =
    new Map();

  private constructor() {}

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  public connect(token?: string) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.token = token || null;
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Initialize socket connection
    this.socket = io(baseUrl, {
      path: "/api/socketio",
      auth: token ? { token } : undefined,
      autoConnect: false,
      transports: ["polling", "websocket"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      withCredentials: true,
      forceNew: true,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
  // Event subscription system
  public on(event: string, handler: (...args: unknown[]) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Also register with socket
    this.socket?.on(event, handler);
  }

  public off(event: string, handler?: (...args: unknown[]) => void) {
    if (handler) {
      this.eventHandlers.get(event)?.delete(handler);
      this.socket?.off(event, handler);
    } else {
      this.eventHandlers.delete(event);
      this.socket?.off(event);
    }
  }
  // Emit events
  public emit(event: string, data?: unknown) {
    this.socket?.emit(event, data);
  }

  // Specific emit methods
  public joinConversation(conversationId: string) {
    this.emit("join_conversation", { conversationId });
  }

  public leaveConversation(conversationId: string) {
    this.emit("leave_conversation", { conversationId });
  }

  public sendMessage(
    conversationId: string,
    content: string,
    messageType = "TEXT",
  ) {
    this.emit("send_message", { conversationId, content, messageType });
  }

  public markMessageAsRead(messageId: string, conversationId: string) {
    this.emit("mark_message_read", { messageId, conversationId });
  }

  public setTyping(conversationId: string, isTyping: boolean) {
    this.emit("typing", { conversationId, isTyping });
  }

  public updateUserStatus(status: "online" | "offline" | "away") {
    this.emit("update_status", { status });
  }

  public markNotificationRead(notificationId: string) {
    this.emit("mark_notification_read", { notificationId });
  }

  private setupEventHandlers() {
    if (!this.socket) return;
    this.socket.on("connect", () => {
      // Connection successful - client is now connected to socket server
    });

    this.socket.on("disconnect", () => {
      // Client disconnected from socket server
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Hook para usar Socket.io en componentes React
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useUserRole();

  useEffect(() => {
    if (!user) {
      // Disconnect if no user
      SocketClient.getInstance().disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    // Make sure socket server is initialized
    fetch("/api/socketio").catch(console.error);

    // Get the auth token from localStorage (browser only, and only if available)
    const hasLocalStorage =
      typeof window !== "undefined" &&
      typeof localStorage === "object" &&
      typeof localStorage.getItem === "function";

    const token = hasLocalStorage ? localStorage.getItem("auth-token") : null;

    // Connect with token if available; otherwise rely on cookies handled in server middleware
    const socketClient = SocketClient.getInstance();
    const socketInstance = socketClient.connect(token || undefined);

    if (!socketInstance) {
      console.error("Failed to initialize socket connection");
      return;
    }

    setSocket(socketInstance);
    socketInstance.connect();

    const handleConnect = () => {
      console.log("Socket connected successfully");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    };

    const handleError = (error: Error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("connect_error", handleError);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("connect_error", handleError);
      socketClient.disconnect();
    };
  }, [user]);

  const socketClient = SocketClient.getInstance();

  return {
    socket,
    isConnected,
    socketClient,
  };
}
