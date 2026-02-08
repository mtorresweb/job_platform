"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  MessageCircle, 
  Calendar, 
  Star, 
  Clock,
  Search,
  Filter,
  ChevronRight,
  Loader2,
  AlertCircle,
  UserPlus
} from "lucide-react";
import { format, subDays, isToday, isYesterday, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Import real API hooks
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useUserBookings, useProfessionalBookings, useAllBookings } from "@/shared/hooks/useBookings";
import { useReviews } from "@/shared/hooks/useReviews";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { apiClient } from "@/shared/utils/api-client";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

// Define activity types for unified display
interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  status: string;
  amount?: number;
  client?: string;
  rating?: number;
  metadata?: Record<string, unknown>;
}

type PlatformUsage = {
  total: number;
  platforms: { platform: string; count: number; percentage: number }[];
};

export default function ActivityPage() {
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [platformUsage, setPlatformUsage] = useState<PlatformUsage>({ total: 0, platforms: [] });
  const [loadingPlatformUsage, setLoadingPlatformUsage] = useState(false);
  const [platformUsageError, setPlatformUsageError] = useState<string | null>(null);
  // Get current user to determine role
  const { isProfessional, isAdmin } = useUserRole();
  const { data: currentUser } = useCurrentUser({ enabled: isProfessional });
  // Fetch data from real APIs
  const { data: notificationsData, isLoading: isLoadingNotifications, error: notificationsError } = useNotifications({
    limit: 50,
    page: 1,
    scope: isAdmin ? "all" : "user",
  });
  
  const { data: userBookingsData, isLoading: isLoadingUserBookings, error: userBookingsError } = useUserBookings({
    limit: 20,
    page: 1,
  });
  
  const { data: professionalBookingsData, isLoading: isLoadingProfessionalBookings, error: professionalBookingsError } = useProfessionalBookings({
    limit: 20,
    page: 1,
  });

  const { data: allBookingsData, isLoading: isLoadingAllBookings, error: allBookingsError } = useAllBookings({
    limit: 50,
    page: 1,
  });

  const { data: reviewsData, isLoading: isLoadingReviews, error: reviewsError } = useReviews({
    limit: 50,
    page: 1,
  });

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingPlatformUsage(true);
    setPlatformUsageError(null);
    apiClient
      .get<PlatformUsage>("/analytics/platform-usage")
      .then((res) => {
        const payload = res?.data || { total: 0, platforms: [] };
        setPlatformUsage(payload);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setPlatformUsageError(message);
        console.error("Error fetching platform usage", err);
      })
      .finally(() => setLoadingPlatformUsage(false));
  }, [isAdmin]);

  const notificationItems = useMemo(() => {
    console.log("[activity] raw notificationsData", notificationsData);
    if (!notificationsData) return [];
    const raw: any = notificationsData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.data?.data)) return raw.data.data;
    if (Array.isArray(raw.data?.notifications)) return raw.data.notifications;
    if (Array.isArray(raw.notifications)) return raw.notifications;
    return [];
  }, [notificationsData]);

  const bookingsList = useMemo(() => {
    console.log("[activity] raw professionalBookingsData", professionalBookingsData);
    console.log("[activity] raw userBookingsData", userBookingsData);
    const unwrap = (raw: any) => {
      if (!raw) return [];
      if (Array.isArray(raw.bookings)) return raw.bookings;
      if (Array.isArray(raw.data?.bookings)) return raw.data.bookings;
      if (Array.isArray(raw.data?.data?.bookings)) return raw.data.data.bookings;
      return [];
    };

    const professionalList = unwrap(professionalBookingsData);
    const userList = unwrap(userBookingsData);
    const allList = unwrap(allBookingsData);

    if (isAdmin) {
      return allList;
    }

    // Merge both perspectives to avoid empty UI when one role has items
    const merged = [...professionalList, ...userList];
    return merged;
  }, [professionalBookingsData, userBookingsData, allBookingsData, isAdmin]);

  const reviewsList = useMemo(() => {
    if (!reviewsData) return [];
    const raw: any = reviewsData as any;
    if (Array.isArray((raw as any).reviews)) return (raw as any).reviews;
    if (Array.isArray(raw.data?.reviews)) return raw.data.reviews;
    if (Array.isArray(raw.data?.data?.reviews)) return raw.data.data.reviews;
    return [];
  }, [reviewsData]);

  // Calculate loading state
  const isLoading = isLoadingNotifications || isLoadingReviews || (isAdmin ? isLoadingAllBookings : (isProfessional ? isLoadingProfessionalBookings : isLoadingUserBookings));

  // Calculate error state
  const error = notificationsError || reviewsError || (isAdmin ? allBookingsError : (isProfessional ? professionalBookingsError : userBookingsError));

  // Transform real data into unified activity items
  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    // Add notifications as activities
    notificationItems.forEach((notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      createdAt: string | Date;
      isRead: boolean;
      metadata?: Record<string, unknown>;
      user?: { name: string };
    }) => {
      const timestamp = typeof notification.createdAt === "string"
        ? parseISO(notification.createdAt)
        : new Date(notification.createdAt);

      const mappedType = getActivityTypeFromNotification(notification.type);
      if (mappedType === "message_received") return; // Exclude new messages from activity feed
      if (notification.type?.toUpperCase?.().includes("MESSAGE")) return; // Exclude any message-related notifications

      items.push({
        id: `notification-${notification.id}`,
        type: mappedType,
        title: notification.title,
        description: notification.message,
        timestamp,
        status: notification.isRead ? "read" : "unread",
        rating: notification.metadata?.rating as number,
        amount: notification.metadata?.amount as number,
        client: notification.user?.name,
        metadata: notification.metadata,
      });
    });

    // Add bookings as activities
    bookingsList.forEach((booking) => {
      const timestamp = typeof booking.createdAt === "string"
        ? parseISO(booking.createdAt)
        : new Date(booking.createdAt);

      items.push({
        id: `booking-${booking.id}`,
        type: getActivityTypeFromBookingStatus(booking.status),
        title: getBookingTitle(booking.status),
        description: `${booking.service?.title || "Servicio"} - ${booking.client?.name || booking.professional?.name || "Cliente"}`,
        timestamp,
        status: booking.status.toLowerCase(),
        client: isProfessional ? booking.client?.name : booking.professional?.name,
        amount: booking.totalPrice,
        metadata: { bookingId: booking.id, serviceTitle: booking.service?.title },
      });
    });

    // Add reviews as activities
    reviewsList.forEach((review) => {
      const timestamp = typeof review.createdAt === "string"
        ? parseISO(review.createdAt)
        : new Date(review.createdAt);

      items.push({
        id: `review-${review.id}`,
        type: "review_received",
        title: "Nueva reseña recibida",
        description: review.comment || "Sin comentario",
        timestamp,
        status: "completed",
        rating: review.rating,
        client: review.client?.name,
        metadata: {
          serviceTitle: review.booking?.service?.title,
          bookingId: review.bookingId,
          comment: review.comment,
        },
      });
    });

    // Sort by timestamp (newest first)
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notificationItems, bookingsList, reviewsList, isProfessional]);

  useEffect(() => {
    console.log("[activity] normalized notificationItems", notificationItems);
    console.log("[activity] normalized bookingsList", bookingsList);
    console.log("[activity] normalized reviewsList", reviewsList);
    console.log("[activity] derived activities", activities);
  }, [notificationItems, bookingsList, reviewsList, activities]);

  const generalStats = useMemo(() => {
    const unread = notificationItems.filter((n) => !n.isRead).length;
    const upcoming = bookingsList.filter((b) => {
      const ts = new Date(b.scheduledAt).getTime();
      const now = Date.now();
      const status = b.status?.toUpperCase?.();
      return ts >= now && status !== "CANCELLED" && status !== "COMPLETED";
    }).length;
    const completed = bookingsList.filter((b) => b.status?.toUpperCase?.() === "COMPLETED").length;
    const cancelled = bookingsList.filter((b) => b.status?.toUpperCase?.() === "CANCELLED").length;
    const rescheduled = bookingsList.filter((b) => {
      const updatedAt = b.updatedAt ? new Date(b.updatedAt) : null;
      const createdAt = b.createdAt ? new Date(b.createdAt) : null;
      const notes = (b.notes || "").toLowerCase();
      const hasClientNote = notes.includes("cliente:");
      const hasRescheduleKeyword = notes.includes("reagend") || notes.includes("reprogram");
      const hasTimestampChange = updatedAt && createdAt && updatedAt.getTime() !== createdAt.getTime();
      return b.status?.toUpperCase?.() !== "CANCELLED" && hasTimestampChange && (hasRescheduleKeyword || hasClientNote);
    }).length;

    return {
      totalActivities: activities.length,
      unreadNotifications: unread,
      upcomingBookings: upcoming,
      completedBookings: completed,
      cancelledOrRescheduled: cancelled + rescheduled,
    };
  }, [notificationItems, bookingsList, activities.length]);

  const professionalStats = useMemo(() => {
    if (!isProfessional) return null;
    const completed = bookingsList.filter((b) => b.status?.toUpperCase?.() === "COMPLETED").length;
    const cancelled = bookingsList.filter((b) => b.status?.toUpperCase?.() === "CANCELLED").length;
    const rescheduled = bookingsList.filter((b) => {
      const updatedAt = b.updatedAt ? new Date(b.updatedAt) : null;
      const createdAt = b.createdAt ? new Date(b.createdAt) : null;
      const notes = (b.notes || "").toLowerCase();
      const hasRescheduleKeyword = notes.includes("reagend") || notes.includes("reprogram");
      const hasTimestampChange = updatedAt && createdAt && updatedAt.getTime() !== createdAt.getTime();
      return hasTimestampChange || hasRescheduleKeyword;
    }).length;
    const profileViews = currentUser?.professional?.profileViewCount ?? 0;
    return { completed, cancelled, rescheduled, profileViews };
  }, [isProfessional, bookingsList, currentUser?.professional?.profileViewCount]);

  // Calculate stats from real data
    // Removed analytics weekly stats for simplified UI

  // Helper functions
  function getActivityTypeFromNotification(notificationType: string): string {
    switch (notificationType) {
      case 'BOOKING_REQUEST':
        return 'booking_pending';
      case 'MESSAGE_RECEIVED':
        return 'message_received';
      case 'BOOKING_CONFIRMED':
        return 'booking_confirmed';
      case 'BOOKING_CANCELLED':
        return 'booking_cancelled';
      case 'REVIEW_RECEIVED':
        return 'review_received';      case 'SERVICE_COMPLETED':
        return 'service_completed';
      case 'BOOKING_CONFIRMED':
        return 'booking_confirmed';
      case 'PROFILE_VERIFIED':
        return 'profile_updated';
      case 'ACCOUNT_UPDATE':
        return 'profile_updated';
      default:
        return 'system_notification';
    }
  }

  function getActivityTypeFromBookingStatus(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'booking_completed';
      case 'CONFIRMED':
        return 'booking_confirmed';
      case 'CANCELLED':
        return 'booking_cancelled';
      case 'PENDING':
        return 'booking_pending';
      default:
        return 'booking_updated';
    }
  }

  function getBookingTitle(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Trabajo completado';
      case 'CONFIRMED':
        return 'Reserva confirmada';
      case 'CANCELLED':
        return 'Reserva cancelada';
      case 'PENDING':
        return 'Reserva pendiente';
      default:
        return 'Reserva actualizada';
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking_completed":
      case "booking_confirmed":
        return <Calendar className="h-4 w-4" />;
      case "review_received":
        return <Star className="h-4 w-4" />;
      case "message_received":
        return <MessageCircle className="h-4 w-4" />;      case "service_completed":
        return <Calendar className="h-4 w-4" />;
      case "new_follower":
        return <UserPlus className="h-4 w-4" />;
      case "booking_cancelled":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      booking_completed: "Reserva completada",
      booking_confirmed: "Reserva confirmada",
      booking_cancelled: "Reserva cancelada",
      booking_pending: "Reserva pendiente",
      booking_updated: "Reserva actualizada",
      service_completed: "Servicio completado",
      message_received: "Mensaje recibido",
      review_received: "Reseña recibida",
      profile_updated: "Perfil actualizado",
      system_notification: "Notificación del sistema",
    };
    return map[type] || "Actividad";
  };

  const formatStatusLabel = (status: string) => {
    if (!status) return "";
    return status.replace(/_/g, " ").toLowerCase();
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "positive":
        return "text-blue-600 bg-blue-100";
      case "unread":
        return "text-orange-600 bg-orange-100";
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "info":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return `Hoy, ${format(timestamp, "HH:mm", { locale: es })}`;
    } else if (isYesterday(timestamp)) {
      return `Ayer, ${format(timestamp, "HH:mm", { locale: es })}`;
    } else {
      return format(timestamp, "dd MMM, HH:mm", { locale: es });
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === "all" || activity.type.includes(filter);
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (activity.client && activity.client.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesTime = true;
    if (timeFilter === "today") {
      matchesTime = isToday(activity.timestamp);
    } else if (timeFilter === "week") {
      matchesTime = activity.timestamp >= subDays(new Date(), 7);
    } else if (timeFilter === "month") {
      matchesTime = activity.timestamp >= subDays(new Date(), 30);
    }

    return matchesFilter && matchesSearch && matchesTime;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Actividad</h1>
        <p className="text-muted-foreground">
          Revisa tu historial de actividades, filtros y estadísticas en un solo lugar
        </p>
      </div>

      {isProfessional && professionalStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Servicios completados</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{professionalStats.completed}</div>
              <Badge variant="secondary" className="text-green-700 bg-green-100">OK</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Cancelados</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{professionalStats.cancelled}</div>
              <Badge variant="secondary" className="text-red-700 bg-red-100">Baja</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Reprogramados</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{professionalStats.rescheduled}</div>
              <Badge variant="secondary" className="text-amber-700 bg-amber-100">Cambio</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Vistas de perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{professionalStats.profileViews}</div>
              <Badge variant="secondary" className="text-blue-700 bg-blue-100">Visitas</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {isAdmin && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Plataformas más usadas</CardTitle>
              <Badge variant="outline">Inicios de sesión</Badge>
            </div>
            <CardDescription>Distribución por plataforma (últimos registros)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingPlatformUsage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando...</span>
              </div>
            )}

            {platformUsageError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{platformUsageError}</span>
              </div>
            )}

            {!loadingPlatformUsage && !platformUsageError && platformUsage.platforms.length === 0 && (
              <p className="text-sm text-muted-foreground">Aún no hay datos de plataformas.</p>
            )}

            {!loadingPlatformUsage && !platformUsageError && platformUsage.platforms.length > 0 && (
              <div className="space-y-2">
                {platformUsage.platforms.map((item) => (
                  <div key={item.platform} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{item.platform}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{item.count}</span>
                      <span className="text-xs">{Number(item.percentage).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

        {/* Debug panel toggle */}
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowDebug((v) => !v)}>
            {showDebug ? "Ocultar depuración" : "Ver depuración"}
          </Button>
        </div>

        {showDebug && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Depuración (solo visible para ti)</CardTitle>
              <CardDescription>Datos crudos y normalizados de la página</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap break-words max-h-96 overflow-auto border p-2 rounded">
                {JSON.stringify({ notificationsData, notificationItems, professionalBookingsData, userBookingsData, bookingsList, reviewsData, reviewsList, activities }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

      {/* General Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Actividades totales</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{generalStats.totalActivities}</div>
            <Activity className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Notificaciones sin leer</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{generalStats.unreadNotifications}</div>
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Próximas reservas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{generalStats.upcomingBookings}</div>
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Reservas completadas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{generalStats.completedBookings}</div>
            <Badge variant="secondary" className="text-green-700 bg-green-100">OK</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Canceladas o reprogramadas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{generalStats.cancelledOrRescheduled}</div>
            <Badge variant="secondary" className="text-amber-700 bg-amber-100">Atención</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error al cargar los datos: {(error as Error)?.message || 'Error desconocido'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando actividades...</span>
            </div>
          </CardContent>
        </Card>
      )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar actividades..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo de actividad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las actividades</SelectItem>
                  <SelectItem value="booking">Reservas</SelectItem>
                  <SelectItem value="review">Reseñas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline de Actividades</CardTitle>
            <CardDescription>
              {filteredActivities.length} actividades encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => setExpandedId((prev) => (prev === activity.id ? null : activity.id))}
                    className="w-full text-left flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    aria-expanded={expandedId === activity.id}
                  >
                    <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatTimestamp(activity.timestamp)}</span>
                            {activity.client && (
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-xs">
                                    {activity.client.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{activity.client}</span>
                              </div>
                            )}
                            {activity.amount && (
                              <Badge variant="secondary">
                                €{activity.amount}
                              </Badge>
                            )}
                            {activity.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span>{activity.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <ChevronRight
                          className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === activity.id ? "rotate-90" : ""}`}
                        />
                      </div>

                      {expandedId === activity.id && (
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">Tipo: {formatTypeLabel(activity.type)}</Badge>
                            <Badge variant="outline">Estado: {formatStatusLabel(activity.status)}</Badge>
                            <Badge variant="outline">Fecha: {formatTimestamp(activity.timestamp)}</Badge>
                            {activity.amount !== undefined && <Badge variant="outline">Monto: €{activity.amount}</Badge>}
                            {activity.client && <Badge variant="outline">Usuario: {activity.client}</Badge>}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activity.metadata?.serviceTitle && (
                              <div className="rounded-md border bg-muted/40 p-3">
                                <div className="font-medium text-foreground">Servicio</div>
                                <p className="text-sm text-muted-foreground">{activity.metadata.serviceTitle as string}</p>
                              </div>
                            )}
                            {activity.metadata?.bookingId && (
                              <div className="rounded-md border bg-muted/40 p-3">
                                <div className="font-medium text-foreground">Reserva</div>
                                <p className="text-sm text-muted-foreground">{String(activity.metadata.bookingId)}</p>
                              </div>
                            )}
                            {activity.rating && (
                              <div className="rounded-md border bg-muted/40 p-3">
                                <div className="font-medium text-foreground">Calificación</div>
                                <p className="text-sm text-muted-foreground">{activity.rating} estrellas</p>
                              </div>
                            )}
                            {activity.metadata?.comment && (
                              <div className="rounded-md border bg-muted/40 p-3">
                                <div className="font-medium text-foreground">Comentario</div>
                                <p className="text-sm text-muted-foreground">{activity.metadata.comment as string}</p>
                              </div>
                            )}
                            {!activity.metadata?.serviceTitle && !activity.metadata?.bookingId && !activity.rating && !activity.metadata?.comment && (
                              <div className="rounded-md border bg-muted/40 p-3">
                                <div className="font-medium text-foreground">Sin detalles adicionales</div>
                                <p className="text-sm text-muted-foreground">Esta actividad no tiene más información.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
              ))}
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No se encontraron actividades</h3>
                  <p className="text-sm text-muted-foreground">
                    Intenta ajustar los filtros para ver más resultados
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
