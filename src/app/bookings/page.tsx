"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  MessageSquare,
  User,
  Edit,
  AlertCircle,
  Star,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { toast } from "sonner";
import { 
  useUserBookings, 
  useProfessionalBookings, 
  useConfirmBooking, 
  useCancelBooking,
  useRescheduleBooking,
  useCompleteBooking,
} from "@/shared/hooks/useBookings";
import { useCreateReview } from "@/shared/hooks/useReviews";
import { Booking, BookingStatus } from "@/shared/utils/bookings-api";

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return "bg-green-100 text-green-700";
    case BookingStatus.PENDING:
      return "bg-yellow-100 text-yellow-700";
    case BookingStatus.COMPLETED:
      return "bg-blue-100 text-blue-700";
    case BookingStatus.CANCELLED:
      return "bg-red-100 text-red-700";
    case BookingStatus.IN_PROGRESS:
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusLabel = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return "Confirmada";
    case BookingStatus.PENDING:
      return "Pendiente";
    case BookingStatus.COMPLETED:
      return "Completada";
    case BookingStatus.CANCELLED:
      return "Cancelada";
    case BookingStatus.IN_PROGRESS:
      return "En Progreso";
    default:
      return "Desconocido";
  }
};

export default function BookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"confirm" | "cancel" | "reschedule" | null>(null);
  const [actionBooking, setActionBooking] = useState<Booking | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionDate, setActionDate] = useState<string>("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  // Get user role to determine which bookings to show
  const { isProfessional, user } = useUserRole();

  // Fetch bookings based on user role
  const { 
    data: clientBookingsData, 
    isLoading: isLoadingClient, 
    isFetching: isFetchingClient,
    error: clientError 
  } = useUserBookings({
    filters: filterStatus !== "all" ? { status: [filterStatus as BookingStatus] } : undefined
  });

  const { 
    data: professionalBookingsData, 
    isLoading: isLoadingProfessional, 
    isFetching: isFetchingProfessional,
    error: professionalError 
  } = useProfessionalBookings({
    filters: filterStatus !== "all" ? { status: [filterStatus as BookingStatus] } : undefined
  });

  const confirmBookingMutation = useConfirmBooking();
  const cancelBookingMutation = useCancelBooking();
  const rescheduleBookingMutation = useRescheduleBooking();
  const completeBookingMutation = useCompleteBooking();
  const createReviewMutation = useCreateReview();

  // Determine which data to use
  const bookingsData = isProfessional ? professionalBookingsData : clientBookingsData;
  const isLoading = isProfessional ? isLoadingProfessional : isLoadingClient;
  const isFetching = isProfessional ? isFetchingProfessional : isFetchingClient;
  const error = isProfessional ? professionalError : clientError;
  const bookings = bookingsData?.bookings || [];

  // Treat subsequent fetches as background to avoid a full-page flash when applying the first filter
  const isInitialLoading = isLoading && !bookingsData;

  // Filter bookings based on active tab and search
  const getFilteredBookings = () => {
    if (!bookings) return [];
    
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.scheduledAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const matchesStatus =
        filterStatus === "all" || booking.status === (filterStatus as BookingStatus);

      const matchesTab = 
        activeTab === "all" ||
        (activeTab === "upcoming" && [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(booking.status) && bookingDate > new Date()) ||
        (activeTab === "today" && format(bookingDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) ||
        (activeTab === "completed" && booking.status === BookingStatus.COMPLETED);

      const matchesSearch = 
        (isProfessional ? booking.client.name : booking.professional.name)
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase()) ||
        booking.service.title
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());

      return matchesTab && matchesStatus && matchesSearch;
    });
  };

  const filteredBookings = getFilteredBookings();
  // Calculate stats
  const upcomingBookings = bookings.filter(b => 
    [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(b.status) && new Date(b.scheduledAt) > new Date()
  );

  const todayBookings = bookings.filter(b => 
    format(new Date(b.scheduledAt), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );

  const openActionDialog = (type: "confirm" | "cancel" | "reschedule", booking: Booking) => {
    setActionType(type);
    setActionBooking(booking);
    setActionDialogOpen(true);
    setActionMessage("");
    setActionDate(
      type === "reschedule"
        ? format(new Date(booking.scheduledAt), "yyyy-MM-dd'T'HH:mm")
        : ""
    );
  };

  const closeActionDialog = () => {
    setActionDialogOpen(false);
    setActionType(null);
    setActionBooking(null);
    setActionMessage("");
    setActionDate("");
  };

  const openReviewDialog = (booking: Booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment("");
    setReviewDialogOpen(true);
  };

  const closeReviewDialog = () => {
    setReviewDialogOpen(false);
    setReviewBooking(null);
    setReviewRating(5);
    setReviewComment("");
  };

  const handleContact = (userId: string) => {
    const search = userId ? `?conversationWith=${userId}` : "";
    router.push(`/messages${search}`);
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking) return;

    if (reviewComment.trim() && reviewComment.trim().length < 10) {
      toast.error("El comentario debe tener al menos 10 caracteres");
      return;
    }

    try {
      console.log('[handleSubmitReview] submit', {
        bookingId: reviewBooking.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      await createReviewMutation.mutateAsync({
        bookingId: reviewBooking.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      console.log('[handleSubmitReview] success');
      closeReviewDialog();
    } catch (error) {
      console.error('[handleSubmitReview] error', error);
      toast.error("No se pudo crear la reseña");
    }
  };

  const handleActionSubmit = async () => {
    if (!actionBooking || !actionType) return;

    try {
      if (actionType === "confirm") {
        await confirmBookingMutation.mutateAsync({ id: actionBooking.id, message: actionMessage || undefined });
      } else if (actionType === "cancel") {
        await cancelBookingMutation.mutateAsync({ id: actionBooking.id, reason: actionMessage || undefined });
      } else if (actionType === "reschedule") {
        if (!actionDate) {
          toast.error("Selecciona una nueva fecha y hora");
          return;
        }
        await rescheduleBookingMutation.mutateAsync({
          id: actionBooking.id,
          scheduledAt: new Date(actionDate).toISOString(),
          message: actionMessage || undefined,
        });
      }
      closeActionDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleComplete = async (booking: Booking) => {
    try {
      await completeBookingMutation.mutateAsync(booking.id);
    } catch (error) {
      console.error(error);
    }
  };

  const isActionLoading =
    confirmBookingMutation.isPending ||
    cancelBookingMutation.isPending ||
    rescheduleBookingMutation.isPending;

  const isCompleting = completeBookingMutation.isPending;

  // Loading state (only for the first load)
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar las reservas: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">
                Acceso requerido
              </h3>
              <p className="text-foreground/60 mb-4">
                Debes iniciar sesión para ver tus reservas
              </p>
              <Button asChild>
                <a href="/auth/login">Iniciar Sesión</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reservas</h1>
            <p className="text-foreground/60">
              Gestiona todas tus citas y servicios programados
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Hoy</p>
                  <p className="text-2xl font-bold">{todayBookings.length}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Próximas</p>
                  <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Completadas</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(b => b.status === BookingStatus.COMPLETED).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Total</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros y busqueda */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Buscar</label>
                  <Input
                    placeholder="Cliente o servicio ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="PENDING">Pendientes</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmadas</SelectItem>
                      <SelectItem value="COMPLETED">Completadas</SelectItem>
                      <SelectItem value="CANCELLED">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                  {isFetching && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-foreground/60">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Actualizando reservas…</span>
                    </div>
                  )}
                </div>

                <Separator />                <div>
                  <h4 className="text-sm font-medium mb-3">Estadísticas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total reservas:</span>
                      <Badge variant="secondary">{bookings.length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pendientes:</span>
                      <Badge variant="outline">
                        {bookings.filter(b => b.status === BookingStatus.PENDING).length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de reservas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="today">Hoy</TabsTrigger>
                    <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                    <TabsTrigger value="completed">Completadas</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {filteredBookings.length > 0 ? (                  <div className="space-y-4">                    {filteredBookings.map((booking) => {
                      // Determine which person to display based on user role
                      const otherPerson = isProfessional ? booking.client : booking.professional;
                      const bookingDate = new Date(booking.scheduledAt);
                      
                      return (
                        <Card key={booking.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={otherPerson.avatar} />
                                  <AvatarFallback>
                                    {otherPerson.name.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{otherPerson.name}</h3>
                                    <Badge className={getStatusColor(booking.status)}>
                                      {getStatusLabel(booking.status)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-foreground/70 mb-1">
                                    {booking.service.title}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-foreground/60">
                                    <div className="flex items-center gap-1">
                                      <CalendarIcon className="h-3 w-3" />
                                      <span>{format(bookingDate, "PPP", { locale: es })}</span>
                                    </div>                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{format(bookingDate, "p", { locale: es })}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{booking.duration} min</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContact(otherPerson.id)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex items-start gap-2 mb-2">
                                  <CalendarIcon className="h-4 w-4 text-foreground/60 mt-0.5" />
                                  <span className="text-foreground/70">
                                    Duración: {booking.duration} minutos
                                  </span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <User className="h-4 w-4 text-foreground/60 mt-0.5" />
                                  <span className="text-foreground/70">
                                    Categoría: {booking.service.category.name}
                                  </span>
                                </div>
                              </div>
                              
                              {booking.notes && (
                                <div>
                                  <p className="text-xs text-foreground/60 mb-1">Notas:</p>
                                  <p className="text-foreground/70">{booking.notes}</p>
                                </div>
                              )}
                            </div>

                            {booking.status === BookingStatus.CANCELLED && booking.cancellationReason && (
                              <div className="mt-3 text-sm text-destructive">
                                Motivo de cancelación: {booking.cancellationReason}
                              </div>
                            )}

                            {([BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)) && (
                              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                                {booking.status === BookingStatus.PENDING && (
                                  <Button
                                    size="sm"
                                    className="flex-1 min-w-[140px]"
                                    disabled={isActionLoading}
                                    onClick={() => openActionDialog("confirm", booking)}
                                  >
                                    Confirmar
                                  </Button>
                                )}
                                {!isProfessional && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 min-w-[140px]"
                                    disabled={isActionLoading}
                                    onClick={() => openActionDialog("reschedule", booking)}
                                  >
                                    Reagendar
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 min-w-[140px]"
                                  disabled={isActionLoading}
                                  onClick={() => openActionDialog("cancel", booking)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            )}

                            {isProfessional && [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS].includes(booking.status) && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Button
                                  size="sm"
                                  className="min-w-[160px]"
                                  disabled={isCompleting}
                                  onClick={() => handleComplete(booking)}
                                >
                                  Marcar como completada
                                </Button>
                              </div>
                            )}

                            {booking.status === BookingStatus.COMPLETED && (
                              <div className="mt-4 pt-4 border-t space-y-3">
                                {booking.review ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < booking.review!.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-foreground/70">{booking.review.rating}/5</span>
                                    </div>

                                    {booking.review.comment && (
                                      <p className="text-sm text-foreground/80">{booking.review.comment}</p>
                                    )}

                                    {booking.review.response && (
                                      <div className="rounded-md bg-muted p-3 text-sm text-foreground/80">
                                        <span className="font-medium">Respuesta del profesional</span>
                                        <p className="mt-1">{booking.review.response}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : !isProfessional ? (
                                  <Button
                                    size="sm"
                                    className="min-w-[160px]"
                                    onClick={() => openReviewDialog(booking)}
                                    disabled={createReviewMutation.isPending}
                                  >
                                    Dejar reseña
                                  </Button>
                                ) : (
                                  <p className="text-sm text-foreground/60">Pendiente reseña del cliente.</p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No hay reservas
                    </h3>
                    <p className="text-foreground/60 mb-4">
                      No se encontraron reservas que coincidan con los filtros seleccionados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={actionDialogOpen} onOpenChange={(open) => open ? setActionDialogOpen(true) : closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "confirm" && "Confirmar reserva"}
              {actionType === "cancel" && "Cancelar reserva"}
              {actionType === "reschedule" && "Reagendar reserva"}
            </DialogTitle>
            <DialogDescription>
              {actionBooking ? `Servicio: ${actionBooking.service.title}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === "reschedule" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nueva fecha y hora</label>
                <Input
                  type="datetime-local"
                  value={actionDate}
                  onChange={(e) => setActionDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Mensaje (opcional)
              </label>
              <Textarea
                placeholder={actionType === "cancel" ? "Explica la razón de la cancelación" : "Agrega un mensaje para la otra parte"}
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={isActionLoading}>
              Cerrar
            </Button>
            <Button onClick={handleActionSubmit} disabled={isActionLoading}>
              {actionType === "confirm" && "Confirmar"}
              {actionType === "cancel" && "Cancelar"}
              {actionType === "reschedule" && "Guardar cambio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={(open) => open ? setReviewDialogOpen(true) : closeReviewDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar servicio</DialogTitle>
            <DialogDescription>
              {reviewBooking ? `Servicio: ${reviewBooking.service.title}` : "Califica la experiencia completada"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Calificación</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={value <= reviewRating ? "default" : "outline"}
                    size="icon"
                    onClick={() => setReviewRating(value)}
                    disabled={createReviewMutation.isPending}
                  >
                    <Star
                      className={
                        value <= reviewRating
                          ? "h-4 w-4 fill-yellow-400 text-yellow-400"
                          : "h-4 w-4 text-foreground/50"
                      }
                    />
                  </Button>
                ))}
                <span className="text-sm text-foreground/70">{reviewRating}/5</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comentario (opcional)</label>
              <Textarea
                placeholder="Describe tu experiencia con el servicio"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                disabled={createReviewMutation.isPending}
              />
              <p className="text-xs text-foreground/60">
                Mínimo 10 caracteres si decides escribir un comentario.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog} disabled={createReviewMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitReview} disabled={createReviewMutation.isPending}>
              Enviar reseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
