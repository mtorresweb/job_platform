"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../auth/auth-client";

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
  user_typing: (data: { userId: string; conversationId: string; isTyping: boolean }) => void;

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
  booking_cancelled: (data: { id: string; status: string; reason?: string }) => void;
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
  private eventHandlers: Map<string, Set<(...args: unknown[]) => void>> = new Map();

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
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3001";
    
    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      autoConnect: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
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
    this.emit('join_conversation', { conversationId });
  }

  public leaveConversation(conversationId: string) {
    this.emit('leave_conversation', { conversationId });
  }

  public sendMessage(conversationId: string, content: string, messageType = 'TEXT') {
    this.emit('send_message', { conversationId, content, messageType });
  }

  public markMessageAsRead(messageId: string, conversationId: string) {
    this.emit('mark_message_read', { messageId, conversationId });
  }

  public setTyping(conversationId: string, isTyping: boolean) {
    this.emit('typing', { conversationId, isTyping });
  }

  public updateUserStatus(status: 'online' | 'offline' | 'away') {
    this.emit('update_status', { status });
  }

  public markNotificationRead(notificationId: string) {
    this.emit('mark_notification_read', { notificationId });
  }

  private setupEventHandlers() {
    if (!this.socket) return;    this.socket.on("connect", () => {
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
