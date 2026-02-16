"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfessional } from "@/shared/hooks/useProfessionals";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { apiClient } from "@/shared/utils/api-client";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  MessageSquare,
  Users,
  Briefcase,
  AlertCircle,
  GraduationCap,
  Shield,
  Calendar,
  Paperclip,
  ArrowRight as LinkIcon,
} from "lucide-react";

export default function ProfessionalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const professionalId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data: professional, isLoading, error, refetch } = useProfessional(professionalId ?? "");
  const { data: currentUser } = useCurrentUser();

  const [activeTab, setActiveTab] = useState("services");

  const isOwner = Boolean(professional && professional.userId === currentUser?.id);
  const viewerRole = currentUser?.role || "CLIENT";

  const handleContactProfessional = () => {
    if (!professional) return;
    router.push(`/messages?conversationWith=${professional.user.id}`);
  };

  const handleBookService = (serviceId: string) => {
    if (!professional || !serviceId) return;
    router.push(`/book?professionalId=${professional.id}&serviceId=${serviceId}`);
  };

  const handleEditService = (serviceId: string) => {
    if (!serviceId) return;
    router.push(`/profile?editService=${serviceId}`);
  };

  useEffect(() => {
    if (!professional?.id || isOwner) return;
    apiClient.post("/analytics/profile-view", { professionalId: professional.id }).catch((err) => {
      console.error("Error registrando vista de perfil", err);
    });
  }, [professional?.id, isOwner]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="bg-card border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>

        {/* Profile Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-8 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Services Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/professionals">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-xl font-semibold">Perfil Profesional</h1>
            </div>
          </div>
        </div>

        {/* Error State */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar el perfil del profesional.
              <Button
                variant="link"
                className="p-0 h-auto ml-1"
                onClick={() => refetch()}
              >
                Intentar de nuevo
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/professionals">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-xl font-semibold">Perfil Profesional</h1>
            </div>
          </div>
        </div>

        {/* Not Found */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profesional no encontrado.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const services = professional.services ?? [];
  const specialties = professional.specialties ?? [];
  const portfolios = professional.portfolios ?? [];
  const initials = professional.user?.name
    ? professional.user.name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
    : "PR";

  const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString("es-CO") : "Sin fecha");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/professionals">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Perfil Profesional</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={professional.user.avatar || ""} />
                    <AvatarFallback className="text-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">
                          {professional.user.name}
                        </h1>                        <p className="text-lg text-foreground/70 mt-1">
                          {professional.bio || "Profesional"}
                        </p>
                      </div>
                      {professional.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    
                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{professional.rating.toFixed(1)}</span>
                        <span className="text-foreground/60">({professional.reviewCount} reseñas)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-foreground/60" />
                        <span className="text-foreground/70">Aguachica, Cesar</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-foreground/60" />
                        <span className="text-foreground/70">
                          Suele responder rápido
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="portfolio">Portafolio</TabsTrigger>
                <TabsTrigger value="about">Acerca de</TabsTrigger>
              </TabsList>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Servicios ofrecidos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{service.title}</h3>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-sm text-foreground/60">
                                {Math.floor(service.duration / 60)}h {service.duration % 60}min
                              </span>
                              <Badge variant="outline">
                                {service.category.name}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/services/${service.id}`}>
                                Ver ficha
                              </Link>
                            </Button>
                            {isOwner ? (
                              <Button 
                                onClick={() => handleEditService(service.id)}
                                size="sm"
                                variant="outline"
                              >
                                Editar
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleBookService(service.id)}
                                size="sm"
                              >
                                Reservar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {services.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Aún no hay servicios publicados
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Portafolio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {portfolios.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 space-y-2">
                        <p>
                          {isOwner
                            ? "Aún no has agregado elementos a tu portafolio."
                            : viewerRole === "ADMIN"
                              ? "Este profesional no tiene elementos publicados."
                              : "Este profesional aún no ha publicado elementos."}
                        </p>
                        {isOwner && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/profile">Agregar portafolio</Link>
                          </Button>
                        )}
                      </div>
                    ) : (
                      portfolios.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                <Badge variant="secondary">
                                  {item.type === "EXPERIENCE" ? "Experiencia" : item.type === "CERTIFICATE" ? "Certificado" : "Proyecto"}
                                </Badge>
                                {item.organization && (
                                  <Badge variant="outline">{item.organization}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-foreground/70 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-foreground/60" />
                                <span>
                                  {formatDate(item.startDate)}
                                  {" "}–{" "}
                                  {item.isCurrent ? "Actual" : formatDate(item.endDate)}
                                </span>
                              </p>
                              {item.description && (
                                <p className="text-sm text-foreground/70 leading-relaxed">{item.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {(item.tags || []).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm">
                                {item.link && (
                                  <Link href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary">
                                    <LinkIcon className="h-4 w-4" />
                                    Enlace
                                  </Link>
                                )}
                                {item.attachmentUrl && (
                                  <Link href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary">
                                    <Paperclip className="h-4 w-4" />
                                    Ver adjunto
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Acerca de</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Descripción</h3>
                      <p className="text-foreground/70 leading-relaxed">
                        {professional.bio || "Sin descripción disponible."}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-3">Experiencia y certificaciones</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-foreground/70">
                            {professional.experience} años de experiencia
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-foreground/70">
                            Profesional certificado
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-foreground/70">
                            {professional.reviewCount} clientes atendidos
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-foreground/70">
                            Antecedentes verificados
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleContactProfessional}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar mensaje
                </Button>
                
                <Separator />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Información útil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Experiencia</span>
                  <span className="font-medium">{professional.experience} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Calificación</span>
                  <span className="font-medium">{professional.rating.toFixed(1)} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Reseñas</span>
                  <span className="font-medium">{professional.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Miembro desde</span>
                  <span className="font-medium">
                    {new Date(professional.user.createdAt).getFullYear()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
