// API service for messaging
import { apiClient, PaginationParams } from '@/shared/utils/api-client';
import { API_ENDPOINTS } from '@/shared/constants/api';

export interface Conversation {
  id: string;
  clientId: string;
  professionalId: string;
  lastMessageAt: string | null;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  professional: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    isVerified: boolean;
  };
  lastMessage?: {
    id: string;
    content: string;
    messageType: MessageType;
    senderId: string;
    createdAt: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  senderId?: string; // client-side only, used for optimistic rendering
}

export interface ConversationParams extends PaginationParams {
  isActive?: boolean;
}

export interface MessageParams extends PaginationParams {
  unreadOnly?: boolean;
}

class MessagesApiService {
  // Get user conversations
  async getConversations(params: ConversationParams = {}): Promise<{
    conversations: Conversation[];
    total: number;
    hasMore: boolean;
  }> {    const response = await apiClient.get<{
      conversations: Conversation[];
      total: number;
      hasMore: boolean;
    }>(API_ENDPOINTS.MESSAGES.CONVERSATIONS, params as Record<string, unknown>);
    return response.data;
  }

  // Get conversation by ID
  async getConversationById(id: string): Promise<Conversation> {
    const response = await apiClient.get<Conversation>(`${API_ENDPOINTS.MESSAGES.CONVERSATIONS}/${id}`);
    return response.data;
  }

  // Get or create conversation between client and professional
  async getOrCreateConversation(professionalId: string): Promise<Conversation> {
    const response = await apiClient.post<Conversation>(`${API_ENDPOINTS.MESSAGES.CONVERSATIONS}/create`, {
      professionalId,
    });
    return response.data;
  }

  // Get messages in a conversation
  async getMessages(conversationId: string, params: MessageParams = {}): Promise<{
    messages: Message[];
    total: number;
    hasMore: boolean;
  }> {    const response = await apiClient.get<{
      messages: Message[];
      total: number;
      hasMore: boolean;
    }>(`${API_ENDPOINTS.MESSAGES.BASE}/${conversationId}`, params as Record<string, unknown>);
    return response.data;
  }

  // Send a message
  async sendMessage(data: SendMessageData): Promise<Message> {
    const response = await apiClient.post<Message>(API_ENDPOINTS.MESSAGES.SEND, data);
    return response.data;
  }

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.MESSAGES.MARK_READ}/${messageId}`);
  }

  // Mark all messages in conversation as read
  async markConversationAsRead(conversationId: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.MESSAGES.MARK_READ}/conversation/${conversationId}`);
  }

  // Upload file for message
  async uploadFile(file: File): Promise<{
    url: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.upload<{
      url: string;
      fileName: string;
      fileSize: number;
      fileMimeType: string;
    }>('/upload/message-file', formData);
    return response.data;
  }

  // Get unread message count
  async getUnreadCount(): Promise<{
    total: number;
    conversations: Record<string, number>;
  }> {
    const response = await apiClient.get<{
      total: number;
      conversations: Record<string, number>;
    }>(`${API_ENDPOINTS.MESSAGES.BASE}/unread-count`);
    return response.data;
  }

  // Search messages
  async searchMessages(query: string, conversationId?: string): Promise<{
    messages: Message[];
    total: number;
  }> {
    const response = await apiClient.get<{
      messages: Message[];
      total: number;
    }>(`${API_ENDPOINTS.MESSAGES.BASE}/search`, {
      query,
      conversationId,
    });
    return response.data;
  }

  // Delete message (only sender can delete)
  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.MESSAGES.BASE}/${messageId}`);
  }

  // Archive conversation
  async archiveConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.post<Conversation>(`${API_ENDPOINTS.MESSAGES.CONVERSATIONS}/${conversationId}/archive`);
    return response.data;
  }

  // Unarchive conversation
  async unarchiveConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.post<Conversation>(`${API_ENDPOINTS.MESSAGES.CONVERSATIONS}/${conversationId}/unarchive`);
    return response.data;
  }
}

export const messagesApi = new MessagesApiService();
