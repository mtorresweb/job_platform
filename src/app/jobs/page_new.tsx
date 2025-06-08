"use client";

import { useState } from "react";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { useUserBookings, useProfessionalBookings } from "@/shared/hooks/useBookings";
import { BookingStatus, Booking } from "@/shared/utils/bookings-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  Star,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  MessageCircle,
  Mail,
  Download,
  Upload,
  Edit3,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showDeliverables, setShowDeliverables] = useState(false);

  const userRole = useUserRole();
  
  // Get bookings based on user role
  const { 
    data: userBookingsData, 
    isLoading: isUserBookingsLoading,
    error: userBookingsError 
  } = useUserBookings({ 
    page: 1, 
    limit: 100,
    filters: {}
  });

  const { 
    data: professionalBookingsData, 
    isLoading: isProfessionalBookingsLoading,
    error: professionalBookingsError 
  } = useProfessionalBookings({ 
    page: 1, 
    limit: 100,
    filters: {}
  });
  // Determine which bookings to use based on user role
  const bookingsData = userRole.isProfessional ? professionalBookingsData : userBookingsData;
  const isLoading = userRole.isProfessional ? isProfessionalBookingsLoading : isUserBookingsLoading;
  const error = userRole.isProfessional ? professionalBookingsError : userBookingsError;
  
  const bookings = bookingsData?.bookings || [];

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case BookingStatus.CONFIRMED:
      case BookingStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case BookingStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case BookingStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "Pendiente";
      case BookingStatus.CONFIRMED:
        return "Confirmado";
      case BookingStatus.IN_PROGRESS:
        return "En Progreso";
      case BookingStatus.COMPLETED:
        return "Completado";
      case BookingStatus.CANCELLED:
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case BookingStatus.CONFIRMED:
      case BookingStatus.IN_PROGRESS:
        return <AlertCircle className="h-4 w-4" />;
      case BookingStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case BookingStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterJobs = (bookings: Booking[], tab: string) => {
    let filtered = bookings;

    // Filter by tab
    if (tab === "active") {
      filtered = filtered.filter(booking => 
        [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS].includes(booking.status)
      );
    } else if (tab === "completed") {
      filtered = filtered.filter(booking => booking.status === BookingStatus.COMPLETED);
    } else if (tab === "cancelled") {
      filtered = filtered.filter(booking => booking.status === BookingStatus.CANCELLED);
    }

    // Filter by search
    if (searchQuery) {      filtered = filtered.filter(booking => 
        booking.service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (userRole.isProfessional ? booking.client.name : booking.professional.name)
          .toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.service.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    return filtered;
  };

  const getTabCount = (tab: string) => {
    return filterJobs(bookings, tab).length;
  };
  const calculateEarnings = () => {
    // Since payment system is removed, return zero earnings
    return { total: 0, thisMonth: 0 };
  };

  const earnings = calculateEarnings();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-medium mb-2">Error al cargar los trabajos</h3>
            <p className="text-sm text-muted-foreground">
              Hubo un problema al cargar tus trabajos. Por favor, intenta nuevamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Trabajos</h1>
            <p className="text-muted-foreground">
              Gestiona tus proyectos activos y historial de trabajos
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Ingresos este mes</div>
              <div className="text-2xl font-bold text-green-600">€{earnings.thisMonth}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total ganado</div>
              <div className="text-2xl font-bold">€{earnings.total}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{getTabCount("active")}</div>
                  <div className="text-sm text-muted-foreground">Activos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{getTabCount("completed")}</div>
                  <div className="text-sm text-muted-foreground">Completados</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {bookings.filter(booking => booking.status === BookingStatus.IN_PROGRESS).length}
                  </div>
                  <div className="text-sm text-muted-foreground">En progreso</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {bookings.filter(booking => booking.status === BookingStatus.PENDING).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pendientes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="all">Todos ({bookings.length})</TabsTrigger>
            <TabsTrigger value="active">Activos ({getTabCount("active")})</TabsTrigger>
            <TabsTrigger value="completed">Completados ({getTabCount("completed")})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados ({getTabCount("cancelled")})</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar trabajos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={BookingStatus.PENDING}>Pendiente</SelectItem>
                <SelectItem value={BookingStatus.CONFIRMED}>Confirmado</SelectItem>
                <SelectItem value={BookingStatus.IN_PROGRESS}>En progreso</SelectItem>
                <SelectItem value={BookingStatus.COMPLETED}>Completado</SelectItem>
                <SelectItem value={BookingStatus.CANCELLED}>Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs Content */}
        {["all", "active", "completed", "cancelled"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filterJobs(bookings, tab).map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{booking.service.title}</h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{getStatusText(booking.status)}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {(userRole.isProfessional ? booking.client.name : booking.professional.name)
                                .split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {userRole.isProfessional ? booking.client.name : booking.professional.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{booking.service.category.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(booking.scheduledAt), "dd MMM yyyy", { locale: es })}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {booking.notes || "Sin descripción adicional"}
                      </p>

                      <div className="flex items-center justify-between">                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{booking.duration}min</span>
                          </div>
                          {booking.review && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{booking.review.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedJob(booking);
                              setShowJobDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalles
                          </Button>
                          
                          {booking.status === BookingStatus.COMPLETED && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedJob(booking);
                                setShowDeliverables(true);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterJobs(bookings, tab).length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No hay trabajos para mostrar</h3>
                  <p className="text-sm text-muted-foreground">
                    {tab === "active" && "No tienes trabajos activos en este momento."}
                    {tab === "completed" && "Aún no has completado ningún trabajo."}
                    {tab === "cancelled" && "No tienes trabajos cancelados."}
                    {tab === "all" && "No se encontraron trabajos que coincidan con tus filtros."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.service.title}</DialogTitle>
            <DialogDescription>
              Detalles completos del proyecto
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              {/* Client/Professional Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {(userRole.isProfessional ? selectedJob.client.name : selectedJob.professional.name)
                      .split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">                  <h4 className="font-medium">
                    {userRole.isProfessional ? selectedJob.client.name : selectedJob.professional.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {userRole.isProfessional ? selectedJob.client.email : selectedJob.professional.email}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-1" />
                      Enviar email
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Mensaje
                    </Button>
                  </div>
                </div>
              </div>              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duración</Label>
                  <div className="text-lg font-semibold">{selectedJob.duration} min</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha programada</Label>
                  <div className="text-lg font-semibold">
                    {format(new Date(selectedJob.scheduledAt), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                  <div className="text-lg font-semibold">
                    {getStatusText(selectedJob.status)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Notas</Label>
                <p className="mt-2">{selectedJob.notes || "Sin notas adicionales"}</p>
              </div>

              {/* Service Category */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Categoría del servicio</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">{selectedJob.service.category.name}</Badge>
                </div>
              </div>

              {/* Review */}
              {selectedJob.review && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Calificación</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{selectedJob.review.rating}</span>
                    </div>                    {selectedJob.review.comment && (
                      <p className="text-sm text-muted-foreground ml-4">
                        &ldquo;{selectedJob.review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJobDetails(false)}>
              Cerrar
            </Button>
            {selectedJob?.status === BookingStatus.IN_PROGRESS && (
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Subir entregables
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deliverables Dialog */}
      <Dialog open={showDeliverables} onOpenChange={setShowDeliverables}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entregables - {selectedJob?.service.title}</DialogTitle>
            <DialogDescription>
              Descarga los archivos finales del proyecto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Entregables_Final.zip</h4>
                    <p className="text-sm text-muted-foreground">2.3 MB • Archivos del proyecto</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliverables(false)}>
              Cerrar
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Descargar todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
