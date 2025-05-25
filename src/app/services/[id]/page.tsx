"use client";

import { useState } from "react";
import Link from "next/link";
// import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Mock data - en el futuro vendrá de la API
const MOCK_SERVICE_DETAIL = {
  id: 1,
  title: "Reparación de Electrodomésticos",
  description:
    "Servicio profesional de reparación de electrodomésticos con más de 10 años de experiencia. Especializado en lavadoras, neveras, estufas, microondas y pequeños electrodomésticos.",
  longDescription: `
    Ofrezco un servicio completo de reparación de electrodomésticos a domicilio con garantía de satisfacción. 
    Mi experiencia de más de 10 años en el sector me permite diagnosticar y reparar eficientemente cualquier 
    tipo de electrodoméstico.

    **Servicios incluidos:**
    - Diagnóstico gratuito a domicilio
    - Reparación de lavadoras y secadoras
    - Reparación de neveras y congeladores
    - Reparación de estufas y hornos
    - Reparación de microondas
    - Mantenimiento preventivo
    - Garantía de 6 meses en todas las reparaciones

    **¿Por qué elegirme?**
    - Más de 10 años de experiencia
    - Técnico certificado
    - Repuestos originales garantizados
    - Servicio a domicilio sin costo adicional
    - Atención los 7 días de la semana
    - Presupuesto sin compromiso
  `,
  category: "Hogar",
  price: "Desde $50.000",
  priceDetails: {
    diagnosis: "Gratuito",
    minService: "$50.000",
    hourlyRate: "$25.000/hora",
    emergency: "$80.000 (fines de semana y festivos)",
  },
  location: "Bogotá, Colombia",
  serviceArea: ["Bogotá", "Soacha", "Chía", "Zipaquirá"],
  rating: 4.8,
  reviewCount: 124,
  completedJobs: 350,
  responseTime: "2 horas",
  availability: "Lunes a Domingo, 7:00 AM - 8:00 PM",
  provider: {
    id: 1,
    name: "Carlos Méndez",
    image: "/avatars/carlos.jpg",
    verified: true,
    memberSince: "2020",
    specialties: ["Electrodomésticos", "Refrigeración", "Línea Blanca"],
    languages: ["Español"],
    phone: "+57 300 123 4567",
    email: "carlos.mendez@servicespro.com",
    bio: "Técnico especializado en reparación de electrodomésticos con certificación internacional. Más de 350 reparaciones exitosas y 10 años de experiencia en el sector.",
  },
  features: [
    "Servicio a domicilio",
    "Diagnóstico gratuito",
    "Garantía de 6 meses",
    "Repuestos originales",
    "Técnico certificado",
    "Atención 7 días",
  ],
  gallery: [
    "/services/electrodomesticos-1.jpg",
    "/services/electrodomesticos-2.jpg",
    "/services/electrodomesticos-3.jpg",
    "/services/electrodomesticos-4.jpg",
  ],
  reviews: [
    {
      id: 1,
      user: "María González",
      avatar: "/avatars/maria.jpg",
      rating: 5,
      date: "2024-01-15",
      comment:
        "Excelente servicio. Carlos llegó puntual, diagnosticó el problema de mi lavadora rápidamente y la reparó el mismo día. Muy profesional y honesto con los precios.",
      verified: true,
    },
    {
      id: 2,
      user: "Roberto Silva",
      avatar: "/avatars/roberto.jpg",
      rating: 5,
      date: "2024-01-10",
      comment:
        "Muy satisfecho con el servicio. Mi nevera no estaba enfriando bien y Carlos la dejó como nueva. La garantía me da mucha tranquilidad.",
      verified: true,
    },
    {
      id: 3,
      user: "Ana Martínez",
      avatar: "/avatars/ana.jpg",
      rating: 4,
      date: "2024-01-05",
      comment:
        "Buen servicio técnico. Reparó mi estufa y explicó todo el proceso. Solo le doy 4 estrellas porque llegó 30 minutos tarde, pero avisó con anticipación.",
      verified: true,
    },
  ],
  faqs: [
    {
      question: "¿El diagnóstico tiene costo?",
      answer:
        "No, el diagnóstico es completamente gratuito. Solo pagas si decides continuar con la reparación.",
    },
    {
      question: "¿Qué garantía ofrecen?",
      answer:
        "Ofrezco garantía de 6 meses en todas las reparaciones, cubriendo tanto mano de obra como repuestos.",
    },
    {
      question: "¿Trabajan con todas las marcas?",
      answer:
        "Sí, trabajo con todas las marcas: LG, Samsung, Whirlpool, Electrolux, Haceb, Mabe, y muchas más.",
    },
    {
      question: "¿Cuánto tiempo toma una reparación?",
      answer:
        "La mayoría de reparaciones se completan el mismo día. En casos complejos que requieren repuestos especiales, puede tomar 2-3 días.",
    },
  ],
};

export default function ServiceDetailPage() {
  // const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // En el futuro, aquí cargaríamos el servicio real basado en params.id
  const service = MOCK_SERVICE_DETAIL;

  const handleContactProvider = () => {
    // Aquí implementaríamos la lógica para contactar al proveedor
    console.log("Contactar proveedor");
  };

  const handleBookService = () => {
    // Aquí implementaríamos la lógica para reservar el servicio
    console.log("Reservar servicio");
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
            </Link>
            <span>/</span>
            <span>{service.category}</span>
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
            </Button>

            {/* Service Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary">{service.category}</Badge>
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
                  <span className="font-medium">{service.rating}</span>
                  <span className="text-foreground/60">
                    ({service.reviewCount} reseñas)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{service.completedJobs} trabajos completados</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <Clock className="h-4 w-4" />
                  <span>Responde en {service.responseTime}</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <MapPin className="h-4 w-4" />
                  <span>{service.location}</span>
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
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
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
                      {service.longDescription
                        .split("\n")
                        .map((paragraph, index) => (
                          <p key={index} className="mb-4 text-foreground/80">
                            {paragraph.trim()}
                          </p>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>¿Qué incluye este servicio?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Service Area */}
                <Card>
                  <CardHeader>
                    <CardTitle>Área de Cobertura</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {service.serviceArea.map((area, index) => (
                        <Badge key={index} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* Reviews Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Reseñas de Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {service.rating}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(service.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-foreground/60 mt-1">
                          {service.reviewCount} reseñas
                        </div>
                      </div>
                      <div className="flex-1">
                        {/* Rating Distribution would go here */}
                        <div className="text-sm text-foreground/60">
                          Basado en {service.reviewCount} reseñas verificadas
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Individual Reviews */}
                    <div className="space-y-6">
                      {service.reviews.map((review) => (
                        <div key={review.id} className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.avatar} />
                              <AvatarFallback>
                                {review.user
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {review.user}
                                </span>
                                {review.verified && (
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verificado
                                  </Badge>
                                )}
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
                                  {new Date(review.date).toLocaleDateString(
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
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Galería de Trabajos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.gallery.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-video bg-muted rounded-lg flex items-center justify-center"
                        >
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="sr-only">Imagen {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preguntas Frecuentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {service.faqs.map((faq, index) => (
                        <div key={index}>
                          <h4 className="font-medium mb-2">{faq.question}</h4>
                          <p className="text-sm text-foreground/70">
                            {faq.answer}
                          </p>
                          {index < service.faqs.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  {service.price}
                </CardTitle>
                <div className="space-y-1 text-sm text-foreground/60">
                  <div>Diagnóstico: {service.priceDetails.diagnosis}</div>
                  <div>Servicio mínimo: {service.priceDetails.minService}</div>
                  <div>Por hora: {service.priceDetails.hourlyRate}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleBookService}
                  className="w-full"
                  size="lg"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Reservar Servicio
                </Button>
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
            </Card>

            {/* Provider Card */}
            <Card>
              <CardHeader>
                <CardTitle>Acerca del Profesional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={service.provider.image} />
                    <AvatarFallback>
                      {service.provider.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {service.provider.name}
                      </span>
                      {service.provider.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-foreground/60">
                      Miembro desde {service.provider.memberSince}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-foreground/70">
                  {service.provider.bio}
                </p>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Especialidades:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {service.provider.specialties.map((specialty, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-foreground/60" />
                    <span>{service.availability}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-foreground/60" />
                    <span>Cubre: {service.serviceArea.join(", ")}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/professionals/${service.provider.id}`}>
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
