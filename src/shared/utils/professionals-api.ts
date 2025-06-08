// API service for managing professionals
import { apiClient, SearchParams } from '@/shared/utils/api-client';

export interface Professional {
  id: string;
  userId: string;
  bio: string;
  experience: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  specialties: string[];
  hourlyRate: number;
  address: string;
  city: string;
  state: string;
  distance?: number;
  avatar?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
  };
  services: Array<{
    id: string;
    title: string;
    price: number;
    duration: number;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  availability?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    client: {
      id: string;
      name: string;
      avatar?: string;
    };
    booking: {
      service: {
        title: string;
      };
    };
  }>;
  _count?: {
    services: number;
  };
}

export interface ProfessionalSearchFilters extends Record<string, unknown> {
  category?: string;
  city?: string;
  state?: string;
  minRating?: number;
  isVerified?: boolean;
  specialties?: string[];
  minHourlyRate?: number;
  maxHourlyRate?: number;
}

export interface ProfessionalSearchParams extends SearchParams {
  filters?: ProfessionalSearchFilters;
}

export interface UpdateProfessionalData {
  bio?: string;
  experience?: number;
  specialties?: string[];
  hourlyRate?: number;
  address?: string;
  city?: string;
  state?: string;
  availability?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
}

class ProfessionalsApiService {
  // Get all professionals with filtering and pagination
  async getProfessionals(params: ProfessionalSearchParams = {}): Promise<{
    professionals: Professional[];
    total: number;
    hasMore: boolean;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { filters, ...searchParams } = params;
    const queryParams = {
      ...searchParams,
      ...filters,
    };

    const response = await apiClient.get<{
      professionals: Professional[];
      total: number;
      hasMore: boolean;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/professionals', queryParams as Record<string, unknown>);
    
    return response.data;
  }

  // Search professionals
  async searchProfessionals(params: ProfessionalSearchParams): Promise<{
    professionals: Professional[];
    total: number;
    hasMore: boolean;
    facets?: {
      categories: Array<{ name: string; count: number }>;
      cities: Array<{ name: string; count: number }>;
      avgRating: number;
      priceRange: { min: number; max: number };
    };
  }> {
    const { filters, ...searchParams } = params;
    const queryParams = {
      ...searchParams,
      ...filters,
    };

    const response = await apiClient.get<{
      professionals: Professional[];
      total: number;
      hasMore: boolean;
      facets?: {
        categories: Array<{ name: string; count: number }>;
        cities: Array<{ name: string; count: number }>;
        avgRating: number;
        priceRange: { min: number; max: number };
      };
    }>('/professionals/search', queryParams as Record<string, unknown>);

    return response.data;
  }

  // Get professional by ID
  async getProfessionalById(id: string): Promise<Professional> {
    const response = await apiClient.get<Professional>(`/professionals/${id}`);
    return response.data;
  }

  // Update professional profile (only the professional themselves)
  async updateProfessional(id: string, data: UpdateProfessionalData): Promise<Professional> {
    const response = await apiClient.put<Professional>(`/professionals/${id}`, data);
    return response.data;
  }

  // Get featured professionals (with high ratings)
  async getFeaturedProfessionals(limit = 6): Promise<Professional[]> {
    const response = await apiClient.get<{
      professionals: Professional[];
    }>('/professionals', {
      sortBy: 'rating',
      sortOrder: 'desc',
      isVerified: true,
      limit,
    });
    return response.data.professionals;
  }

  // Get nearby professionals (location-based search)
  async getNearbyProfessionals(
    latitude: number,
    longitude: number,
    radius = 25,
    params: ProfessionalSearchParams = {}
  ): Promise<{
    professionals: Professional[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get<{
      professionals: Professional[];
      total: number;
      hasMore: boolean;
    }>('/search/nearby', {
      latitude,
      longitude,
      radius,
      ...params,
    });
    return response.data;
  }

  // Get professional statistics
  async getProfessionalStats(id: string): Promise<{
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
    }>(`/professionals/${id}/stats`);
    return response.data;
  }

  // Get available time slots for a professional
  async getAvailableSlots(
    professionalId: string,
    date: string,
    duration: number
  ): Promise<{
    slots: Array<{
      time: string;
      available: boolean;
    }>;
    nextAvailableDate?: string;
  }> {
    const response = await apiClient.get<{
      slots: Array<{
        time: string;
        available: boolean;
      }>;
      nextAvailableDate?: string;
    }>(`/professionals/${professionalId}/availability`, {
      date,
      duration,
    });
    return response.data;
  }
}

export const professionalsApi = new ProfessionalsApiService();