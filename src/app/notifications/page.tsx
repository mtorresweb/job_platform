"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  MessageSquare,
  Calendar,
  Star,
  Clock,
  User,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

import { 
  useNotifications, 
  useMarkAllNotificationsAsRead, 
  Notification
} from "@/shared/hooks/useNotifications";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "MESSAGE_RECEIVED":
      return MessageSquare;
    case "BOOKING_CONFIRMED":    case "BOOKING_CANCELLED":
    case "BOOKING_REMINDER":
      return Calendar;
    case "REVIEW_RECEIVED":
      return Star;
    case "SYSTEM_NOTIFICATION":
      return Bell;
    case "REMINDER":
      return Clock;
    case "PROFILE_VERIFIED":
      return ShieldCheck;
    case "ACCOUNT_UPDATE":
      return User;
    case "ALERT":
      return AlertCircle;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "MESSAGE_RECEIVED":
      return "text-blue-500";
    case "BOOKING_CONFIRMED":
      return "text-green-500";
    case "BOOKING_CANCELLED":
      return "text-red-500";
    case "BOOKING_REMINDER":
      return "text-orange-500";
    case "REVIEW_RECEIVED":
      return "text-yellow-500";    case "SERVICE_COMPLETED":
    case "BOOKING_CONFIRMED":
      return "text-green-500";
    case "SYSTEM_NOTIFICATION":
      return "text-gray-500";
    case "REMINDER":
      return "text-orange-500";
    case "PROFILE_VERIFIED":
      return "text-green-600";
    case "ACCOUNT_UPDATE":
      return "text-blue-600";
    case "ALERT":
      return "text-red-600";
    default:
      return "text-gray-500";
  }
};

const getNotificationCategory = (type: string) => {
  if (type.includes("MESSAGE")) return "messages";
  if (type.includes("BOOKING")) return "bookings";
  if (type.includes("REVIEW")) return "reviews";  if (type.includes("SERVICE")) return "services";
  if (type === "REMINDER") return "reminders";
  if (type.includes("PROFILE") || type.includes("ACCOUNT")) return "accounts";
  return "system";
};

const formatDate = (date: Date | string) => {
  const dateObj = new Date(date);
  const now = new Date();
  
  // If it's today, show relative time (e.g., "2 hours ago")
  if (dateObj.toDateString() === now.toDateString()) {
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
  }
  
  // If it's within the last week, show day and time (e.g., "Monday at 10:30")
  const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays < 7) {
    return format(dateObj, "EEEE 'a las' HH:mm", { locale: es });
  }
  
  // Otherwise, show full date (e.g., "10 May 2023")
  return format(dateObj, "d MMM yyyy", { locale: es });
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");  const [page, setPage] = useState(1);
  const limit = 20;
  
  // Get notifications data
  const { data, isLoading, isFetching } = useNotifications({ 
    page, 
    limit,
    unreadOnly: activeTab === "unread"
  });
    // Mutations
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  
  // Extract notifications from data with proper type assertion
  const notifications = (data as { notifications?: Notification[]; data?: { notifications?: Notification[] } })?.notifications || 
                       (data as { notifications?: Notification[]; data?: { notifications?: Notification[] } })?.data?.notifications || [];
  const unreadCount = (data as { unreadCount?: number; data?: { unreadCount?: number } })?.unreadCount || 
                     (data as { unreadCount?: number; data?: { unreadCount?: number } })?.data?.unreadCount || 0;  const pagination = (data as { pagination?: { hasMore?: boolean }; data?: { pagination?: { hasMore?: boolean } } })?.pagination || 
                    (data as { pagination?: { hasMore?: boolean }; data?: { pagination?: { hasMore?: boolean } } })?.data?.pagination;
  
  // Filter by category
  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (activeTab === "all" || activeTab === "unread") return true;
    return getNotificationCategory(notification.type) === activeTab;
  });
  
  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a: Notification, b: Notification) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "unread") {
      return Number(a.isRead) - Number(b.isRead);
    }
    return 0;
  });

  // Calculate category counts
  const categoryCounts = {
    all: notifications.length,
    unread: notifications.filter((n: Notification) => !n.isRead).length,    messages: notifications.filter((n: Notification) => getNotificationCategory(n.type) === "messages").length,
    bookings: notifications.filter((n: Notification) => getNotificationCategory(n.type) === "bookings").length,
    reviews: notifications.filter((n: Notification) => getNotificationCategory(n.type) === "reviews").length,
    services: notifications.filter((n: Notification) => getNotificationCategory(n.type) === "services").length,
    reminders: notifications.filter((n: Notification) => getNotificationCategory(n.type) === "reminders").length,
    accounts: notifications.filter((n: Notification) => getNotificationCategory(n.type) === "accounts").length,
    system: notifications.filter((n: Notification) => getNotificationCategory(n.type) === "system").length,
  };

  // Handle pagination
  const loadMore = () => {
    if (pagination && pagination.hasMore) {
      setPage(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
            <p className="text-foreground/60">
              Mantente al día con todas tus actividades
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={() => markAllAsRead()}>
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
            
            <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
              {unreadCount} sin leer
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar con filtros */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Ordenar por
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Más recientes</SelectItem>
                      <SelectItem value="oldest">Más antiguas</SelectItem>
                      <SelectItem value="unread">No leídas primero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />                <div>
                  <h4 className="text-sm font-medium mb-3">Categorías</h4>
                  <div className="space-y-2">
                    {[
                      {
                        key: "all",
                        label: "Todas",
                        count: categoryCounts.all
                      },
                      {
                        key: "unread",
                        label: "No leídas",
                        count: categoryCounts.unread
                      },
                      {
                        key: "messages",
                        label: "Mensajes",
                        count: categoryCounts.messages
                      },
                      {
                        key: "bookings",
                        label: "Reservas",
                        count: categoryCounts.bookings
                      },
                      {
                        key: "reviews",
                        label: "Reseñas",
                        count: categoryCounts.reviews
                      },                      {
                        key: "services",
                        label: "Servicios",
                        count: categoryCounts.services
                      },
                      {
                        key: "reminders",
                        label: "Recordatorios",
                        count: categoryCounts.reminders
                      },
                      {
                        key: "accounts",
                        label: "Cuenta",
                        count: categoryCounts.accounts
                      },
                      {
                        key: "system",
                        label: "Sistema",
                        count: categoryCounts.system
                      }
                    ].map((category) => (
                      <button
                        key={category.key}
                        onClick={() => setActiveTab(category.key)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          activeTab === category.key
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="text-sm">{category.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de notificaciones */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {activeTab === "all" && "Todas las notificaciones"}
                    {activeTab === "unread" && "Notificaciones no leídas"}
                    {activeTab === "messages" && "Mensajes"}
                    {activeTab === "bookings" && "Reservas"}
                    {activeTab === "reviews" && "Reseñas"}
                    {activeTab === "services" && "Servicios"}
                    {activeTab === "reminders" && "Recordatorios"}
                    {activeTab === "accounts" && "Cuenta"}
                    {activeTab === "system" && "Sistema"}
                  </CardTitle>
                  <span className="text-sm text-foreground/60">
                    {sortedNotifications.length} notificaciones
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  // Loading state
                  <div className="space-y-4 p-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex justify-between">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sortedNotifications.length > 0 ? (
                  <div className="divide-y">
                    {sortedNotifications.map((notification: Notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      const iconColor = getNotificationColor(notification.type);
                      
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-muted/50 transition-colors ${
                            !notification.isRead ? "bg-primary/5 border-l-4 border-l-primary" : ""
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {notification.user?.image ? (
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={notification.user.image} />
                                  <AvatarFallback>
                                    {notification.user.name
                                      .split(" ")
                                      .slice(0, 2)
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <IconComponent className={`h-5 w-5 ${iconColor}`} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className={`font-medium text-sm ${
                                  !notification.isRead ? "text-foreground" : "text-foreground/80"
                                }`}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-foreground/60 ml-2">
                                  {formatDate(notification.createdAt)}
                                </span>
                              </div>

                              <p className="text-sm text-foreground/70 mb-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.type === "MESSAGE_RECEIVED" && "Mensaje"}
                                  {notification.type === "BOOKING_CONFIRMED" && "Reserva confirmada"}
                                  {notification.type === "BOOKING_CANCELLED" && "Reserva cancelada"}
                                  {notification.type === "BOOKING_REMINDER" && "Recordatorio"}
                                  {notification.type === "REVIEW_RECEIVED" && "Reseña"}
                                  {notification.type === "SERVICE_COMPLETED" && "Servicio completado"}
                                  {notification.type === "SYSTEM_NOTIFICATION" && "Sistema"}
                                  {notification.type === "PROFILE_VERIFIED" && "Verificación"}
                                  {notification.type === "ACCOUNT_UPDATE" && "Cuenta"}
                                  {notification.type === "ALERT" && "Alerta"}
                                </Badge>

                                {(() => {
                                  if (notification.metadata?.rating && typeof notification.metadata.rating === 'number') {
                                    return (
                                      <div className="flex items-center gap-1">
                                        {[...Array(Math.floor(notification.metadata.rating))].map((_, i) => (
                                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        ))}
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                                {(() => {
                                  if (notification.metadata?.amount) {
                                    return (
                                      <Badge variant="secondary" className="text-green-600">
                                        ${typeof notification.metadata.amount === 'number'
                                          ? notification.metadata.amount.toLocaleString()
                                          : String(notification.metadata.amount)}
                                      </Badge>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Pagination button */}
                    {pagination && pagination.hasMore && (
                      <div className="p-4 text-center">
                        <Button 
                          variant="outline" 
                          onClick={loadMore}
                          disabled={isFetching}
                        >
                          {isFetching ? 'Cargando...' : 'Cargar más notificaciones'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No hay notificaciones
                    </h3>
                    <p className="text-foreground/60">
                      No tienes notificaciones en esta categoría
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
