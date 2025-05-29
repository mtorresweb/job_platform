// Advanced search API service
import { apiClient, SearchParams } from '@/shared/utils/api-client';
import { API_ENDPOINTS } from '@/shared/constants/api';
import { Service, ServiceCategory } from '@/shared/utils/services-api';

export interface SearchFilters {
  // Location filters
  city?: string;
  state?: string;
  radius?: number; // in kilometers
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Service filters
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  tags?: string[];

  // Professional filters
  minRating?: number;
  isVerified?: boolean;
  hasAvailability?: boolean;
  experience?: number; // minimum years
  
  // Availability filters
  date?: string;
  timeSlot?: {
    start: string;
    end: string;
  };
  
  // Sorting
  sortBy?: 'relevance' | 'price' | 'rating' | 'distance' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  services: Service[];
  professionals: Professional[];
  categories: ServiceCategory[];
  total: number;
  facets: SearchFacets;
  suggestions: string[];
}

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
  distance?: number; // if location search
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  services: Service[];
  availability?: {
    isAvailable: boolean;
    nextAvailableSlot?: string;
  };
}

export interface SearchFacets {
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  priceRanges: Array<{
    min: number;
    max: number;
    count: number;
  }>;
  ratings: Array<{
    rating: number;
    count: number;
  }>;
  locations: Array<{
    city: string;
    state: string;
    count: number;
  }>;
  tags: Array<{
    tag: string;
    count: number;
  }>;
}

export interface SearchSuggestion {
  query: string;
  type: 'service' | 'category' | 'professional' | 'location';
  metadata?: Record<string, unknown>;
}

export interface PopularSearch {
  query: string;
  count: number;
  category?: string;
}

class SearchApiService {
  // Global search across all content
  async globalSearch(
    query: string,
    filters: SearchFilters = {},
    params: SearchParams = {}
  ): Promise<SearchResult> {
    const response = await apiClient.get<SearchResult>(API_ENDPOINTS.SEARCH.GLOBAL, {
      query,
      ...filters,
      ...params,
    });
    return response.data;
  }

  // Search services specifically
  async searchServices(
    query: string,
    filters: SearchFilters = {},
    params: SearchParams = {}
  ): Promise<{
    services: Service[];
    total: number;
    hasMore: boolean;
    facets: SearchFacets;
  }> {
    const response = await apiClient.get<{
      services: Service[];
      total: number;
      hasMore: boolean;
      facets: SearchFacets;
    }>(API_ENDPOINTS.SEARCH.SERVICES, {
      query,
      ...filters,
      ...params,
    });
    return response.data;
  }

  // Search professionals specifically
  async searchProfessionals(
    query: string,
    filters: SearchFilters = {},
    params: SearchParams = {}
  ): Promise<{
    professionals: Professional[];
    total: number;
    hasMore: boolean;
    facets: SearchFacets;
  }> {
    const response = await apiClient.get<{
      professionals: Professional[];
      total: number;
      hasMore: boolean;
      facets: SearchFacets;
    }>(API_ENDPOINTS.SEARCH.PROFESSIONALS, {
      query,
      ...filters,
      ...params,
    });
    return response.data;
  }

  // Get search suggestions as user types
  async getSearchSuggestions(query: string, limit = 5): Promise<SearchSuggestion[]> {
    if (query.length < 2) return [];
    
    const response = await apiClient.get<SearchSuggestion[]>(API_ENDPOINTS.SEARCH.SUGGESTIONS, {
      query,
      limit,
    });
    return response.data;
  }

  // Get popular searches
  async getPopularSearches(category?: string, limit = 10): Promise<PopularSearch[]> {
    const response = await apiClient.get<PopularSearch[]>(`${API_ENDPOINTS.SEARCH.GLOBAL}/popular`, {
      category,
      limit,
    });
    return response.data;
  }

  // Location-based search
  async searchNearby(
    latitude: number,
    longitude: number,
    radius = 25, // km
    query?: string,
    filters: Omit<SearchFilters, 'coordinates' | 'radius'> = {}
  ): Promise<SearchResult> {
    const response = await apiClient.get<SearchResult>(`${API_ENDPOINTS.SEARCH.GLOBAL}/nearby`, {
      query,
      latitude,
      longitude,
      radius,
      ...filters,
    });
    return response.data;
  }

  // Advanced filter search
  async filterSearch(filters: SearchFilters, params: SearchParams = {}): Promise<SearchResult> {
    const response = await apiClient.get<SearchResult>(`${API_ENDPOINTS.SEARCH.GLOBAL}/filter`, {
      ...filters,
      ...params,
    });
    return response.data;
  }

  // Save search for recommendations
  async saveSearch(query: string, filters: SearchFilters): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.SEARCH.GLOBAL}/save`, {
      query,
      filters,
    });
  }

  // Get personalized recommendations
  async getRecommendations(limit = 6): Promise<{
    services: Service[];
    professionals: Professional[];
    categories: ServiceCategory[];
  }> {
    const response = await apiClient.get<{
      services: Service[];
      professionals: Professional[];
      categories: ServiceCategory[];
    }>(`${API_ENDPOINTS.SEARCH.GLOBAL}/recommendations`, { limit });
    return response.data;
  }

  // Get trending searches
  async getTrendingSearches(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<PopularSearch[]> {
    const response = await apiClient.get<PopularSearch[]>(`${API_ENDPOINTS.SEARCH.GLOBAL}/trending`, {
      timeframe,
    });
    return response.data;
  }

  // Report search interaction (for analytics)
  async reportSearchClick(
    query: string,
    resultId: string,
    resultType: 'service' | 'professional' | 'category',
    position: number
  ): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.SEARCH.GLOBAL}/click`, {
      query,
      resultId,
      resultType,
      position,
    });
  }
}

export const searchApi = new SearchApiService();

// Utility functions for search
export function buildSearchQuery(filters: SearchFilters): string {
  const parts: string[] = [];
  
  if (filters.categoryId) {
    parts.push(`category:${filters.categoryId}`);
  }
  
  if (filters.city) {
    parts.push(`city:"${filters.city}"`);
  }
  
  if (filters.minPrice && filters.maxPrice) {
    parts.push(`price:${filters.minPrice}-${filters.maxPrice}`);
  }
  
  if (filters.minRating) {
    parts.push(`rating:>=${filters.minRating}`);
  }
  
  if (filters.isVerified) {
    parts.push('verified:true');
  }
  
  if (filters.tags && filters.tags.length > 0) {
    parts.push(`tags:${filters.tags.map(tag => `"${tag}"`).join(',')}`);
  }
  
  return parts.join(' ');
}

export function parseSearchQuery(query: string): SearchFilters {
  const filters: SearchFilters = {};
  
  // Extract structured parts
  const categoryMatch = query.match(/category:(\w+)/);
  if (categoryMatch) {
    filters.categoryId = categoryMatch[1];
  }
  
  const cityMatch = query.match(/city:"([^"]+)"/);
  if (cityMatch) {
    filters.city = cityMatch[1];
  }
  
  const priceMatch = query.match(/price:(\d+)-(\d+)/);
  if (priceMatch) {
    filters.minPrice = parseInt(priceMatch[1]);
    filters.maxPrice = parseInt(priceMatch[2]);
  }
  
  const ratingMatch = query.match(/rating:>=(\d+)/);
  if (ratingMatch) {
    filters.minRating = parseInt(ratingMatch[1]);
  }
  
  if (query.includes('verified:true')) {
    filters.isVerified = true;
  }
  
  const tagsMatch = query.match(/tags:([^\\s]+)/);
  if (tagsMatch) {
    filters.tags = tagsMatch[1]
      .split(',')
      .map(tag => tag.replace(/"/g, ''));
  }
  
  return filters;
}

// Geolocation utilities
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error('Error al obtener ubicación: ' + error.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
