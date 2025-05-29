// React Query hooks for services
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  servicesApi, 
  CreateServiceData, 
  UpdateServiceData,
  ServiceSearchParams 
} from '@/shared/utils/services-api';

// Query Keys
export const SERVICES_QUERY_KEYS = {
  all: ['services'] as const,
  categories: () => [...SERVICES_QUERY_KEYS.all, 'categories'] as const,
  lists: () => [...SERVICES_QUERY_KEYS.all, 'list'] as const,
  list: (params: ServiceSearchParams) => [...SERVICES_QUERY_KEYS.lists(), params] as const,
  details: () => [...SERVICES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SERVICES_QUERY_KEYS.details(), id] as const,
  featured: () => [...SERVICES_QUERY_KEYS.all, 'featured'] as const,
  professional: (id: string) => [...SERVICES_QUERY_KEYS.all, 'professional', id] as const,
  search: (params: ServiceSearchParams) => [...SERVICES_QUERY_KEYS.all, 'search', params] as const,
} as const;

// Hooks for fetching data
export function useServiceCategories() {
  return useQuery({
    queryKey: SERVICES_QUERY_KEYS.categories(),
    queryFn: servicesApi.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useServices(params: ServiceSearchParams = {}) {
  return useQuery({
    queryKey: SERVICES_QUERY_KEYS.list(params),
    queryFn: () => servicesApi.getServices(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useInfiniteServices(params: ServiceSearchParams = {}) {
  return useInfiniteQuery({
    queryKey: SERVICES_QUERY_KEYS.list(params),
    queryFn: ({ pageParam = 1 }) => 
      servicesApi.getServices({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => 
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1 * 60 * 1000,
  });
}

export function useSearchServices(params: ServiceSearchParams) {
  return useQuery({
    queryKey: SERVICES_QUERY_KEYS.search(params),
    queryFn: () => servicesApi.searchServices(params),
    enabled: Boolean(params.query && params.query.length > 0),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useFeaturedServices(limit = 6) {
  return useQuery({
    queryKey: SERVICES_QUERY_KEYS.featured(),
    queryFn: () => servicesApi.getFeaturedServices(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: SERVICES_QUERY_KEYS.detail(id),
    queryFn: () => servicesApi.getServiceById(id),
    enabled: Boolean(id),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useProfessionalServices(professionalId: string, params = {}) {
  return useQuery({
    queryKey: SERVICES_QUERY_KEYS.professional(professionalId),
    queryFn: () => servicesApi.getServicesByProfessional(professionalId, params),
    enabled: Boolean(professionalId),
    staleTime: 1 * 60 * 1000,
  });
}

// Mutation hooks
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceData) => servicesApi.createService(data),
    onSuccess: (newService) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEYS.all });
      queryClient.invalidateQueries({ 
        queryKey: SERVICES_QUERY_KEYS.professional(newService.professionalId) 
      });
      
      toast.success('Servicio creado exitosamente');
    },    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al crear el servicio');
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateServiceData) => servicesApi.updateService(data),
    onSuccess: (updatedService) => {
      // Update cache
      queryClient.setQueryData(
        SERVICES_QUERY_KEYS.detail(updatedService.id),
        updatedService
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ 
        queryKey: SERVICES_QUERY_KEYS.professional(updatedService.professionalId) 
      });
      
      toast.success('Servicio actualizado exitosamente');
    },    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al actualizar el servicio');
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesApi.deleteService(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: SERVICES_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEYS.all });
      
      toast.success('Servicio eliminado exitosamente');
    },    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al eliminar el servicio');
    },
  });
}

export function useToggleServiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      servicesApi.toggleServiceStatus(id, isActive),
    onSuccess: (updatedService) => {
      // Update cache
      queryClient.setQueryData(
        SERVICES_QUERY_KEYS.detail(updatedService.id),
        updatedService
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEYS.lists() });
      
      const action = updatedService.isActive ? 'activado' : 'desactivado';
      toast.success(`Servicio ${action} exitosamente`);
    },    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al cambiar el estado del servicio');
    },
  });
}

export function useIncrementViewCount() {
  return useMutation({
    mutationFn: (id: string) => servicesApi.incrementViewCount(id),
    // Silent mutation - no success/error notifications
  });
}
