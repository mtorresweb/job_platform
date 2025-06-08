"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  MessageCircle, 
  Calendar, 
  Star, 
  CreditCard, 
  UserPlus, 
  Clock,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle
} from "lucide-react";
import { format, subDays, isToday, isYesterday, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Import real API hooks
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useUserBookings, useProfessionalBookings } from "@/shared/hooks/useBookings";
import { useUserRole } from "@/infrastructure/auth/auth-client";

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
}export default function ActivityPage() {
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Get current user to determine role
  const { isProfessional } = useUserRole();
  // Fetch data from real APIs
  const { data: notificationsData, isLoading: isLoadingNotifications, error: notificationsError } = useNotifications({ 
    limit: 50, 
    page: 1 
  });
  
  const { data: userBookingsData, isLoading: isLoadingUserBookings, error: userBookingsError } = useUserBookings({ 
    limit: 20, 
    page: 1 
  });
  
  const { data: professionalBookingsData, isLoading: isLoadingProfessionalBookings, error: professionalBookingsError } = useProfessionalBookings({ 
    limit: 20, 
    page: 1 
  });

  // Calculate loading state
  const isLoading = isLoadingNotifications || 
    (isProfessional ? isLoadingProfessionalBookings : isLoadingUserBookings);

  // Calculate error state
  const error = notificationsError || 
    (isProfessional ? professionalBookingsError : userBookingsError);

  // Transform real data into unified activity items
  const activities = useMemo(() => {
    const items: ActivityItem[] = [];    // Add notifications as activities
    const notifications = Array.isArray(notificationsData) ? notificationsData : [];
    notifications.forEach((notification: { 
      id: string; 
      type: string; 
      title: string; 
      message: string; 
      createdAt: string | Date; 
      isRead: boolean; 
      metadata?: Record<string, unknown>; 
      user?: { name: string }; 
    }) => {
      const timestamp = typeof notification.createdAt === 'string' 
        ? parseISO(notification.createdAt) 
        : new Date(notification.createdAt);

      items.push({
        id: `notification-${notification.id}`,
        type: getActivityTypeFromNotification(notification.type),
        title: notification.title,
        description: notification.message,
        timestamp,
        status: notification.isRead ? "read" : "unread",
        rating: notification.metadata?.rating as number,
        amount: notification.metadata?.amount as number,
        client: notification.user?.name,
        metadata: notification.metadata
      });
    });    // Add bookings as activities
    const bookings = isProfessional 
      ? (professionalBookingsData?.bookings || [])
      : (userBookingsData?.bookings || []);

    bookings.forEach((booking) => {
      const timestamp = typeof booking.createdAt === 'string' 
        ? parseISO(booking.createdAt) 
        : new Date(booking.createdAt);

      items.push({
        id: `booking-${booking.id}`,
        type: getActivityTypeFromBookingStatus(booking.status),
        title: getBookingTitle(booking.status),        description: `${booking.service?.title || 'Servicio'} - ${booking.client?.name || booking.professional?.name || 'Cliente'}`,
        timestamp,
        status: booking.status.toLowerCase(),
        client: isProfessional ? booking.client?.name : booking.professional?.name,
        metadata: { bookingId: booking.id, serviceTitle: booking.service?.title }
      });
    });

    // Sort by timestamp (newest first)
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notificationsData, userBookingsData, professionalBookingsData, isProfessional]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const thisWeekStart = subDays(new Date(), 7);
    const lastWeekStart = subDays(new Date(), 14);
    
    const thisWeekActivities = activities.filter(a => a.timestamp >= thisWeekStart);
    const lastWeekActivities = activities.filter(a => 
      a.timestamp >= lastWeekStart && a.timestamp < thisWeekStart
    );

    const thisWeekBookings = thisWeekActivities.filter(a => a.type.includes('booking')).length;
    const lastWeekBookings = lastWeekActivities.filter(a => a.type.includes('booking')).length;

    const thisWeekEarnings = thisWeekActivities
      .filter(a => a.amount && a.status === 'completed')
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    
    const lastWeekEarnings = lastWeekActivities
      .filter(a => a.amount && a.status === 'completed')
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    const thisWeekMessages = thisWeekActivities.filter(a => a.type === 'message_received').length;
    const lastWeekMessages = lastWeekActivities.filter(a => a.type === 'message_received').length;

    const thisWeekReviews = thisWeekActivities.filter(a => a.type === 'review_received').length;
    const lastWeekReviews = lastWeekActivities.filter(a => a.type === 'review_received').length;

    const thisWeekRatings = thisWeekActivities
      .filter(a => a.rating)
      .map(a => a.rating!)
      .filter(r => r > 0);
    const avgRating = thisWeekRatings.length > 0 
      ? thisWeekRatings.reduce((sum, r) => sum + r, 0) / thisWeekRatings.length 
      : 0;

    const lastWeekRatings = lastWeekActivities
      .filter(a => a.rating)
      .map(a => a.rating!)
      .filter(r => r > 0);
    const lastWeekAvgRating = lastWeekRatings.length > 0 
      ? lastWeekRatings.reduce((sum, r) => sum + r, 0) / lastWeekRatings.length 
      : 0;

    return {
      thisWeek: {
        bookings: thisWeekBookings,
        earnings: thisWeekEarnings,
        messages: thisWeekMessages,
        reviews: thisWeekReviews,
        avgRating: Number(avgRating.toFixed(1))
      },
      lastWeek: {
        bookings: lastWeekBookings,
        earnings: lastWeekEarnings,
        messages: lastWeekMessages,
        reviews: lastWeekReviews,
        avgRating: Number(lastWeekAvgRating.toFixed(1))
      }
    };
  }, [activities]);

  // Helper functions
  function getActivityTypeFromNotification(notificationType: string): string {
    switch (notificationType) {
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

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, direction: "neutral" };
    const percentage = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(percentage),
      direction: percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral"
    };
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Actividad</h1>
        <p className="text-muted-foreground">
          Revisa tu historial de actividades y estadísticas de rendimiento
        </p>
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

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad Reciente
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
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
                    <SelectItem value="all">Todas las actividades</SelectItem>                    <SelectItem value="booking">Reservas</SelectItem>
                    <SelectItem value="review">Reseñas</SelectItem>
                    <SelectItem value="message">Mensajes</SelectItem>
                    <SelectItem value="service">Servicios</SelectItem>
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
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                        
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
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
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Weekly Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Bookings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reservas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.thisWeek.bookings}</div>
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(calculateTrend(stats.thisWeek.bookings, stats.lastWeek.bookings).direction)}
                      <span className={
                        calculateTrend(stats.thisWeek.bookings, stats.lastWeek.bookings).direction === "up" 
                          ? "text-green-600" 
                          : calculateTrend(stats.thisWeek.bookings, stats.lastWeek.bookings).direction === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }>
                        {calculateTrend(stats.thisWeek.bookings, stats.lastWeek.bookings).value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Earnings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">€{stats.thisWeek.earnings}</div>
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(calculateTrend(stats.thisWeek.earnings, stats.lastWeek.earnings).direction)}
                      <span className={
                        calculateTrend(stats.thisWeek.earnings, stats.lastWeek.earnings).direction === "up" 
                          ? "text-green-600" 
                          : calculateTrend(stats.thisWeek.earnings, stats.lastWeek.earnings).direction === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }>
                        {calculateTrend(stats.thisWeek.earnings, stats.lastWeek.earnings).value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mensajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.thisWeek.messages}</div>
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(calculateTrend(stats.thisWeek.messages, stats.lastWeek.messages).direction)}
                      <span className={
                        calculateTrend(stats.thisWeek.messages, stats.lastWeek.messages).direction === "up" 
                          ? "text-green-600" 
                          : calculateTrend(stats.thisWeek.messages, stats.lastWeek.messages).direction === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }>
                        {calculateTrend(stats.thisWeek.messages, stats.lastWeek.messages).value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reseñas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.thisWeek.reviews}</div>
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(calculateTrend(stats.thisWeek.reviews, stats.lastWeek.reviews).direction)}
                      <span className={
                        calculateTrend(stats.thisWeek.reviews, stats.lastWeek.reviews).direction === "up" 
                          ? "text-green-600" 
                          : calculateTrend(stats.thisWeek.reviews, stats.lastWeek.reviews).direction === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }>
                        {calculateTrend(stats.thisWeek.reviews, stats.lastWeek.reviews).value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Average Rating */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Calificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.thisWeek.avgRating}</div>
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(calculateTrend(stats.thisWeek.avgRating, stats.lastWeek.avgRating).direction)}
                      <span className={
                        calculateTrend(stats.thisWeek.avgRating, stats.lastWeek.avgRating).direction === "up" 
                          ? "text-green-600" 
                          : calculateTrend(stats.thisWeek.avgRating, stats.lastWeek.avgRating).direction === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }>
                        {calculateTrend(stats.thisWeek.avgRating, stats.lastWeek.avgRating).value.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(stats.thisWeek.avgRating) 
                            ? "text-yellow-400 fill-current" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights de Rendimiento</CardTitle>
              <CardDescription>
                Análisis de tu actividad semanal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Excelente rendimiento</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Tus ingresos han aumentado un {calculateTrend(stats.thisWeek.earnings, stats.lastWeek.earnings).value.toFixed(1)}% 
                    esta semana comparado con la anterior. ¡Sigue así!
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Mayor actividad en mensajes</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Has recibido {stats.thisWeek.messages} mensajes esta semana. 
                    Responder rápidamente mejora tu calificación.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium text-orange-800">Calificación estable</h4>
                  </div>
                  <p className="text-sm text-orange-700">
                    Mantienes una excelente calificación de {stats.thisWeek.avgRating} estrellas. 
                    Continúa brindando servicios de calidad.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
