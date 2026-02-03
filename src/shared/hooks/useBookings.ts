// React Query hooks for bookings
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  bookingsApi, 
  CreateBookingData, 
  UpdateBookingData,
  BookingParams 
} from '@/shared/utils/bookings-api';

// Query Keys
export const BOOKINGS_QUERY_KEYS = {
  all: ['bookings'] as const,
  lists: () => [...BOOKINGS_QUERY_KEYS.all, 'list'] as const,
  userBookings: (params: BookingParams) => [...BOOKINGS_QUERY_KEYS.lists(), 'user', params] as const,
  professionalBookings: (params: BookingParams) => [...BOOKINGS_QUERY_KEYS.lists(), 'professional', params] as const,
  details: () => [...BOOKINGS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BOOKINGS_QUERY_KEYS.details(), id] as const,
  stats: () => [...BOOKINGS_QUERY_KEYS.all, 'stats'] as const,
  availability: (professionalId: string, date: string, duration: number) => 
    [...BOOKINGS_QUERY_KEYS.all, 'availability', professionalId, date, duration] as const,
} as const;

// Hooks for fetching data
export function useUserBookings(params: BookingParams = {}) {
  return useQuery({
    queryKey: BOOKINGS_QUERY_KEYS.userBookings(params),
    queryFn: () => bookingsApi.getUserBookings(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useProfessionalBookings(params: BookingParams = {}) {
  return useQuery({
    queryKey: BOOKINGS_QUERY_KEYS.professionalBookings(params),
    queryFn: () => bookingsApi.getProfessionalBookings(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAllBookings(params: BookingParams = {}) {
  return useQuery({
    queryKey: [...BOOKINGS_QUERY_KEYS.all, "all", params],
    queryFn: () => bookingsApi.getAllBookings(params),
    staleTime: 30 * 1000,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: BOOKINGS_QUERY_KEYS.detail(id),
    queryFn: () => bookingsApi.getBookingById(id),
    enabled: Boolean(id),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useBookingStats() {
  return useQuery({
    queryKey: BOOKINGS_QUERY_KEYS.stats(),
    queryFn: bookingsApi.getBookingStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCheckAvailability(
  professionalId: string,
  date: string,
  duration: number
) {
  return useQuery({
    queryKey: BOOKINGS_QUERY_KEYS.availability(professionalId, date, duration),
    queryFn: () => bookingsApi.checkAvailability(professionalId, date, duration),
    enabled: Boolean(professionalId && date && duration),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Mutation hooks
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingData) => bookingsApi.createBooking(data),
    onSuccess: () => {
      toast.success('Reserva creada exitosamente');
      
      // Invalidate user bookings
      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.lists() 
      });
        // Invalidate stats
      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.stats() 
      });
      
      // Invalidate availability
      queryClient.invalidateQueries({
        queryKey: [...BOOKINGS_QUERY_KEYS.all, 'availability']
      });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al crear la reserva');
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingData }) => 
      bookingsApi.updateBooking(id, data),
    onSuccess: (updatedBooking) => {
      // Update cache
      queryClient.setQueryData(
        BOOKINGS_QUERY_KEYS.detail(updatedBooking.id),
        updatedBooking
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.lists() 
      });
      
      toast.success('Reserva actualizada exitosamente');
    },    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al actualizar la reserva');
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) => bookingsApi.confirmBooking(id, message),
    onSuccess: (confirmedBooking) => {
      // Update cache
      queryClient.setQueryData(
        BOOKINGS_QUERY_KEYS.detail(confirmedBooking.id),
        confirmedBooking
      );
      
      // Invalidate lists and stats
      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.stats() 
      });
      
      toast.success('Reserva confirmada exitosamente');
    },    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al confirmar la reserva');
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      bookingsApi.cancelBooking(id, reason),
    onSuccess: (cancelledBooking) => {
      // Update cache
      queryClient.setQueryData(
        BOOKINGS_QUERY_KEYS.detail(cancelledBooking.id),
        cancelledBooking
      );
      
      // Invalidate lists and stats
      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.stats() 
      });
      
      // Invalidate availability
      queryClient.invalidateQueries({
        queryKey: [...BOOKINGS_QUERY_KEYS.all, 'availability']
      });
      
      toast.success('Reserva cancelada exitosamente');
    },    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al cancelar la reserva');
    },
  });
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledAt, message }: { id: string; scheduledAt: string; message?: string }) => 
      bookingsApi.rescheduleBooking(id, scheduledAt, message),
    onSuccess: (updatedBooking) => {
      queryClient.setQueryData(
        BOOKINGS_QUERY_KEYS.detail(updatedBooking.id),
        updatedBooking
      );

      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.lists() 
      });

      toast.success('Reserva reagendada exitosamente');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al reagendar la reserva');
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsApi.completeBooking(id),
    onSuccess: (completedBooking) => {
      // Update cache
      queryClient.setQueryData(
        BOOKINGS_QUERY_KEYS.detail(completedBooking.id),
        completedBooking
      );
      
      // Invalidate lists and stats
      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: BOOKINGS_QUERY_KEYS.stats() 
      });
      
      toast.success('Servicio completado exitosamente');
    },    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Error al completar el servicio');
    },
  });
}
