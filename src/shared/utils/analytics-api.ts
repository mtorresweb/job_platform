// Service for managing analytics data
import { apiClient } from '@/shared/utils/api-client';
import { API_ENDPOINTS } from '@/shared/constants/api';

export interface AnalyticsOverview {
  totalBookings: number;
  completedBookings: number;
  totalRevenue?: number;
  totalSpent?: number;
  averageRating?: number;
  totalReviews?: number;
  completionRate?: number;
  savedAmount?: number;
  favoriteServices?: number;
}

export interface MonthlyData {
  month: string;
  earnings: number;
  bookings: number;
}

export interface ServicePerformance {
  name: string;
  bookings: number;
  revenue: number;
  avgRating: number;
  category: string;
}

export interface ClientStats {
  totalClients: number;
  repeatClients: number;
  repeatRate: number;
}

export interface FavoriteService {
  category: string;
  count: number;
}

export interface ProfessionalAnalytics {
  // Flattened properties for easier access
  totalEarnings: number;
  earningsGrowth: number;
  totalBookings: number;
  bookingsGrowth: number;
  uniqueClients: number;
  clientsGrowth: number;
  avgRating: number;
  ratingGrowth: number;
  
  // Additional data
  monthlyData: MonthlyData[];
  servicePerformance: ServicePerformance[];
  clientStats: ClientStats;
  isProfessional: true;
}

export interface ClientAnalytics {
  // Flattened properties for easier access
  totalBookings: number;
  bookingsGrowth: number;
  totalSpent: number;
  spentGrowth: number;
  favoriteProfessionals: number;
  favoritesGrowth: number;
  
  // Additional data
  monthlyData: MonthlyData[];
  favoriteServices: FavoriteService[];
  isProfessional: false;
}

export type AnalyticsData = ProfessionalAnalytics | ClientAnalytics;

export interface PlatformMetric {
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface PlatformMonthlyData {
  month: string;
  professionals: number;
  clients: number;
  bookings: number;
}

export interface PlatformAnalytics {
  metrics: PlatformMetric[];
  monthlyGrowth: PlatformMonthlyData[];
  overview: {
    totalProfessionals: number;
    totalClients: number;
    totalServices: number;
    completedBookings: number;
    platformRevenue: number;
    averageRating: number;
    averageResponseTime: number;
  };
}

export interface TimeAnalytics {
  hour: string;
  bookings: number;
}

export interface ClientSegmentation {
  segment: string;
  value: number;
  color: string;
}

class AnalyticsApiService {
  // Get user analytics (professional or client)
  async getUserAnalytics(timeRange: string = '6m'): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>(
      `${API_ENDPOINTS.ANALYTICS.BASE}?timeRange=${timeRange}`
    );
    return response.data;
  }

  // Get platform analytics
  async getPlatformAnalytics(timeRange: string = '6m'): Promise<PlatformAnalytics> {
    const response = await apiClient.get<PlatformAnalytics>(
      `${API_ENDPOINTS.ANALYTICS.BASE}/platform?timeRange=${timeRange}`
    );
    return response.data;
  }

  // Get professional stats (for individual professional pages)
  async getProfessionalStats(professionalId: string): Promise<{
    totalBookings: number;
    completedBookings: number;
    avgRating: number;
    totalReviews: number;
    responseTime: string;
    completionRate: number;
    thisMonthBookings: number;
    revenue: number;
  }> {
    const response = await apiClient.get<{
      totalBookings: number;
      completedBookings: number;
      avgRating: number;
      totalReviews: number;
      responseTime: string;
      completionRate: number;
      thisMonthBookings: number;
      revenue: number;
    }>(`${API_ENDPOINTS.ANALYTICS.PROFESSIONAL}/${professionalId}`);
    return response.data;
  }

  // Get booking analytics
  async getBookingAnalytics(timeRange: string = '6m'): Promise<{
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    monthlyBookings: MonthlyData[];
    topServices: Array<{
      serviceName: string;
      bookings: number;
      revenue: number;
    }>;
  }> {
    const response = await apiClient.get<{
      totalBookings: number;
      completedBookings: number;
      pendingBookings: number;
      cancelledBookings: number;
      monthlyBookings: MonthlyData[];
      topServices: Array<{
        serviceName: string;
        bookings: number;
        revenue: number;
      }>;
    }>(`${API_ENDPOINTS.ANALYTICS.BOOKINGS}?timeRange=${timeRange}`);
    return response.data;
  }
  // Get revenue analytics
  async getRevenueAnalytics(timeRange: string = '6m'): Promise<{
    totalRevenue: number;
    monthlyRevenue: MonthlyData[];
    revenueByCategory: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
    averageBookingValue: number;
  }> {
    const response = await apiClient.get<{
      totalRevenue: number;
      monthlyRevenue: MonthlyData[];
      revenueByCategory: Array<{
        category: string;
        revenue: number;
        percentage: number;
      }>;
      averageBookingValue: number;
    }>(`${API_ENDPOINTS.ANALYTICS.REVENUE}?timeRange=${timeRange}`);
    return response.data;
  }

  // Get time analytics
  async getTimeAnalytics(timeRange: string = '6m'): Promise<TimeAnalytics[]> {
    const response = await fetch(`/api/analytics/time?timeRange=${timeRange}`);
    if (!response.ok) {
      throw new Error('Failed to fetch time analytics');
    }
    return response.json();
  }

  // Get client segmentation (for professionals only)
  async getClientSegmentation(timeRange: string = '6m'): Promise<ClientSegmentation[]> {
    const response = await fetch(`/api/analytics/segmentation?timeRange=${timeRange}`);
    if (!response.ok) {
      throw new Error('Failed to fetch client segmentation');
    }
    return response.json();
  }
}

export const analyticsApi = new AnalyticsApiService();
