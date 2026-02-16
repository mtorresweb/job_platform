"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Shield,
  MessageSquare,
  Calendar,
  FileText,
  Camera,
} from "lucide-react";
import { useService } from "@/shared/hooks/useServices";
import { useServiceReviews } from "@/shared/hooks/useReviews";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params?.id as string;
  const { data: service, isLoading: isLoadingService, error: serviceError } = useService(serviceId);
  const { data: reviewsData } = useServiceReviews(serviceId);
  const { data: currentUser } = useCurrentUser();
  
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoadingService) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-8">
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (serviceError || !service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Servicio no encontrado</h2>
          <p className="text-foreground/60 mb-4">
            El servicio que buscas no existe o ha sido eliminado.
          </p>
          <Button asChild>
            <Link href="/services">Volver a servicios</Link>
          </Button>
        </div>
      </div>
    );
  }
  const reviews = reviewsData?.reviews || [];
  const priceSuffix = service?.priceType === "PER_HOUR" ? " / hora" : service?.priceType === "PER_JOB" ? " por trabajo" : "";
  const formattedPrice = Number.isFinite(service?.price)
    ? `${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(service.price))}${priceSuffix}`
    : "A convenir";
  const isOwner = Boolean(
    currentUser &&
    service?.professional &&
    (currentUser.professional?.id === service.professional.id || currentUser.id === service.professional.user?.id)
  );

  const handleContactProvider = () => {
    if (!service?.professional?.user) return;
    // Redirect to messaging page with professional
    window.location.href = `/messages/new?professionalId=${service.professional.id}&name=${encodeURIComponent(service.professional.user.name)}&serviceId=${service.id}`;
  };

  const handleBookService = () => {
    if (!service?.professional) return;
    // Redirect to booking page with pre-filled service data
    window.location.href = `/book?serviceId=${service.id}&professionalId=${service.professional.id}`;
  };

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
            <Link href="/services" className="hover:text-primary">
              Servicios
            </Link>            <span>/</span>
            <span>{service.category?.name || 'Servicios'}</span>
            <span>/</span>
            <span className="text-foreground">{service.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back Button */}
            <Button variant="ghost" asChild className="w-fit">
              <Link href="/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a servicios
              </Link>
            </Button>            {/* Service Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary">{service.category?.name || 'Servicio'}</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {service.title}
                  </h1>
                  <p className="text-xl text-foreground/70">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Service Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{service.professional?.rating || 0}</span>
                  <span className="text-foreground/60">
                    ({service.professional?.reviewCount || 0} reseñas)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{service.bookingCount || 0} trabajos completados</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <Clock className="h-4 w-4" />
                  <span>Duración: {Math.floor(service.duration / 60)}h {service.duration % 60}min</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <MapPin className="h-4 w-4" />
                  <span>Aguachica, Cesar</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Descripción</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                <TabsTrigger value="gallery">Galería</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>              <TabsContent value="overview" className="space-y-6">
                {/* Service Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Descripción del Servicio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-foreground/80">
                        {service.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Tags */}
                {service.tags && service.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Etiquetas del Servicio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {service.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Service Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles del Servicio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Duración: {Math.floor(service.duration / 60)}h {service.duration % 60}min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Categoría: {service.category?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Profesional verificado: {service.professional?.isVerified ? 'Sí' : 'No'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>              <TabsContent value="reviews" className="space-y-6">
                {/* Reviews Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Reseñas de Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {service.professional?.rating || 0}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(service.professional?.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-foreground/60 mt-1">
                          {service.professional?.reviewCount || 0} reseñas
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-foreground/60">
                          Basado en {service.professional?.reviewCount || 0} reseñas verificadas
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Individual Reviews */}
                    <div className="space-y-6">
                      {reviews && reviews.length > 0 ? (
                        reviews.map((review: { id: string; rating: number; comment?: string; client: { name: string; avatar?: string }; createdAt: string }) => (
                          <div key={review.id} className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={review.client?.avatar} />
                                <AvatarFallback>
                                  {review.client?.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {review.client?.name}
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
                                </div>
                                <p className="text-sm text-foreground/80">
                                  {review.comment}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-foreground/60">
                          <p>No hay reseñas disponibles para este servicio.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>              <TabsContent value="gallery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Galería de Trabajos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {service.images && service.images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.images.map((image: string, index: number) => (
                          <div
                            key={index}
                            className="aspect-video bg-muted rounded-lg overflow-hidden"
                          >                            <Image 
                              src={image} 
                              alt={`Imagen ${index + 1} del servicio`}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.className = 'w-full h-full flex items-center justify-center bg-muted';
                                fallback.innerHTML = '<svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                (e.target as HTMLElement).parentNode?.appendChild(fallback);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-foreground/60">
                        <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p>No hay imágenes disponibles para este servicio.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>              <TabsContent value="faq" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Adicional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">¿Cómo funciona el servicio?</h4>
                        <p className="text-sm text-foreground/70">
                          Una vez reservado el servicio, el profesional se pondrá en contacto contigo para coordinar los detalles específicos del trabajo.
                        </p>
                        <Separator className="mt-4" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">¿Cómo puedo contactar al profesional?</h4>
                        <p className="text-sm text-foreground/70">
                          Puedes usar el botón &quot;Contactar&quot; para enviar un mensaje directo al profesional antes de realizar la reserva.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}          <div className="space-y-6">
            {/* Service Actions Card */}
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  Contratar Servicio
                </CardTitle>
                <div className="space-y-1 text-sm text-foreground/60">
                  <div>Duración: {Math.floor(service.duration / 60)}h {service.duration % 60}min</div>
                  <div>Categoría: {service.category?.name}</div>
                    <div>Precio: {formattedPrice}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isOwner && (
                  <Button
                    onClick={handleBookService}
                    className="w-full"
                    size="lg"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Reservar Servicio
                  </Button>
                )}
                <Button
                  onClick={handleContactProvider}
                  variant="outline"
                  className="w-full"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contactar
                </Button>

                <div className="text-center pt-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-foreground/60">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Garantía de satisfacción</span>
                  </div>
                </div>
              </CardContent>
            </Card>            {/* Provider Card */}
            <Card>
              <CardHeader>
                <CardTitle>Acerca del Profesional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={service.professional?.user?.avatar} />
                    <AvatarFallback>
                      {service.professional?.user?.name
                        ?.split(" ")
                        ?.map((n: string) => n[0])
                        .join("") || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {service.professional?.user?.name || "Profesional"}
                      </span>
                      {service.professional?.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>                    <div className="text-sm text-foreground/60">
                      Profesional verificado
                    </div>
                  </div>
                </div>                {service.professional?.bio && (
                  <p className="text-sm text-foreground/70">
                    {service.professional.bio}
                  </p>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>Calificación: {service.professional?.rating || 0}/5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{service.professional?.reviewCount || 0} reseñas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-foreground/60" />
                    <span>Ubicación: Aguachica, Cesar</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/professionals/${service.professional?.id}`}>
                    Ver Perfil Completo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
