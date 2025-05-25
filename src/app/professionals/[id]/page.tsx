"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Phone,
  Mail,
  Award,
  Users,
  Camera,
  FileText,
  Briefcase,
  Globe,
  Languages,
  GraduationCap,
} from "lucide-react";

// Mock data - en el futuro vendrá de la API
const MOCK_PROFESSIONALS = [
  {
    id: 1,
    name: "Carlos Méndez",
    title: "Técnico en Electrodomésticos",
    specialties: ["Electrodomésticos", "Refrigeración", "Línea Blanca"],
    description:
      "Técnico especializado en reparación de electrodomésticos con certificación internacional.",
    longDescription: `
      Soy Carlos Méndez, técnico especializado en reparación de electrodomésticos con más de 10 años de experiencia en el sector. 
      Mi pasión por la tecnología y la satisfacción del cliente me han llevado a especializarme en las marcas más reconocidas del mercado.

      **Mi experiencia incluye:**
      - Certificación técnica en refrigeración industrial
      - Especialización en línea blanca (lavadoras, neveras, estufas)
      - Manejo de repuestos originales y alternativos
      - Diagnóstico avanzado con herramientas especializadas
      - Atención personalizada y garantía extendida

      **¿Por qué elegirme?**
      - Más de 350 reparaciones exitosas
      - Garantía de 6 meses en todas las reparaciones
      - Servicio a domicilio sin costo adicional
      - Repuestos originales garantizados
      - Disponibilidad 7 días a la semana
      - Presupuesto gratuito y sin compromiso

      Mi objetivo es brindar un servicio de calidad que supere las expectativas de mis clientes, 
      manteniendo la transparencia en precios y procesos.
    `,
    image: "/avatars/carlos.jpg",
    rating: 4.8,
    reviewCount: 124,
    completedJobs: 350,
    responseTime: "2 horas",
    memberSince: "2020",
    location: "Bogotá, Colombia",
    serviceArea: ["Bogotá", "Soacha", "Chía", "Zipaquirá"],
    availability: "Lunes a Domingo, 7:00 AM - 8:00 PM",
    verified: true,
    languages: ["Español"],
    hourlyRate: "$25.000/hora",
    emergencyRate: "$35.000/hora",
    phone: "+57 300 123 4567",
    email: "carlos.mendez@servicespro.com",
    services: [
      {
        id: 1,
        title: "Reparación de Electrodomésticos",
        price: "Desde $50.000",
        category: "Hogar",
        description: "Servicio profesional de reparación de electrodomésticos",
      },
      {
        id: 2,
        title: "Mantenimiento Preventivo",
        price: "Desde $35.000",
        category: "Hogar",
        description: "Mantenimiento preventivo para electrodomésticos",
      },
    ],
    certifications: [
      "Certificación Técnica en Refrigeración",
      "Curso Avanzado de Diagnóstico Electrónico",
      "Certificación en Línea Blanca - LG",
      "Curso de Seguridad Industrial",
    ],
    education: [
      {
        institution: "SENA",
        degree: "Técnico en Mantenimiento de Electrodomésticos",
        year: "2019",
      },
      {
        institution: "Instituto Técnico Industrial",
        degree: "Tecnólogo en Electrónica",
        year: "2015",
      },
    ],
    portfolio: [
      "/portfolio/carlos-1.jpg",
      "/portfolio/carlos-2.jpg",
      "/portfolio/carlos-3.jpg",
      "/portfolio/carlos-4.jpg",
    ],
    reviews: [
      {
        id: 1,
        user: "María González",
        avatar: "/avatars/maria.jpg",
        rating: 5,
        date: "2024-01-15",
        comment:
          "Excelente profesional. Carlos llegó puntual, diagnosticó el problema de mi lavadora rápidamente y la reparó el mismo día. Muy profesional y honesto con los precios.",
        verified: true,
        service: "Reparación de Electrodomésticos",
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
        service: "Reparación de Electrodomésticos",
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
        service: "Reparación de Electrodomésticos",
      },
      {
        id: 4,
        user: "Luis Herrera",
        avatar: "/avatars/luis.jpg",
        rating: 5,
        date: "2023-12-28",
        comment:
          "Carlos es muy conocedor de su trabajo. Diagnosticó y reparó mi microondas en menos de una hora. Definitivamente lo recomiendo.",
        verified: true,
        service: "Reparación de Electrodomésticos",
      },
    ],
  },
];

export default function ProfessionalProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // En el futuro, aquí cargaríamos el profesional real basado en params.id
  const professional =
    MOCK_PROFESSIONALS.find((p) => p.id === parseInt(params.id as string)) ||
    MOCK_PROFESSIONALS[0];

  const handleContactProfessional = () => {
    console.log("Contactar profesional");
  };

  const handleHireProfessional = () => {
    console.log("Contratar profesional");
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
            <Link href="/professionals" className="hover:text-primary">
              Profesionales
            </Link>
            <span>/</span>
            <span className="text-foreground">{professional.name}</span>
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
                  <AvatarImage src={professional.image} />
                  <AvatarFallback className="text-2xl">
                    {professional.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl md:text-4xl font-bold">
                        {professional.name}
                      </h1>
                      {professional.verified && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    <p className="text-xl text-foreground/70">
                      {professional.title}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {professional.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-foreground/80">
                    {professional.description}
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
                  <span>{professional.completedJobs} trabajos completados</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <Clock className="h-4 w-4" />
                  <span>Responde en {professional.responseTime}</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <Users className="h-4 w-4" />
                  <span>Miembro desde {professional.memberSince}</span>
                </div>
                <div className="flex items-center gap-1 text-foreground/60">
                  <MapPin className="h-4 w-4" />
                  <span>{professional.location}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Perfil</TabsTrigger>
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                <TabsTrigger value="portfolio">Portafolio</TabsTrigger>
                <TabsTrigger value="credentials">Credenciales</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Acerca de {professional.name.split(" ")[0]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {professional.longDescription
                        .split("\n")
                        .map((paragraph, index) => (
                          <p key={index} className="mb-4 text-foreground/80">
                            {paragraph.trim()}
                          </p>
                        ))}
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
                        <Phone className="h-4 w-4 text-foreground/60" />
                        <span>{professional.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-foreground/60" />
                        <span>{professional.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Languages className="h-4 w-4 text-foreground/60" />
                        <span>{professional.languages.join(", ")}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Availability */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Disponibilidad</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-foreground/60" />
                        <span>{professional.availability}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-foreground/60" />
                        <span>
                          Cubre: {professional.serviceArea.join(", ")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Servicios Ofrecidos</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                                  {service.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-foreground/70">
                                {service.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-primary">
                                {service.price}
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
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tarifas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tarifa por hora:</span>
                          <span className="font-medium">
                            {professional.hourlyRate}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tarifa de emergencia:</span>
                          <span className="font-medium">
                            {professional.emergencyRate}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-foreground/60">
                        Las tarifas pueden variar según la complejidad del
                        trabajo. El diagnóstico inicial es gratuito.
                      </div>
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
                          verificadas
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Individual Reviews */}
                    <div className="space-y-6">
                      {professional.reviews.map((review) => (
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
                                <Badge variant="outline" className="text-xs">
                                  {review.service}
                                </Badge>
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

              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Portafolio de Trabajos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {professional.portfolio.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-video bg-muted rounded-lg flex items-center justify-center"
                        >
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="sr-only">Trabajo {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="credentials" className="space-y-6">
                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certificaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {professional.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Educación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {professional.education.map((edu, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-primary/20 pl-4"
                        >
                          <div className="font-medium">{edu.degree}</div>
                          <div className="text-sm text-foreground/70">
                            {edu.institution}
                          </div>
                          <div className="text-xs text-foreground/60">
                            {edu.year}
                          </div>
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
            {/* Quick Contact Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Contactar Profesional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {professional.hourlyRate}
                  </div>
                  <div className="text-sm text-foreground/60">
                    Tarifa por hora
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
                    <span>Profesional verificado</span>
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
                      {professional.completedJobs}
                    </div>
                    <div className="text-xs text-foreground/60">Trabajos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {professional.rating}
                    </div>
                    <div className="text-xs text-foreground/60">Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {professional.responseTime}
                    </div>
                    <div className="text-xs text-foreground/60">Respuesta</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {new Date().getFullYear() -
                        parseInt(professional.memberSince)}
                    </div>
                    <div className="text-xs text-foreground/60">Años</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Area */}
            <Card>
              <CardHeader>
                <CardTitle>Área de Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-foreground/60" />
                    <span className="font-medium">Ubicación principal:</span>
                  </div>
                  <div className="text-sm text-foreground/70 ml-6">
                    {professional.location}
                  </div>

                  <div className="flex items-center gap-2 text-sm mt-4">
                    <Globe className="h-4 w-4 text-foreground/60" />
                    <span className="font-medium">Áreas de cobertura:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6">
                    {professional.serviceArea.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
