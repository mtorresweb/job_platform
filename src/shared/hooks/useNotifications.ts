"use client";

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/shared/utils/api-client';
import { ROUTES } from '@/shared/constants';
import { useSocket } from '@/infrastructure/socket/socket-client';

// Define notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: Date | string | null;
  createdAt: Date | string;
  relatedId?: string | null;
  metadata?: Record<string, unknown> | null;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

// Query keys for React Query
export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  list: (params?: Record<string, unknown>) => [...NOTIFICATION_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...NOTIFICATION_QUERY_KEYS.all, 'detail', id] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
};

// Get all notifications with optional filters
export function useNotifications(params: { 
  page?: number; 
  limit?: number;
  unreadOnly?: boolean;
} = {}) {
  const { page = 1, limit = 10, unreadOnly = false } = params;
  
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list({ page, limit, unreadOnly }),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (unreadOnly) {
        queryParams.append('unreadOnly', 'true');
      }
      
      const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
      return response.data;
    },
  });
}

// Get unread notification count
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: async () => {
      const response = await apiClient.get(`/notifications?unreadOnly=true&limit=1`);
      return (response.data as { data?: { total?: number } })?.data?.total || 0;
    },
    // Lower staleTime since this changes frequently
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { socketClient } = useSocket();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.put(`/notifications/${notificationId}`);
      
      // Also inform the socket server
      socketClient.markNotificationRead(notificationId);
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al marcar la notificación como leída');
    },
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.put(`${ROUTES.api.notifications}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Todas las notificaciones marcadas como leídas');
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al marcar las notificaciones como leídas');
    },
  });
}

// Mark multiple notifications as read
export function useMarkMultipleNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await apiClient.post(`${ROUTES.api.notifications}/mark-read`, {
        notificationIds,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al marcar las notificaciones como leídas');
    },
  });
}

// Delete a notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.delete(`${ROUTES.api.notifications}/${notificationId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Notificación eliminada');
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al eliminar la notificación');
    },
  });
}

// Hook to handle real-time notification updates
export function useNotificationListener() {
  const queryClient = useQueryClient();
  const { socketClient } = useSocket();
  
  // Setup socket events for real-time notifications
  useEffect(() => {
    if (!socketClient.isConnected()) return;

    // Listen for new notifications
    socketClient.on('new_notification', () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    });
    
    // Listen for read notifications
    socketClient.on('notification_read', () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    });
    
    return () => {
      // Cleanup
      socketClient.off('new_notification');
      socketClient.off('notification_read');
    };
  }, [queryClient, socketClient]);
}
