"use client";

import { useState } from "react";
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
  Euro, 
  Star, 
  MapPin, 
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
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";

// Mock jobs data
const jobsData = [
  {
    id: 1,
    title: "Diseño de Logo para TechStart",
    client: {
      name: "Carlos Méndez",
      avatar: "",
      email: "carlos@techstart.com",
      phone: "+34 612 345 678",
      location: "Barcelona, España"
    },
    category: "Diseño Gráfico",
    status: "in_progress",
    budget: 250,
    timeline: "3 días",
    startDate: new Date(),
    endDate: addDays(new Date(), 3),
    description: "Necesito un logo moderno y profesional para mi startup de tecnología. El logo debe ser versátil y funcionar tanto en digital como en impreso.",
    requirements: [
      "Logo principal",
      "Versión horizontal",
      "Versión monocromática",
      "Manual de marca básico"
    ],
    progress: 60,
    rating: null,
    paymentStatus: "pending",
    lastActivity: "Hace 2 horas"
  },
  {
    id: 2,
    title: "Branding Completo para Restaurante",
    client: {
      name: "Ana López",
      avatar: "",
      email: "ana@saborcasero.es",
      phone: "+34 665 789 123",
      location: "Madrid, España"
    },
    category: "Branding",
    status: "completed",
    budget: 800,
    timeline: "2 semanas",
    startDate: addDays(new Date(), -14),
    endDate: addDays(new Date(), -1),
    description: "Desarrollo de identidad visual completa para restaurante de comida casera.",
    requirements: [
      "Logo y variaciones",
      "Paleta de colores",
      "Tipografía corporativa",
      "Aplicaciones (cartas, uniformes, etc.)"
    ],
    progress: 100,
    rating: 5,
    paymentStatus: "paid",
    lastActivity: "Hace 1 día"
  },
  {
    id: 3,
    title: "Diseño Web E-commerce",
    client: {
      name: "Pedro Ruiz",
      avatar: "",
      email: "pedro@mitienda.com",
      phone: "+34 678 901 234",
      location: "Valencia, España"
    },
    category: "Diseño Web",
    status: "pending",
    budget: 1200,
    timeline: "1 mes",
    startDate: addDays(new Date(), 2),
    endDate: addDays(new Date(), 32),
    description: "Diseño y desarrollo de tienda online para productos artesanales.",
    requirements: [
      "Diseño responsive",
      "Catálogo de productos",
      "Sistema de pagos",
      "Panel de administración"
    ],
    progress: 0,
    rating: null,
    paymentStatus: "pending",
    lastActivity: "Hace 1 hora"
  },
  {
    id: 4,
    title: "Ilustraciones para Libro Infantil",
    client: {
      name: "María González",
      avatar: "",
      email: "maria@cuentos.es",
      phone: "+34 654 321 987",
      location: "Sevilla, España"
    },
    category: "Ilustración",
    status: "cancelled",
    budget: 400,
    timeline: "3 semanas",
    startDate: addDays(new Date(), -10),
    endDate: addDays(new Date(), 11),
    description: "Serie de ilustraciones para libro infantil sobre aventuras espaciales.",
    requirements: [
      "15 ilustraciones a color",
      "Estilo cartoon amigable",
      "Formato alta resolución",
      "Bocetos incluidos"
    ],
    progress: 25,
    rating: null,
    paymentStatus: "refunded",
    lastActivity: "Hace 3 días"
  },
  {
    id: 5,
    title: "Rediseño de Identidad Corporativa",
    client: {
      name: "Innovate Corp",
      avatar: "",
      email: "info@innovatecorp.es",
      phone: "+34 987 654 321",
      location: "Bilbao, España"
    },
    category: "Branding",
    status: "revision",
    budget: 1500,
    timeline: "1 mes",
    startDate: addDays(new Date(), -15),
    endDate: addDays(new Date(), 15),
    description: "Modernización completa de la identidad visual corporativa.",
    requirements: [
      "Nuevo logo",
      "Manual de marca",
      "Papelería corporativa",
      "Señalética"
    ],
    progress: 80,
    rating: null,
    paymentStatus: "partial",
    lastActivity: "Hace 30 min"
  }
];

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");  const [selectedJob, setSelectedJob] = useState<typeof jobsData[0] | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showDeliverables, setShowDeliverables] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "revision":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in_progress":
        return "En Progreso";
      case "revision":
        return "En Revisión";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />;
      case "revision":
        return <Edit3 className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterJobs = (jobs: typeof jobsData, tab: string) => {
    let filtered = jobs;

    // Filter by tab
    if (tab === "active") {
      filtered = filtered.filter(job => ["pending", "in_progress", "revision"].includes(job.status));
    } else if (tab === "completed") {
      filtered = filtered.filter(job => job.status === "completed");
    } else if (tab === "cancelled") {
      filtered = filtered.filter(job => job.status === "cancelled");
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    return filtered;
  };

  const getTabCount = (tab: string) => {
    return filterJobs(jobsData, tab).length;
  };

  const calculateEarnings = () => {
    const completedJobs = jobsData.filter(job => job.status === "completed");
    const totalEarnings = completedJobs.reduce((sum, job) => sum + job.budget, 0);
    const thisMonth = completedJobs.filter(job => 
      job.endDate.getMonth() === new Date().getMonth()
    ).reduce((sum, job) => sum + job.budget, 0);
    
    return { total: totalEarnings, thisMonth };
  };

  const earnings = calculateEarnings();

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
                    {jobsData.filter(job => job.status === "revision").length}
                  </div>
                  <div className="text-sm text-muted-foreground">En revisión</div>
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
                    {jobsData.filter(job => job.status === "pending").length}
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
            <TabsTrigger value="all">Todos ({jobsData.length})</TabsTrigger>
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
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="revision">En revisión</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs Content */}
        {["all", "active", "completed", "cancelled"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filterJobs(jobsData, tab).map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1">{getStatusText(job.status)}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {job.client.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{job.client.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.client.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(job.startDate, "dd MMM yyyy", { locale: es })}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Euro className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">€{job.budget}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{job.timeline}</span>
                          </div>
                          {job.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{job.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {job.status === "in_progress" && (
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${job.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-muted-foreground">{job.progress}%</span>
                            </div>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedJob(job);
                              setShowJobDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalles
                          </Button>
                          
                          {job.status === "completed" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
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

            {filterJobs(jobsData, tab).length === 0 && (
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
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Detalles completos del proyecto
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {selectedJob.client.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedJob.client.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedJob.client.location}</p>
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
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Presupuesto</Label>
                  <div className="text-lg font-semibold text-green-600">€{selectedJob.budget}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Timeline</Label>
                  <div className="text-lg font-semibold">{selectedJob.timeline}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de inicio</Label>
                  <div className="text-lg font-semibold">
                    {format(selectedJob.startDate, "dd MMM yyyy", { locale: es })}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de entrega</Label>
                  <div className="text-lg font-semibold">
                    {format(selectedJob.endDate, "dd MMM yyyy", { locale: es })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                <p className="mt-2">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Entregables</Label>
                <ul className="mt-2 space-y-1">
                  {selectedJob.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Progress */}
              {selectedJob.status === "in_progress" && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Progreso del proyecto</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${selectedJob.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{selectedJob.progress}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJobDetails(false)}>
              Cerrar
            </Button>
            {selectedJob?.status === "in_progress" && (
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
            <DialogTitle>Entregables - {selectedJob?.title}</DialogTitle>
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
                    <h4 className="font-medium">Logo_Final.zip</h4>
                    <p className="text-sm text-muted-foreground">2.3 MB • Archivos vectoriales</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium">Manual_Marca.pdf</h4>
                    <p className="text-sm text-muted-foreground">1.8 MB • Guía de uso</p>
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
