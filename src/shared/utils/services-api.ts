// Service for managing services/categories
import { apiClient, PaginationParams, SearchParams } from '@/shared/utils/api-client';
import { API_ENDPOINTS } from '@/shared/constants/api';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    services: number;
  };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  professionalId: string;
  price: number;
  duration: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  viewCount: number;
  bookingCount: number;
  createdAt: string;
  updatedAt: string;
  category?: ServiceCategory;
  professional?: {
    id: string;
    userId: string;
    bio: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
}

export interface CreateServiceData {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  duration: number;
  images?: string[];
  tags?: string[];
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
  isActive?: boolean;
}

export interface ServiceSearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  rating?: number;
  location?: string;
  tags?: string[];
  isVerified?: boolean;
}

export interface ServiceSearchParams extends SearchParams {
  filters?: ServiceSearchFilters & Record<string, unknown>;
}

class ServicesApiService {
  // Get all service categories
  async getCategories(): Promise<ServiceCategory[]> {
    const response = await apiClient.get<ServiceCategory[]>(API_ENDPOINTS.SERVICES.CATEGORIES);
    return response.data;
  }
  // Get services with pagination and filtering
  async getServices(params: ServiceSearchParams = {}): Promise<{
    services: Service[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get<{
      services: Service[];
      total: number;
      hasMore: boolean;
    }>(API_ENDPOINTS.SERVICES.BASE, params as Record<string, unknown>);
    return response.data;
  }
  // Search services
  async searchServices(params: ServiceSearchParams): Promise<{
    services: Service[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get<{
      services: Service[];
      total: number;
      hasMore: boolean;
    }>(API_ENDPOINTS.SERVICES.SEARCH, params as Record<string, unknown>);
    return response.data;
  }

  // Get featured services
  async getFeaturedServices(limit: number = 6): Promise<Service[]> {
    const response = await apiClient.get<Service[]>(API_ENDPOINTS.SERVICES.FEATURED, { limit });
    return response.data;
  }

  // Get service by ID
  async getServiceById(id: string): Promise<Service> {
    const response = await apiClient.get<Service>(`${API_ENDPOINTS.SERVICES.BASE}/${id}`);
    return response.data;
  }
  // Get services by professional
  async getServicesByProfessional(professionalId: string, params: PaginationParams = {}): Promise<{
    services: Service[];
    total: number;
  }> {
    const response = await apiClient.get<{
      services: Service[];
      total: number;
    }>(`${API_ENDPOINTS.SERVICES.BY_PROFESSIONAL}/${professionalId}`, params as Record<string, unknown>);
    return response.data;
  }

  // Create new service (professionals only)
  async createService(data: CreateServiceData): Promise<Service> {
    const response = await apiClient.post<Service>(API_ENDPOINTS.SERVICES.BASE, data);
    return response.data;
  }

  // Update service (professionals only)
  async updateService(data: UpdateServiceData): Promise<Service> {
    const response = await apiClient.put<Service>(`${API_ENDPOINTS.SERVICES.BASE}/${data.id}`, data);
    return response.data;
  }

  // Delete service (professionals only)
  async deleteService(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.SERVICES.BASE}/${id}`);
  }

  // Toggle service active status
  async toggleServiceStatus(id: string, isActive: boolean): Promise<Service> {
    const response = await apiClient.patch<Service>(`${API_ENDPOINTS.SERVICES.BASE}/${id}/status`, {
      isActive,
    });
    return response.data;
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.SERVICES.BASE}/${id}/view`);
  }
}

export const servicesApi = new ServicesApiService();
