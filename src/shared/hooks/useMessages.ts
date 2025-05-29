// React Query hooks for messaging
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocket } from '@/infrastructure/socket/socket-client';
import { useEffect } from 'react';
import { 
  messagesApi, 
  Message, 
  SendMessageData,
  ConversationParams,
  MessageParams 
} from '@/shared/utils/messages-api';

// Type for infinite query data
interface InfiniteMessagesData {
  pages: Array<{
    messages: Message[];
    hasMore: boolean;
  }>;
  pageParams: unknown[];
}

// Type for error objects
interface ApiError {
  message?: string;
}

// Query Keys
export const MESSAGES_QUERY_KEYS = {
  all: ['messages'] as const,
  conversations: () => [...MESSAGES_QUERY_KEYS.all, 'conversations'] as const,
  conversationsList: (params: ConversationParams) => [...MESSAGES_QUERY_KEYS.conversations(), params] as const,
  conversation: (id: string) => [...MESSAGES_QUERY_KEYS.conversations(), id] as const,
  messages: (conversationId: string) => [...MESSAGES_QUERY_KEYS.all, 'messages', conversationId] as const,
  messagesList: (conversationId: string, params: MessageParams) => [...MESSAGES_QUERY_KEYS.messages(conversationId), params] as const,
  unreadCount: () => [...MESSAGES_QUERY_KEYS.all, 'unread-count'] as const,
  search: (query: string, conversationId?: string) => [...MESSAGES_QUERY_KEYS.all, 'search', query, conversationId] as const,
} as const;

// Hooks for fetching data
export function useConversations(params: ConversationParams = {}) {
  const { socketClient } = useSocket();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MESSAGES_QUERY_KEYS.conversationsList(params),
    queryFn: () => messagesApi.getConversations(params),
    staleTime: 30 * 1000, // 30 seconds
  });
  // Subscribe to real-time updates
  useEffect(() => {
    if (!socketClient.isConnected()) return;    const handleNewMessage = () => {
      // Update conversation list
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.conversations() 
      });
    };

    const handleMessageRead = () => {
      // Update conversation unread count
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.conversations() 
      });
    };

    socketClient.on('new_message', handleNewMessage);
    socketClient.on('message_read', handleMessageRead);

    return () => {
      socketClient.off('new_message', handleNewMessage);
      socketClient.off('message_read', handleMessageRead);
    };
  }, [socketClient, queryClient]);

  return query;
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.conversation(id),
    queryFn: () => messagesApi.getConversationById(id),
    enabled: Boolean(id),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useMessages(conversationId: string, params: MessageParams = {}) {
  const { socketClient } = useSocket();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: MESSAGES_QUERY_KEYS.messagesList(conversationId, params),
    queryFn: ({ pageParam = 1 }) => 
      messagesApi.getMessages(conversationId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => 
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: Boolean(conversationId),
    staleTime: 30 * 1000,
  });
  // Subscribe to real-time updates for this conversation
  useEffect(() => {
    if (!socketClient.isConnected() || !conversationId) return;

    // Join conversation room
    socketClient.joinConversation(conversationId);

    const handleNewMessage = (...args: unknown[]) => {
      const data = args[0] as {
        conversationId: string;
        message: Message;
      };
      if (data.conversationId === conversationId) {
        // Add new message to cache
        queryClient.setQueryData(
          MESSAGES_QUERY_KEYS.messagesList(conversationId, params),
          (oldData: InfiniteMessagesData | undefined) => {
            if (!oldData) return oldData;
            
            const firstPage = oldData.pages[0];
            if (firstPage) {
              firstPage.messages.unshift(data.message);
            }
            return oldData;
          }
        );
      }
    };

    const handleMessageRead = (...args: unknown[]) => {
      const data = args[0] as {
        conversationId: string;
        messageId: string;
      };
      if (data.conversationId === conversationId) {
        // Update message read status
        queryClient.invalidateQueries({
          queryKey: MESSAGES_QUERY_KEYS.messages(conversationId)
        });
      }
    };

    socketClient.on('new_message', handleNewMessage);
    socketClient.on('message_read', handleMessageRead);

    return () => {
      socketClient.off('new_message', handleNewMessage);
      socketClient.off('message_read', handleMessageRead);
      socketClient.leaveConversation(conversationId);
    };
  }, [socketClient, conversationId, queryClient, params]);

  return query;
}

export function useUnreadCount() {
  const { socketClient } = useSocket();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MESSAGES_QUERY_KEYS.unreadCount(),
    queryFn: messagesApi.getUnreadCount,
    staleTime: 30 * 1000,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!socketClient.isConnected()) return;

    const handleNewMessage = () => {
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.unreadCount() 
      });
    };

    const handleMessageRead = () => {
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.unreadCount() 
      });
    };

    socketClient.on('new_message', handleNewMessage);
    socketClient.on('message_read', handleMessageRead);

    return () => {
      socketClient.off('new_message', handleNewMessage);
      socketClient.off('message_read', handleMessageRead);
    };
  }, [socketClient, queryClient]);

  return query;
}

export function useSearchMessages(query: string, conversationId?: string) {
  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.search(query, conversationId),
    queryFn: () => messagesApi.searchMessages(query, conversationId),
    enabled: Boolean(query && query.length > 2),
    staleTime: 1 * 60 * 1000,
  });
}

// Mutation hooks
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (professionalId: string) => messagesApi.getOrCreateConversation(professionalId),
    onSuccess: (newConversation) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.conversations() 
      });
      
      // Add to cache
      queryClient.setQueryData(
        MESSAGES_QUERY_KEYS.conversation(newConversation.id),
        newConversation
      );
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear conversación');
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { socketClient } = useSocket();

  return useMutation({
    mutationFn: async (data: SendMessageData) => {
      // Send via socket for real-time delivery
      if (socketClient.isConnected()) {
        socketClient.sendMessage(data.conversationId, data.content, data.messageType);
      }
      
      // Also send via API for persistence
      return messagesApi.sendMessage(data);
    },
    onSuccess: () => {
      // Update conversations list
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.conversations() 
      });
      
      // Update unread count
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.unreadCount() 
      });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al enviar mensaje');
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();
  const { socketClient } = useSocket();

  return useMutation({
    mutationFn: async ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      // Mark via socket for real-time update
      if (socketClient.isConnected()) {
        socketClient.markMessageAsRead(messageId, conversationId);
      }
      
      // Also mark via API
      return messagesApi.markMessageAsRead(messageId);
    },
    onSuccess: (_, { conversationId }) => {
      // Update message status
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.messages(conversationId)
      });
      
      // Update conversations and unread count
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.conversations() 
      });
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.unreadCount() 
      });
    },
  });
}

export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messagesApi.markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Update all related queries
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.messages(conversationId)
      });
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.conversations() 
      });
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.unreadCount() 
      });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al marcar conversación como leída');
    },
  });
}

export function useUploadMessageFile() {
  return useMutation({
    mutationFn: (file: File) => messagesApi.uploadFile(file),
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al subir archivo');
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messagesApi.deleteMessage(messageId),
    onSuccess: () => {
      // Invalidate all message-related queries
      queryClient.invalidateQueries({ 
        queryKey: MESSAGES_QUERY_KEYS.all 
      });
      
      toast.success('Mensaje eliminado');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al eliminar mensaje');
    },
  });
}
