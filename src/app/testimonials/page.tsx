"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Star,
  Quote,
  Heart,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useFeaturedTestimonials, usePlatformStats } from "@/shared/hooks/useReviews";

export default function TestimonialsPage() {
  // Fetch real testimonials and platform stats
  const { 
    data: testimonials, 
    isLoading: testimonialsLoading, 
    error: testimonialsError 
  } = useFeaturedTestimonials(12);
  
  const { 
    data: platformStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = usePlatformStats();

  // Generate stats from real data
  const stats = platformStats ? [
    {
      number: `$${Math.round(platformStats.totalSavings / 1000000 * 10) / 10}M+`,
      label: "Ahorrados en comisiones",
      description: "Dinero que se quedó en los bolsillos de nuestros profesionales",
      icon: DollarSign,
    },
    {
      number: `${platformStats.activeUsers.toLocaleString()}+`,
      label: "Usuarios activos",
      description: "Profesionales y clientes que confían en nuestro modelo gratuito",
      icon: Users,
    },
    {
      number: `${platformStats.satisfactionRate}%`,
      label: "Satisfacción",
      description: "De usuarios que recomiendan nuestro modelo sin comisiones",
      icon: Heart,
    },
    {
      number: "0",
      label: "Costos ocultos",
      description: "Transparencia total en todos nuestros servicios",
      icon: CheckCircle,
    },
  ] : [];

  // Filter testimonials by category
  const professionalTestimonials = testimonials?.filter((t) => t.category === "professional") || [];
  const clientTestimonials = testimonials?.filter((t) => t.category === "client") || [];

  if (testimonialsError || statsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Error al cargar testimonios</h2>
          <p className="text-foreground/60 mb-4">
            No pudimos cargar los testimonios. Por favor, intenta nuevamente.
          </p>
          <Button onClick={() => window.location.reload()}>
            Intentar nuevamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <nav className="flex items-center space-x-6">
              <Link
                href="/about"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Acerca de
              </Link>
              <Link
                href="/benefits"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Beneficios
              </Link>
              <Link
                href="/faq"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <Quote className="mr-2 h-4 w-4" />
            Testimonios Reales
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Lo que dicen sobre nuestro{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              modelo gratuito
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
            Escucha las experiencias reales de profesionales y clientes que han
            descubierto las ventajas de una plataforma verdaderamente gratuita.
          </p>
        </div>        {/* Impact Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-8 mx-auto mb-3" />
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-1" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="font-semibold mb-1">{stat.label}</div>
                  <p className="text-sm text-foreground/60">{stat.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>        {/* Featured Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Testimonios Destacados
          </h2>
          {testimonialsLoading ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-3 w-48 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-8 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {testimonials?.slice(0, 2).map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="border-primary/30 bg-gradient-to-br from-primary/5 to-background"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <Badge
                            variant="default"
                            className="text-xs"
                          >
                            {testimonial.isVerified ? 'Verificado' : 'Cliente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/60">
                          {testimonial.role}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-foreground/80 italic mb-4">
                      &ldquo;{testimonial.comment}&rdquo;
                    </blockquote>
                    <div className="bg-primary/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Servicio: {testimonial.serviceTitle}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>        {/* Professional Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2">
            Para Profesionales
          </h2>
          <p className="text-center text-foreground/60 mb-8 max-w-2xl mx-auto">
            Descubre cómo nuestro modelo sin comisiones está transformando la
            vida de los profesionales
          </p>
          {testimonialsLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-12 w-full mb-3" />
                    <Skeleton className="h-6 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {professionalTestimonials.slice(0, 3).map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-foreground/60">
                          {testimonial.role}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-sm text-foreground/80 italic mb-3">
                      &quot;{testimonial.comment}&quot;
                    </blockquote>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-xs">
                        <DollarSign className="h-3 w-3" />
                        Servicio: {testimonial.serviceTitle}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>        {/* Client Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2">Para Clientes</h2>
          <p className="text-center text-foreground/60 mb-8 max-w-2xl mx-auto">
            Conoce la experiencia de quienes han encontrado profesionales sin
            costos adicionales
          </p>
          {testimonialsLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-12 w-full mb-3" />
                    <Skeleton className="h-6 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {clientTestimonials.slice(0, 3).map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-foreground/60">
                          {testimonial.role}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-sm text-foreground/80 italic mb-3">
                      &quot;{testimonial.comment}&quot;
                    </blockquote>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Servicio: {testimonial.serviceTitle}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para unirte a nuestra comunidad?
              </h2>
              <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
                Únete a miles de profesionales y clientes que ya disfrutan de
                una plataforma verdaderamente gratuita.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    <Users className="mr-2 h-5 w-5" />
                    Comenzar Gratis
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/services">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Explorar Servicios
                  </Link>
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-primary/20">
                <div className="flex items-center justify-center gap-8 text-sm text-foreground/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Sin registro de tarjeta
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Acceso inmediato
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Siempre gratuito
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
