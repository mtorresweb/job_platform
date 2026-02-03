// Reviews API service
import { apiClient } from '@/shared/utils/api-client';
import { API_ENDPOINTS } from '@/shared/constants/api';

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  professionalId: string;
  rating: number;
  comment?: string;
  response?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    avatar?: string;
  };
  booking: {
    service: {
      id: string;
      title: string;
    };
  };
}

export interface CreateReviewResponse {
  review: Review;
  professional?: {
    id: string;
    userId: string;
    rating: number;
    reviewCount: number;
  };
}

export interface CreateReviewData {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  response?: string;
}

export interface ReviewsParams {
  professionalId?: string;
  serviceId?: string;
  page?: number;
  limit?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  hasMore: boolean;
}

export interface TestimonialData {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  serviceTitle: string;
  city?: string;
  state?: string;
  createdAt: string;
  isVerified: boolean;
  category: 'professional' | 'client';
  role?: string;
}

class ReviewsApiService {
  // Get reviews (with optional filters)
  async getReviews(params: ReviewsParams = {}): Promise<ReviewsResponse> {
    const response = await apiClient.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.BASE, params as Record<string, unknown>);
    return response.data;
  }

  // Get professional reviews
  async getProfessionalReviews(professionalId: string, params: Omit<ReviewsParams, 'professionalId'> = {}): Promise<ReviewsResponse> {
    const response = await apiClient.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.PROFESSIONAL_REVIEWS, {
      professionalId,
      ...params,
    } as Record<string, unknown>);
    return response.data;
  }

  // Get service reviews  
  async getServiceReviews(serviceId: string, params: Omit<ReviewsParams, 'serviceId'> = {}): Promise<ReviewsResponse> {
    const response = await apiClient.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.SERVICE_REVIEWS, {
      serviceId,
      ...params,
    } as Record<string, unknown>);
    return response.data;
  }

  // Create review
  async createReview(data: CreateReviewData): Promise<CreateReviewResponse> {
    const response = await apiClient.post<CreateReviewResponse>(API_ENDPOINTS.REVIEWS.CREATE, data);
    // API returns { success, data: { review, professional } }
    const raw = (response as any).data ?? response;
    return (raw as any).data ?? raw;
  }

  // Update review (professional response)
  async updateReview(id: string, data: UpdateReviewData): Promise<Review> {
    const response = await apiClient.put<Review>(`${API_ENDPOINTS.REVIEWS.UPDATE}/${id}`, data);
    return response.data;
  }

  // Get featured testimonials for marketing pages
  async getFeaturedTestimonials(limit = 10): Promise<TestimonialData[]> {
    const response = await apiClient.get<ReviewsResponse>(`${API_ENDPOINTS.REVIEWS.BASE}/featured`, {
      limit,
      minRating: 4.5,
    } as Record<string, unknown>);
    
    // Transform reviews to testimonial format
    return response.data.reviews.map(review => ({
      id: review.id,
      name: review.client.name,
      avatar: review.client.avatar,
      rating: review.rating,
      comment: review.comment || '',
      serviceTitle: review.booking.service.title,
      createdAt: review.createdAt,
      isVerified: review.isVerified,
      category: 'client' as const,
      role: `Cliente de ${review.booking.service.title}`,
    }));
  }  // Get platform stats for testimonials page
  async getPlatformStats(): Promise<{
    totalReviews: number;
    averageRating: number;
    verifiedReviews: number;
    totalSavings: number;
    activeUsers: number;
    satisfactionRate: number;
    completedBookings: number;
    totalProfessionals: number;
    totalBookings: number;
  }> {
    const response = await apiClient.get<{
      totalReviews: number;
      averageRating: number;
      verifiedReviews: number;
      totalSavings: number;
      activeUsers: number;
      satisfactionRate: number;
      completedBookings: number;
      totalProfessionals: number;
      totalBookings: number;
    }>(`${API_ENDPOINTS.REVIEWS.BASE}/platform-stats`);
    return response.data;
  }
}

export const reviewsApi = new ReviewsApiService();
