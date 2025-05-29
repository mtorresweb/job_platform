// Service for managing bookings
import { apiClient, PaginationParams } from '@/shared/utils/api-client';
import { API_ENDPOINTS } from '@/shared/constants/api';

export interface Booking {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledAt: string;
  duration: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  cancellationReason?: string;
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
  };
  service: {
    id: string;
    title: string;
    duration: number;
    price: number;
    category: {
      name: string;
      icon: string;
    };
  };
  review?: {
    id: string;
    rating: number;
    comment?: string;
  };
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateBookingData {
  serviceId: string;
  professionalId: string;
  scheduledAt: string;
  notes?: string;
}

export interface UpdateBookingData {
  scheduledAt?: string;
  notes?: string;
}

export interface BookingFilters {
  status?: BookingStatus[];
  dateFrom?: string;
  dateTo?: string;
  serviceId?: string;
  professionalId?: string;
}

export interface BookingParams extends PaginationParams {
  filters?: BookingFilters;
}

class BookingsApiService {
  // Get user bookings (as client)
  async getUserBookings(params: BookingParams = {}): Promise<{
    bookings: Booking[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get<{
      bookings: Booking[];
      total: number;
      hasMore: boolean;
    }>(API_ENDPOINTS.BOOKINGS.USER_BOOKINGS, params as Record<string, unknown>);
    return response.data;
  }

  // Get professional bookings
  async getProfessionalBookings(params: BookingParams = {}): Promise<{
    bookings: Booking[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get<{
      bookings: Booking[];
      total: number;
      hasMore: boolean;
    }>(API_ENDPOINTS.BOOKINGS.PROFESSIONAL_BOOKINGS, params as Record<string, unknown>);
    return response.data;
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking> {
    const response = await apiClient.get<Booking>(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`);
    return response.data;
  }

  // Create new booking
  async createBooking(data: CreateBookingData): Promise<Booking> {
    const response = await apiClient.post<Booking>(API_ENDPOINTS.BOOKINGS.CREATE, data);
    return response.data;
  }

  // Update booking (only before confirmation)
  async updateBooking(id: string, data: UpdateBookingData): Promise<Booking> {
    const response = await apiClient.put<Booking>(`${API_ENDPOINTS.BOOKINGS.UPDATE}/${id}`, data);
    return response.data;
  }

  // Confirm booking (professional only)
  async confirmBooking(id: string): Promise<Booking> {
    const response = await apiClient.post<Booking>(`${API_ENDPOINTS.BOOKINGS.CONFIRM}/${id}`);
    return response.data;
  }

  // Cancel booking
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await apiClient.post<Booking>(`${API_ENDPOINTS.BOOKINGS.CANCEL}/${id}`, {
      reason,
    });
    return response.data;
  }

  // Complete booking (professional only)
  async completeBooking(id: string): Promise<Booking> {
    const response = await apiClient.post<Booking>(`${API_ENDPOINTS.BOOKINGS.COMPLETE}/${id}`);
    return response.data;
  }

  // Get booking statistics
  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    thisMonth: number;
    revenue: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      thisMonth: number;
      revenue: number;
    }>(`${API_ENDPOINTS.BOOKINGS.BASE}/stats`);
    return response.data;
  }

  // Check availability for a service/professional
  async checkAvailability(
    professionalId: string,
    date: string,
    duration: number
  ): Promise<{
    available: boolean;
    suggestedTimes: string[];
  }> {
    const response = await apiClient.get<{
      available: boolean;
      suggestedTimes: string[];
    }>(`${API_ENDPOINTS.BOOKINGS.BASE}/availability`, {
      professionalId,
      date,
      duration,
    } as Record<string, unknown>);
    return response.data;
  }
}

export const bookingsApi = new BookingsApiService();
