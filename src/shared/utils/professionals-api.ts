// API service for managing professionals
import { apiClient, SearchParams } from '@/shared/utils/api-client';

export interface Professional {
  id: string;
  userId: string;
  bio: string;
  experience: number;
  rating: number;
  reviewCount: number;
  profileViewCount?: number;
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
  portfolios?: PortfolioItem[];
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

export interface PortfolioItem {
  id: string;
  professionalId: string;
  title: string;
  type: 'EXPERIENCE' | 'CERTIFICATE' | 'PROJECT';
  description?: string | null;
  organization?: string | null;
  link?: string | null;
  attachmentUrl?: string | null;
  tags: string[];
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export interface UpsertPortfolioData {
  id?: string;
  professionalId?: string;
  title: string;
  type: PortfolioItem['type'];
  description?: string | null;
  organization?: string | null;
  link?: string | null;
  attachmentUrl?: string | null;
  tags?: string[];
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
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

  async getPortfolio(professionalId?: string): Promise<PortfolioItem[]> {
    if (!professionalId) {
      // Own portfolio (requires auth)
      const response = await apiClient.get<{ items: PortfolioItem[] }>(`/professionals/portfolio`);
      return (response as any).data?.items ?? (response as any).items ?? [];
    }
    const response = await apiClient.get<{ items: PortfolioItem[] }>(`/professionals/${professionalId}/portfolio`);
    return (response as any).data?.items ?? (response as any).items ?? [];
  }

  async upsertPortfolio(data: UpsertPortfolioData): Promise<PortfolioItem> {
    if (data.id) {
      const response = await apiClient.put<PortfolioItem>(`/professionals/portfolio/${data.id}`, data);
      return (response as any).data ?? (response as any);
    }
    const response = await apiClient.post<PortfolioItem>(`/professionals/portfolio`, data);
    return (response as any).data ?? (response as any);
  }

  async deletePortfolio(id: string): Promise<void> {
    await apiClient.delete(`/professionals/portfolio/${id}`);
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