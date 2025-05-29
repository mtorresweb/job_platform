"use client";

import { useState } from "react";
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
  Minus
} from "lucide-react";
import { format, subDays, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

// Mock activity data
const activities = [
  {
    id: 1,
    type: "booking_completed",
    title: "Trabajo completado",
    description: "Diseño de logo para TechStart",
    amount: 150,
    client: "Carlos Méndez",
    timestamp: new Date(),
    status: "completed"
  },
  {
    id: 2,
    type: "review_received",
    title: "Nueva reseña recibida",
    description: "Calificación de 5 estrellas de Ana López",
    rating: 5,
    client: "Ana López",
    timestamp: subDays(new Date(), 1),
    status: "positive"
  },
  {
    id: 3,
    type: "message_received",
    title: "Nuevo mensaje",
    description: "Consulta sobre servicios de branding",
    client: "María González",
    timestamp: subDays(new Date(), 2),
    status: "unread"
  },
  {
    id: 4,
    type: "booking_confirmed",
    title: "Reserva confirmada",
    description: "Sesión de diseño web - 15 Jun 2025",
    client: "Pedro Ruiz",
    timestamp: subDays(new Date(), 3),
    status: "confirmed"
  },
  {
    id: 5,
    type: "payment_received",
    title: "Pago recibido",
    description: "Factura #1234 - Proyecto finalizado",
    amount: 300,
    client: "Innovate Corp",
    timestamp: subDays(new Date(), 5),
    status: "completed"
  },
  {
    id: 6,
    type: "profile_updated",
    title: "Perfil actualizado",
    description: "Información profesional modificada",
    timestamp: subDays(new Date(), 7),
    status: "info"
  },
  {
    id: 7,
    type: "new_follower",
    title: "Nuevo seguidor",
    description: "Laura Sánchez comenzó a seguirte",
    client: "Laura Sánchez",
    timestamp: subDays(new Date(), 10),
    status: "positive"
  },
  {
    id: 8,
    type: "booking_cancelled",
    title: "Reserva cancelada",
    description: "Sesión de consultoría - Cliente canceló",
    client: "Miguel Torres",
    timestamp: subDays(new Date(), 12),
    status: "cancelled"
  }
];

// Statistics data
const stats = {
  thisWeek: {
    bookings: 5,
    earnings: 750,
    messages: 12,
    reviews: 3,
    avgRating: 4.8
  },
  lastWeek: {
    bookings: 3,
    earnings: 450,
    messages: 8,
    reviews: 2,
    avgRating: 4.7
  }
};

export default function ActivityPage() {
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking_completed":
      case "booking_confirmed":
        return <Calendar className="h-4 w-4" />;
      case "review_received":
        return <Star className="h-4 w-4" />;
      case "message_received":
        return <MessageCircle className="h-4 w-4" />;
      case "payment_received":
        return <CreditCard className="h-4 w-4" />;
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
                    <SelectItem value="all">Todas las actividades</SelectItem>
                    <SelectItem value="booking">Reservas</SelectItem>
                    <SelectItem value="review">Reseñas</SelectItem>
                    <SelectItem value="message">Mensajes</SelectItem>
                    <SelectItem value="payment">Pagos</SelectItem>
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
