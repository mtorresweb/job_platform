// React Query hooks for reviews
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  reviewsApi, 
  CreateReviewData, 
  UpdateReviewData,
  ReviewsParams,
  CreateReviewResponse,
} from '@/shared/utils/reviews-api';
import { BOOKINGS_QUERY_KEYS } from '@/shared/hooks/useBookings';

// Query Keys
export const REVIEWS_QUERY_KEYS = {
  all: ['reviews'] as const,
  lists: () => [...REVIEWS_QUERY_KEYS.all, 'list'] as const,
  list: (params: ReviewsParams) => [...REVIEWS_QUERY_KEYS.lists(), params] as const,
  professional: (professionalId: string, params: Omit<ReviewsParams, 'professionalId'>) => 
    [...REVIEWS_QUERY_KEYS.lists(), 'professional', professionalId, params] as const,
  service: (serviceId: string, params: Omit<ReviewsParams, 'serviceId'>) => 
    [...REVIEWS_QUERY_KEYS.lists(), 'service', serviceId, params] as const,
  testimonials: () => [...REVIEWS_QUERY_KEYS.all, 'testimonials'] as const,
  platformStats: () => [...REVIEWS_QUERY_KEYS.all, 'platform-stats'] as const,
} as const;

// Hooks for fetching data
export function useReviews(params: ReviewsParams = {}) {
  return useQuery({
    queryKey: REVIEWS_QUERY_KEYS.list(params),
    queryFn: () => reviewsApi.getReviews(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProfessionalReviews(professionalId: string, params: Omit<ReviewsParams, 'professionalId'> = {}) {
  return useQuery({
    queryKey: REVIEWS_QUERY_KEYS.professional(professionalId, params),
    queryFn: () => reviewsApi.getProfessionalReviews(professionalId, params),
    enabled: Boolean(professionalId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useServiceReviews(serviceId: string, params: Omit<ReviewsParams, 'serviceId'> = {}) {
  return useQuery({
    queryKey: REVIEWS_QUERY_KEYS.service(serviceId, params),
    queryFn: () => reviewsApi.getServiceReviews(serviceId, params),
    enabled: Boolean(serviceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeaturedTestimonials(limit = 10) {
  return useQuery({
    queryKey: REVIEWS_QUERY_KEYS.testimonials(),
    queryFn: () => reviewsApi.getFeaturedTestimonials(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: REVIEWS_QUERY_KEYS.platformStats(),
    queryFn: () => reviewsApi.getPlatformStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Mutation hooks
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewsApi.createReview(data),
    onSuccess: (payload: CreateReviewResponse) => {
      toast.success('Reseña creada exitosamente');
      console.log('[createReview] success payload', payload);
      
      const newReview = payload?.review;

      if (!newReview) {
        toast.error('No se pudo obtener la reseña creada');
        return;
      }

      // Invalidate reviews lists
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.lists() 
      });

      // Invalidate bookings to reflect review status
      queryClient.invalidateQueries({
        queryKey: BOOKINGS_QUERY_KEYS.lists()
      });
      
      // Invalidate professional reviews if present
      if (newReview?.professionalId) {
        queryClient.invalidateQueries({ 
          queryKey: REVIEWS_QUERY_KEYS.professional(newReview.professionalId, {}) 
        });
      }
      
      // Invalidate service reviews
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.service(newReview.booking.service.id, {}) 
      });

      // Invalidate testimonials
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.testimonials() 
      });
      
      // Invalidate platform stats
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.platformStats() 
      });

      // Refresh current user to reflect updated review count/rating in profile
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Optimistically patch currentUser cache with updated rating/reviewCount if provided
      if (payload.professional) {
        queryClient.setQueryData(["currentUser"], (current: any) => {
          if (!current?.professional) return current;
          return {
            ...current,
            professional: {
              ...current.professional,
              rating: payload.professional.rating,
              reviewCount: payload.professional.reviewCount,
            },
          };
        });
      }
    },
    onError: (error: { message?: string }) => {
      console.error('[createReview] error', error);
      toast.error(error.message || 'Error al crear la reseña');
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReviewData }) => 
      reviewsApi.updateReview(id, data),
    onSuccess: (updatedReview) => {
      toast.success('Respuesta a reseña actualizada exitosamente');
      
      // Invalidate reviews lists
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.lists() 
      });
      
      // Invalidate professional reviews
      queryClient.invalidateQueries({ 
        queryKey: REVIEWS_QUERY_KEYS.professional(updatedReview.professionalId, {}) 
      });

      // Invalidate bookings so responses appear
      queryClient.invalidateQueries({
        queryKey: BOOKINGS_QUERY_KEYS.lists()
      });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al actualizar la respuesta');
    },
  });
}

// Helper hooks for specific use cases
export function useTopRatedReviews(limit = 6) {
  return useReviews({
    limit,
  });
}

export function useRecentReviews(limit = 10) {
  return useReviews({
    limit,
  });
}
