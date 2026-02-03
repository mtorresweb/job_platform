"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  Notification
} from "@/shared/hooks/useNotifications";

// Helper function to get notification icon
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "MESSAGE_RECEIVED":
      return <MessageSquare className="h-4 w-4" />;    case "BOOKING_CONFIRMED":
    case "BOOKING_CANCELLED":
    case "BOOKING_REMINDER":
      return <Calendar className="h-4 w-4" />;
    case "REVIEW_RECEIVED":
      return <Star className="h-4 w-4" />;
    case "SYSTEM_NOTIFICATION":
      return <Bell className="h-4 w-4" />;
    case "REMINDER":
      return <Clock className="h-4 w-4" />;
    case "PROFILE_VERIFIED":
      return <ShieldCheck className="h-4 w-4" />;
    case "ACCOUNT_UPDATE":
      return <User className="h-4 w-4" />;
    case "ALERT":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

// Helper function to format date relative to now
const formatDate = (date: Date | string) => {
  const dateObj = new Date(date);
  return format(dateObj, "d MMM, HH:mm", { locale: es });
};

export function NotificationsDropdown() {
  // Fetch recent notifications (limit to 5)
  const { data, isLoading } = useNotifications({ limit: 5 });
    // Safe access to data with proper fallbacks
  const notifications = (data as { notifications?: Notification[]; data?: { notifications?: Notification[] } })?.notifications || 
                       (data as { notifications?: Notification[]; data?: { notifications?: Notification[] } })?.data?.notifications || [];
  const unreadCount = (data as { unreadCount?: number; data?: { unreadCount?: number } })?.unreadCount || 
                     (data as { unreadCount?: number; data?: { unreadCount?: number } })?.data?.unreadCount || 0;

  return (
    <div className="w-[380px] max-w-[calc(100vw-2rem)]">
      <div className="flex items-center justify-between p-4">
        <h4 className="text-sm font-medium">Notificaciones</h4>
      </div>
      <Separator />

      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map((notification: Notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-muted transition-colors ${
                  !notification.isRead ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className={`h-9 w-9 rounded-full bg-muted flex items-center justify-center ${
                    !notification.isRead ? "bg-primary/10 text-primary" : ""
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm ${
                      !notification.isRead ? "font-medium" : ""
                    }`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No tienes notificaciones aún
            </p>
          </div>
        )}
      </ScrollArea>

      <Separator />
      <div className="p-2">
        <Link href="/notifications">
          <Button variant="outline" className="w-full text-sm h-9">
            Ver todas las notificaciones
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} sin leer
              </Badge>
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}
