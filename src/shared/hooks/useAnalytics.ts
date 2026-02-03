// React Query hooks for analytics
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/shared/utils/analytics-api';

// Query Keys
export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  user: (timeRange: string) => [...ANALYTICS_QUERY_KEYS.all, 'user', timeRange] as const,
  platform: (timeRange: string) => [...ANALYTICS_QUERY_KEYS.all, 'platform', timeRange] as const,
  professional: (id: string) => [...ANALYTICS_QUERY_KEYS.all, 'professional', id] as const,
  bookings: (timeRange: string) => [...ANALYTICS_QUERY_KEYS.all, 'bookings', timeRange] as const,
  revenue: (timeRange: string) => [...ANALYTICS_QUERY_KEYS.all, 'revenue', timeRange] as const,
  time: (timeRange: string) => [...ANALYTICS_QUERY_KEYS.all, 'time', timeRange] as const,
  segmentation: (timeRange: string) => [...ANALYTICS_QUERY_KEYS.all, 'segmentation', timeRange] as const,
} as const;

// Hooks for fetching analytics data
export function useUserAnalytics(timeRange: string = '6m') {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.user(timeRange),
    queryFn: () => analyticsApi.getUserAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function usePlatformAnalytics(timeRange: string = '6m') {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.platform(timeRange),
    queryFn: () => analyticsApi.getPlatformAnalytics(timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useProfessionalStats(professionalId: string) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.professional(professionalId),
    queryFn: () => analyticsApi.getProfessionalStats(professionalId),
    enabled: Boolean(professionalId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useBookingAnalytics(timeRange: string = '6m') {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.bookings(timeRange),
    queryFn: () => analyticsApi.getBookingAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useRevenueAnalytics(timeRange: string = '6m') {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.revenue(timeRange),
    queryFn: () => analyticsApi.getRevenueAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useTimeAnalytics(timeRange: string = '6m') {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.time(timeRange),
    queryFn: () => analyticsApi.getTimeAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useClientSegmentation(timeRange: string = '6m') {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.segmentation(timeRange),
    queryFn: () => analyticsApi.getClientSegmentation(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
