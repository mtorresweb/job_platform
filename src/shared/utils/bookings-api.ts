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
    response?: string;
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
  professionalId?: string;
  scheduledAt: string;
  notes?: string;
}

export interface UpdateBookingData {
  scheduledAt?: string;
  notes?: string;
  status?: BookingStatus;
  cancellationReason?: string;
  message?: string;
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
      bookings?: Booking[];
      data?: { bookings?: Booking[]; total?: number; hasMore?: boolean };
      total?: number;
      hasMore?: boolean;
      success?: boolean;
    }>(API_ENDPOINTS.BOOKINGS.BASE, {
      ...params,
      role: "client",
    } as Record<string, unknown>);

    const payload = ("data" in response ? response.data : response) as Record<string, any>;
    const bookings = payload.bookings || payload.data?.bookings || [];
    const total = payload.total ?? payload.data?.total ?? bookings.length;
    const hasMore = payload.hasMore ?? payload.data?.hasMore ?? false;
    return { bookings, total, hasMore };
  }

  // Get professional bookings
  async getProfessionalBookings(params: BookingParams = {}): Promise<{
    bookings: Booking[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get<{
      bookings?: Booking[];
      data?: { bookings?: Booking[]; total?: number; hasMore?: boolean };
      total?: number;
      hasMore?: boolean;
      success?: boolean;
    }>(API_ENDPOINTS.BOOKINGS.BASE, {
      ...params,
      role: "professional",
    } as Record<string, unknown>);

    const payload = ("data" in response ? response.data : response) as Record<string, any>;
    const bookings = payload.bookings || payload.data?.bookings || [];
    const total = payload.total ?? payload.data?.total ?? bookings.length;
    const hasMore = payload.hasMore ?? payload.data?.hasMore ?? false;
    return { bookings, total, hasMore };
  }

  // Get all bookings (admin scope)
  async getAllBookings(params: BookingParams = {}): Promise<{
    bookings: Booking[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get<{
      bookings?: Booking[];
      data?: { bookings?: Booking[]; total?: number; hasMore?: boolean };
      total?: number;
      hasMore?: boolean;
      success?: boolean;
    }>(API_ENDPOINTS.BOOKINGS.BASE, {
      ...params,
      scope: "all",
    } as Record<string, unknown>);

    const payload = ("data" in response ? response.data : response) as Record<string, any>;
    const bookings = payload.bookings || payload.data?.bookings || [];
    const total = payload.total ?? payload.data?.total ?? bookings.length;
    const hasMore = payload.hasMore ?? payload.data?.hasMore ?? false;
    return { bookings, total, hasMore };
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking> {
    const response = await apiClient.get<Booking | { data?: Booking }>(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`);
    const payload = ("data" in response ? response.data : response) as Record<string, any>;
    if (payload && (payload as Booking).id) {
      return payload as Booking;
    }
    return (payload?.data as Booking) || (payload as Booking);
  }

  // Create new booking
  async createBooking(data: CreateBookingData): Promise<Booking> {
    const response = await apiClient.post<Booking>(API_ENDPOINTS.BOOKINGS.BASE, data);
    return response.data;
  }

  // Update booking (only before confirmation)
  async updateBooking(id: string, data: UpdateBookingData): Promise<Booking> {
    const response = await apiClient.put<Booking>(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`, data);
    return response.data;
  }

  // Confirm booking (professional only)
  async confirmBooking(id: string, message?: string): Promise<Booking> {
    const response = await apiClient.put<Booking>(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`, {
      status: BookingStatus.CONFIRMED,
      message,
    });
    return response.data;
  }

  // Cancel booking
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await apiClient.put<Booking>(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`, {
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
    });
    return response.data;
  }

  // Reschedule booking (client preferred)
  async rescheduleBooking(id: string, scheduledAt: string, message?: string): Promise<Booking> {
    const response = await apiClient.put<Booking>(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`, {
      scheduledAt,
      message,
    });
    return response.data;
  }

  // Complete booking (professional only)
  async completeBooking(id: string): Promise<Booking> {
    const response = await apiClient.put<Booking>(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`, {
      status: BookingStatus.COMPLETED,
    });
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
    // Fallback: derive simple counts from professional bookings endpoint
    const response = await apiClient.get<{
      bookings: Booking[];
      data?: { bookings: Booking[] };
      total: number;
      hasMore: boolean;
    }>(API_ENDPOINTS.BOOKINGS.BASE, { role: "professional", limit: 200 } as Record<string, unknown>);

    const payload = ("data" in response ? response.data : response) as Record<string, any>;
    const bookings = payload.bookings || payload.data?.bookings || [];
    const stats = bookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        const statusMap: Record<string, keyof typeof acc> = {
          PENDING: "pending",
          CONFIRMED: "confirmed",
          IN_PROGRESS: "pending",
          COMPLETED: "completed",
          CANCELLED: "cancelled",
        };

        const key = statusMap[booking.status];
        if (key) acc[key] += 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
        thisMonth: 0,
      },
    );

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    stats.thisMonth = bookings.filter((b) => {
      const date = new Date(b.scheduledAt);
      return `${date.getFullYear()}-${date.getMonth()}` === monthKey;
    }).length;

    return stats;
  }

  // Check availability for a service/professional
  async checkAvailability(
    professionalId: string,
    date: string,
    duration: number
  ): Promise<{
    available: boolean;
    suggestedTimes: string[];
    takenSlots: string[];
  }> {
    const response = await apiClient.get<{
      available: boolean;
      suggestedTimes: string[];
      takenSlots?: string[];
    }>(API_ENDPOINTS.BOOKINGS.AVAILABILITY, {
      professionalId,
      date,
      duration,
    });

    return {
      available: response.data?.available ?? false,
      suggestedTimes: response.data?.suggestedTimes ?? [],
      takenSlots: response.data?.takenSlots ?? [],
    };
  }
}

export const bookingsApi = new BookingsApiService();
