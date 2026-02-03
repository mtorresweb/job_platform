// React Query hooks for professionals
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  professionalsApi, 
  ProfessionalSearchParams,
  UpdateProfessionalData 
} from '@/shared/utils/professionals-api';

// Query Keys
export const PROFESSIONALS_QUERY_KEYS = {
  all: ['professionals'] as const,
  lists: () => [...PROFESSIONALS_QUERY_KEYS.all, 'list'] as const,
  list: (params: ProfessionalSearchParams) => [...PROFESSIONALS_QUERY_KEYS.lists(), params] as const,
  details: () => [...PROFESSIONALS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROFESSIONALS_QUERY_KEYS.details(), id] as const,
  featured: () => [...PROFESSIONALS_QUERY_KEYS.all, 'featured'] as const,
  nearby: (lat: number, lng: number, radius: number) => 
    [...PROFESSIONALS_QUERY_KEYS.all, 'nearby', lat, lng, radius] as const,
  search: (params: ProfessionalSearchParams) => [...PROFESSIONALS_QUERY_KEYS.all, 'search', params] as const,
  stats: (id: string) => [...PROFESSIONALS_QUERY_KEYS.all, 'stats', id] as const,
  availability: (id: string, date: string, duration: number) => 
    [...PROFESSIONALS_QUERY_KEYS.all, 'availability', id, date, duration] as const,
} as const;

// Hooks for fetching data
export function useProfessionals(params: ProfessionalSearchParams = {}) {
  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.list(params),
    queryFn: () => professionalsApi.getProfessionals(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useInfiniteProfessionals(params: ProfessionalSearchParams = {}) {
  return useInfiniteQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.list(params),
    queryFn: ({ pageParam = 1 }) => 
      professionalsApi.getProfessionals({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1 * 60 * 1000,
  });
}

export function useSearchProfessionals(params: ProfessionalSearchParams) {
  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.search(params),
    queryFn: () => professionalsApi.searchProfessionals(params),
    enabled: Boolean(params.query || Object.keys(params.filters || {}).length > 0),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useFeaturedProfessionals(limit = 6) {
  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.featured(),
    queryFn: () => professionalsApi.getFeaturedProfessionals(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProfessional(id: string) {
  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.detail(id),
    queryFn: () => professionalsApi.getProfessionalById(id),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useNearbyProfessionals(
  latitude: number,
  longitude: number,
  radius = 25,
  params: ProfessionalSearchParams = {}
) {
  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.nearby(latitude, longitude, radius),
    queryFn: () => professionalsApi.getNearbyProfessionals(latitude, longitude, radius, params),
    enabled: Boolean(latitude && longitude),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProfessionalStats(id: string) {
  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.stats(id),
    queryFn: () => professionalsApi.getProfessionalStats(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProfessionalAvailability(
  professionalId: string,
  date: string,
  duration: number
) {
  return useQuery({
    queryKey: PROFESSIONALS_QUERY_KEYS.availability(professionalId, date, duration),
    queryFn: () => professionalsApi.getAvailableSlots(professionalId, date, duration),
    enabled: Boolean(professionalId && date && duration),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Mutation hooks
export function useUpdateProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfessionalData }) =>
      professionalsApi.updateProfessional(id, data),
    onSuccess: (updatedProfessional) => {
      // Update the specific professional in cache
      queryClient.setQueryData(
        PROFESSIONALS_QUERY_KEYS.detail(updatedProfessional.userId),
        updatedProfessional
      );

      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ 
        queryKey: PROFESSIONALS_QUERY_KEYS.lists() 
      });
      
      // Invalidate featured list if professional is highly rated
      if (updatedProfessional.rating >= 4.5) {
        queryClient.invalidateQueries({ 
          queryKey: PROFESSIONALS_QUERY_KEYS.featured() 
        });
      }

      toast.success('Perfil actualizado exitosamente');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al actualizar el perfil');
    },
  });
}

// Helper hooks for specific use cases
export function useProfessionalsByCategory(category: string, limit = 6) {
  return useProfessionals({
    filters: { category },
    limit,
    sortBy: 'rating',
    sortOrder: 'desc',
  });
}

export function useProfessionalsByCity(city: string, limit = 10) {
  return useProfessionals({
    filters: { city },
    limit,
    sortBy: 'rating',
    sortOrder: 'desc',
  });
}

export function useTopRatedProfessionals(limit = 10) {
  return useProfessionals({
    filters: { minRating: 4.5, isVerified: true },
    limit,
    sortBy: 'rating',
    sortOrder: 'desc',
  });
}
