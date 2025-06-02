"use client";

import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  MessageSquare,
  Phone,
  DollarSign,
  User,
  Plus,
  Edit,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { useUserBookings, useProfessionalBookings } from "@/shared/hooks/useBookings";
import { BookingStatus } from "@/shared/utils/bookings-api";

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
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  // Get user role to determine which bookings to show
  const { isProfessional, user } = useUserRole();

  // Fetch bookings based on user role
  const { 
    data: clientBookingsData, 
    isLoading: isLoadingClient, 
    error: clientError 
  } = useUserBookings({
    filters: filterStatus !== "all" ? { status: [filterStatus as BookingStatus] } : undefined
  });

  const { 
    data: professionalBookingsData, 
    isLoading: isLoadingProfessional, 
    error: professionalError 
  } = useProfessionalBookings({
    filters: filterStatus !== "all" ? { status: [filterStatus as BookingStatus] } : undefined
  });

  // Determine which data to use
  const bookingsData = isProfessional ? professionalBookingsData : clientBookingsData;
  const isLoading = isProfessional ? isLoadingProfessional : isLoadingClient;
  const error = isProfessional ? professionalError : clientError;
  const bookings = bookingsData?.bookings || [];

  // Filter bookings based on active tab and search
  const getFilteredBookings = () => {
    if (!bookings) return [];
    
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.scheduledAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const matchesTab = 
        activeTab === "all" ||
        (activeTab === "upcoming" && [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(booking.status) && bookingDate > new Date()) ||
        (activeTab === "today" && format(bookingDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) ||
        (activeTab === "completed" && booking.status === BookingStatus.COMPLETED);

      const matchesSearch = 
        (isProfessional ? booking.client.name : booking.professional.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.title.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
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

  // Loading state
  if (isLoading) {
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
          
          <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Reserva</DialogTitle>
                <DialogDescription>
                  Programa una nueva cita con un cliente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cliente</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ana">Ana García</SelectItem>
                        <SelectItem value="roberto">Roberto Silva</SelectItem>
                        <SelectItem value="luis">Luis Herrera</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Servicio</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electrodomesticos">Electrodomésticos</SelectItem>
                        <SelectItem value="limpieza">Limpieza</SelectItem>
                        <SelectItem value="plomeria">Plomería</SelectItem>
                        <SelectItem value="electricidad">Electricidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Título del Servicio</label>
                  <Input placeholder="Ej. Reparación de lavadora" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha</label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      locale={es}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Hora</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="14:00">2:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Duración</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Duración estimada" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="90">1.5 horas</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                          <SelectItem value="180">3 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Precio</label>
                      <Input placeholder="$0" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Dirección</label>
                  <Input placeholder="Dirección completa del servicio" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Descripción</label>
                  <Textarea placeholder="Describe el problema o servicio requerido..." />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Notas Internas</label>
                  <Textarea placeholder="Notas privadas para recordar..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewBookingOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsNewBookingOpen(false)}>
                  Crear Reserva
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Total</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-500" />
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
                    placeholder="Cliente, servicio o ubicación..."
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
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="confirmed">Confirmadas</SelectItem>
                      <SelectItem value="completed">Completadas</SelectItem>
                      <SelectItem value="cancelled">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <div className="flex justify-between text-sm">
                      <span>Confirmadas:</span>
                      <Badge className="bg-green-100 text-green-700">
                        {bookings.filter(b => b.status === BookingStatus.CONFIRMED).length}
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
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{format(bookingDate, "p", { locale: es })}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      <span>${booking.totalPrice}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
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

                            {booking.status === BookingStatus.PENDING && (
                              <div className="flex gap-2 mt-4 pt-4 border-t">
                                <Button size="sm" className="flex-1">
                                  Confirmar
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                  Reagendar
                                </Button>
                                <Button variant="outline" size="sm">
                                  Cancelar
                                </Button>
                              </div>
                            )}

                            {booking.status === BookingStatus.CONFIRMED && bookingDate <= new Date() && (
                              <div className="flex gap-2 mt-4 pt-4 border-t">
                                <Button size="sm" className="flex-1">
                                  Marcar como Completada
                                </Button>
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
                    <Button onClick={() => setIsNewBookingOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Reserva
                    </Button>
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
