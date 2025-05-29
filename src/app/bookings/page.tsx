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
  Clock,  MapPin,  CheckCircle,
  MessageSquare,
  Phone,
  DollarSign,
  User,  Plus,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Mock data para reservas
const MOCK_BOOKINGS = [
  {
    id: 1,
    client: {
      name: "Ana García",
      avatar: "/avatars/ana.jpg",
      phone: "+57 300 123 4567",
    },
    professional: {
      name: "Carlos Méndez",
      avatar: "/avatars/carlos.jpg",
      rating: 4.9,
    },
    service: {
      title: "Reparación de Lavadora",
      category: "Electrodomésticos",
      price: "$80.000",
    },
    date: new Date(2024, 2, 15, 14, 0), // 15 marzo 2024, 2:00 PM
    duration: 120, // minutos
    status: "confirmed",
    location: "Calle 123 #45-67, Barranquilla",
    description: "Lavadora LG que no centrifuga bien y hace ruidos extraños",
    notes: "Llevar herramientas para rodamientos",
  },
  {
    id: 2,
    client: {
      name: "Roberto Silva",
      avatar: "/avatars/roberto.jpg",
      phone: "+57 301 234 5678",
    },
    professional: {
      name: "María Rodríguez",
      avatar: "/avatars/maria.jpg",
      rating: 4.8,
    },
    service: {
      title: "Limpieza Profunda",
      category: "Limpieza",
      price: "$120.000",
    },
    date: new Date(2024, 2, 16, 9, 0), // 16 marzo 2024, 9:00 AM
    duration: 180, // minutos
    status: "pending",
    location: "Carrera 45 #78-90, Soledad",
    description: "Limpieza profunda de apartamento de 3 habitaciones",
    notes: "",
  },
  {
    id: 3,
    client: {
      name: "Luis Herrera",
      avatar: "/avatars/luis.jpg",
      phone: "+57 302 345 6789",
    },
    professional: {
      name: "Carlos Méndez",
      avatar: "/avatars/carlos.jpg",
      rating: 4.9,
    },
    service: {
      title: "Reparación de Microondas",
      category: "Electrodomésticos",
      price: "$60.000",
    },
    date: new Date(2024, 2, 14, 16, 0), // 14 marzo 2024, 4:00 PM
    duration: 60, // minutos
    status: "completed",
    location: "Avenida Murillo #123, Barranquilla",
    description: "Microondas Samsung que no calienta",
    notes: "Magnetrón reemplazado exitosamente",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Confirmada";
    case "pending":
      return "Pendiente";
    case "completed":
      return "Completada";
    case "cancelled":
      return "Cancelada";
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

  const filteredBookings = MOCK_BOOKINGS.filter((booking) => {
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "upcoming" && ["confirmed", "pending"].includes(booking.status) && booking.date > new Date()) ||
      (activeTab === "today" && format(booking.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) ||
      (activeTab === "completed" && booking.status === "completed");

    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    
    const matchesSearch = 
      booking.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesStatus && matchesSearch;
  });

  const upcomingBookings = MOCK_BOOKINGS.filter(b => 
    ["confirmed", "pending"].includes(b.status) && b.date > new Date()
  );

  const todayBookings = MOCK_BOOKINGS.filter(b => 
    format(b.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );

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
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Completadas</p>
                  <p className="text-2xl font-bold">
                    {MOCK_BOOKINGS.filter(b => b.status === "completed").length}
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
                  <p className="text-sm font-medium text-foreground/60">Ingresos del Mes</p>
                  <p className="text-2xl font-bold">$560K</p>
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

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3">Estadísticas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total reservas:</span>
                      <Badge variant="secondary">{MOCK_BOOKINGS.length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pendientes:</span>
                      <Badge variant="outline">
                        {MOCK_BOOKINGS.filter(b => b.status === "pending").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Confirmadas:</span>
                      <Badge className="bg-green-100 text-green-700">
                        {MOCK_BOOKINGS.filter(b => b.status === "confirmed").length}
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
                {filteredBookings.length > 0 ? (                  <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                      return (
                        <Card key={booking.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={booking.client.avatar} />
                                  <AvatarFallback>
                                    {booking.client.name.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{booking.client.name}</h3>
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
                                      <span>{format(booking.date, "PPP", { locale: es })}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{format(booking.date, "p", { locale: es })}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      <span>{booking.service.price}</span>
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
                                  <MapPin className="h-4 w-4 text-foreground/60 mt-0.5" />
                                  <span className="text-foreground/70">{booking.location}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <User className="h-4 w-4 text-foreground/60 mt-0.5" />
                                  <span className="text-foreground/70">{booking.description}</span>
                                </div>
                              </div>
                              
                              {booking.notes && (
                                <div>
                                  <p className="text-xs text-foreground/60 mb-1">Notas:</p>
                                  <p className="text-foreground/70">{booking.notes}</p>
                                </div>
                              )}
                            </div>

                            {booking.status === "pending" && (
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

                            {booking.status === "confirmed" && booking.date <= new Date() && (
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
