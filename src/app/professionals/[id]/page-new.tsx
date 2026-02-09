"use client";

import { useState } from "react";
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
import {
  ArrowLeft,
  Star,
  MapPin,
  CheckCircle,
  Shield,
  MessageSquare,
  Calendar,
  Mail,
  Users,
  FileText,
  Briefcase,
  Languages,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ProfessionalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const professionalId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const [activeTab, setActiveTab] = useState("services");

  // Fetch professional data
  const { 
    data: professional, 
    isLoading, 
    error,
    refetch 
  } = useProfessional(professionalId);
  const handleContactProfessional = () => {
    if (!professional) return;
    router.push(`/messages?conversationWith=${professional.user.id}`);
  };

  const handleHireProfessional = () => {
    if (!professional) return;
    // Redirect to services page filtered by this professional
    window.location.href = `/book?professionalId=${professional.id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading professional profile. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Professional not found.
            </AlertDescription>
          </Alert>
          <Link href="/professionals">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Professionals
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <Link href="/" className="hover:text-primary">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/professionals" className="hover:text-primary">
              Profesionales
            </Link>
            <span>/</span>
            <span className="text-foreground">{professional.user.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back Button */}
            <Button variant="ghost" asChild className="w-fit">
              <Link href="/professionals">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a profesionales
              </Link>
            </Button>

            {/* Professional Header */}
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={professional.user.avatar} />
                  <AvatarFallback className="text-2xl">
                    {professional.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl md:text-4xl font-bold">
                        {professional.user.name}
                      </h1>
                      {professional.isVerified && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    <p className="text-xl text-foreground/70">
                      {professional.specialties[0] || "Profesional"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {professional.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-foreground/80">
                    {professional.bio || "Profesional experimentado ofreciendo servicios de calidad."}
                  </p>
                </div>
              </div>

              {/* Professional Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{professional.rating}</span>
                  <span className="text-foreground/60">
                    ({professional.reviewCount} reseñas)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  <span>{professional.experience} años de experiencia</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <Users className="h-4 w-4" />
                  <span>Miembro desde {new Date(professional.user.createdAt).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <MapPin className="h-4 w-4" />
                  <span>{professional.city}, {professional.state}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                <TabsTrigger value="about">Acerca de</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Servicios Ofrecidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {professional.services && professional.services.length > 0 ? (
                      <div className="grid gap-4">
                        {professional.services.map((service) => (
                          <div
                            key={service.id}
                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{service.title}</h3>
                                  <Badge variant="outline">
                                    {service.category.name}
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground/70">
                                  Duración: {service.duration} minutos
                                </p>
                              </div>                              <div className="text-right">
                                <div className="text-sm text-foreground/60">
                                  {Math.floor(service.duration / 60)}h {service.duration % 60}min
                                </div>
                                <Button size="sm" className="mt-2" asChild>
                                  <Link href={`/services/${service.id}`}>
                                    Ver Detalles
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-foreground/60">
                        No hay servicios disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reseñas de Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {professional.rating}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(professional.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-foreground/60 mt-1">
                          {professional.reviewCount} reseñas
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-foreground/60">
                          Basado en {professional.reviewCount} reseñas
                          {professional.isVerified && " verificadas"}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Individual Reviews */}
                    {professional.reviews && professional.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {professional.reviews.map((review) => (
                          <div key={review.id} className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={review.client.avatar} />
                                <AvatarFallback>
                                  {review.client.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {review.client.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verificado
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-foreground/60">
                                    {new Date(review.createdAt).toLocaleDateString(
                                      "es-ES",
                                    )}
                                  </span>
                                  {review.booking?.service && (
                                    <Badge variant="outline" className="text-xs">
                                      {review.booking.service.title}
                                    </Badge>
                                  )}
                                </div>
                                {review.comment && (
                                  <p className="text-sm text-foreground/80">
                                    {review.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-foreground/60">
                        Aún no hay reseñas disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Acerca de {professional.user.name.split(" ")[0]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-foreground/80">
                        {professional.bio || "Este profesional aún no ha agregado una descripción detallada."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-foreground/60" />
                        <span>{professional.user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Languages className="h-4 w-4 text-foreground/60" />
                        <span>Español</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ubicación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-foreground/60" />
                        <span>Aguachica, Cesar</span>
                      </div>
                      {professional.address && (
                        <div className="text-sm text-foreground/70">
                          {professional.address}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Contactar Profesional</CardTitle>
              </CardHeader>              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    Servicios Profesionales
                  </div>
                  <div className="text-sm text-foreground/60">
                    Consulta precios directamente
                  </div>
                </div>

                <Button
                  onClick={handleHireProfessional}
                  className="w-full"
                  size="lg"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Contratar Ahora
                </Button>
                <Button
                  onClick={handleContactProfessional}
                  variant="outline"
                  className="w-full"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar Mensaje
                </Button>

                <div className="text-center pt-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-foreground/60">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>
                      {professional.isVerified ? "Profesional verificado" : "Perfil en revisión"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {professional.experience}
                    </div>
                    <div className="text-xs text-foreground/60">Años exp.</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {professional.rating}
                    </div>
                    <div className="text-xs text-foreground/60">Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {professional.reviewCount}
                    </div>
                    <div className="text-xs text-foreground/60">Reseñas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {new Date().getFullYear() - new Date(professional.user.createdAt).getFullYear()}
                    </div>
                    <div className="text-xs text-foreground/60">Años</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {professional.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
