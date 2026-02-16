import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { professionalsApi, PortfolioItem, UpsertPortfolioData } from '@/shared/utils/professionals-api';
import { PROFESSIONALS_QUERY_KEYS } from '@/shared/hooks/useProfessionals';

export const PORTFOLIO_QUERY_KEYS = {
  all: ['portfolio'] as const,
  lists: () => [...PORTFOLIO_QUERY_KEYS.all, 'list'] as const,
  list: (professionalId: string) => [...PORTFOLIO_QUERY_KEYS.lists(), professionalId] as const,
  item: (id: string) => [...PORTFOLIO_QUERY_KEYS.all, 'item', id] as const,
} as const;

export function useProfessionalPortfolio(professionalId?: string) {
  const keyId = professionalId || 'me';
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.list(keyId),
    queryFn: () => professionalsApi.getPortfolio(professionalId),
    enabled: Boolean(keyId),
    staleTime: 60_000,
  });
}

export function useUpsertPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertPortfolioData) => professionalsApi.upsertPortfolio(data),
    onSuccess: (item: PortfolioItem, variables) => {
      const professionalId = item.professionalId || variables.professionalId;
      const cacheKey = professionalId || 'me';
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.list(cacheKey) });
      if (professionalId) {
        queryClient.invalidateQueries({ queryKey: PROFESSIONALS_QUERY_KEYS.detail(professionalId) });
      }
      toast.success('Portafolio guardado');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'No se pudo guardar el portafolio');
    },
  });
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; professionalId: string }) => professionalsApi.deletePortfolio(id),
    onSuccess: (_data, variables) => {
      if (variables.professionalId) {
        queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.list(variables.professionalId) });
        queryClient.invalidateQueries({ queryKey: PROFESSIONALS_QUERY_KEYS.detail(variables.professionalId) });
      }
      toast.success('Elemento eliminado');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'No se pudo eliminar');
    },
  });
}
