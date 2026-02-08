"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Star,
  Clock,
  Shield,
  Users,
  ArrowRight,
  MessageSquare,
  Calendar,
  CheckCircle,
  Award,
  Zap,
  ChevronRight,
  Wrench,
  Car,
  Camera,
  Monitor,
} from "lucide-react";
import { usePlatformStats } from "@/shared/hooks/useReviews";

export default function HomePage() {
  // Fetch real platform statistics
  const {
    data: platformStats,
    isLoading: statsLoading,
    error: statsError,
  } = usePlatformStats();

  const formatMetric = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "0";
    if (value >= 1_000_000) {
      const scaled = value / 1_000_000;
      return `${scaled >= 10 ? Math.round(scaled) : scaled.toFixed(1)}M+`;
    }
    if (value >= 1_000) {
      const scaled = value / 1_000;
      return `${scaled >= 10 ? Math.round(scaled) : scaled.toFixed(1)}K+`;
    }
    return value.toLocaleString("es-CO");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium"
            >
              <Zap className="mr-2 h-4 w-4" />
              🚀 Plataforma #1 en servicios profesionales
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Conecta con{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                profesionales
              </span>{" "}
              expertos
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              La plataforma más confiable para encontrar servicios profesionales
              de calidad. Conectamos clientes con expertos verificados en toda
              Colombia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                className="px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href="/services">
                  <Search className="mr-2 h-5 w-5" />
                  Buscar Servicios
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg font-medium border-2 hover:bg-primary/5"
                asChild
              >
                <Link href="/auth/register">
                  Únete como Profesional
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>{" "}
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100% Gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Conexión directa</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Calidad garantizada</span>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          {statsError ? (
            <div className="text-center text-foreground/60">
              <p>No se pudieron cargar las estadísticas</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-primary">
                  {statsLoading ? (
                    <Skeleton className="h-12 w-24 mx-auto" />
                  ) : (
                    formatMetric(platformStats?.completedBookings)
                  )}
                </div>
                <div className="text-foreground/60 font-medium">
                  Servicios Completados
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-primary">
                  {statsLoading ? (
                    <Skeleton className="h-12 w-20 mx-auto" />
                  ) : (
                    formatMetric(platformStats?.totalProfessionals)
                  )}
                </div>
                <div className="text-foreground/60 font-medium">
                  Profesionales Activos
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-primary">
                  {statsLoading ? (
                    <Skeleton className="h-12 w-16 mx-auto" />
                  ) : typeof platformStats?.satisfactionRate === "number" ? (
                    `${platformStats.satisfactionRate}%`
                  ) : (
                    <Skeleton className="h-12 w-16 mx-auto" />
                  )}
                </div>
                <div className="text-foreground/60 font-medium">
                  Satisfacción del Cliente
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-primary">
                  24/7
                </div>
                <div className="text-foreground/60 font-medium">
                  Soporte Disponible
                </div>
              </div>
            </div>
          )}
        </div>
      </section>{" "}
      {/* Popular Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Servicios Más Solicitados
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Descubre los servicios profesionales más populares en nuestra
              plataforma
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Monitor className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Tecnología</h3>
                <p className="text-sm text-foreground/60">
                  Desarrollo, diseño, soporte
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Car className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Automotive</h3>
                <p className="text-sm text-foreground/60">
                  Mecánica, detailing, transporte
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="font-semibold mb-2">Eventos</h3>
                <p className="text-sm text-foreground/60">
                  Fotografía, video, organización
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Wrench className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Reparaciones</h3>
                <p className="text-sm text-foreground/60">
                  Electrodomésticos, mobiliario
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link href="/services">
                Ver Todos los Servicios
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Award className="mr-2 h-4 w-4" />
              Características Premium
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Por qué elegir Red Profesional?
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Ofrecemos una experiencia completa y segura para profesionales y
              clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {" "}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Conexión Directa</CardTitle>
                <CardDescription className="text-base">
                  Conecta directamente con profesionales sin intermediarios.
                  100% gratuito para todos.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">
                  Profesionales Verificados
                </CardTitle>
                <CardDescription className="text-base">
                  Todos nuestros profesionales pasan por un riguroso proceso de
                  verificación
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Chat en Tiempo Real</CardTitle>
                <CardDescription className="text-base">
                  Comunícate directamente con profesionales al instante y sin
                  complicaciones
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Reservas Flexibles</CardTitle>
                <CardDescription className="text-base">
                  Agenda servicios cuando más te convenga, con horarios
                  adaptados a ti
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Respuesta Rápida</CardTitle>
                <CardDescription className="text-base">
                  Los profesionales responden en promedio en menos de 2 horas
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Comunidad Activa</CardTitle>
                <CardDescription className="text-base">
                  Miles de profesionales y clientes satisfechos forman nuestra
                  comunidad
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cómo Funciona
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              En solo 3 pasos simples puedes conectar con el profesional ideal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="relative">
                <div className="h-20 w-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">
                    1
                  </span>
                </div>
                {/* Connection line */}
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Describe tu Necesidad
              </h3>
              <p className="text-foreground/60">
                Cuéntanos qué servicio necesitas y en qué ubicación. Será rápido
                y fácil.
              </p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="h-20 w-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">
                    2
                  </span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Recibe Propuestas</h3>
              <p className="text-foreground/60">
                Los profesionales verificados te enviarán propuestas
                personalizadas con precios.
              </p>
            </div>

            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-primary-foreground">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Elige y Contrata</h3>
              <p className="text-foreground/60">
                Compara perfiles, lee reseñas y contrata al profesional que más
                te convenga.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lo que Dicen Nuestros Usuarios
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Miles de clientes y profesionales confían en nosotros cada día
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/maria.jpg" />
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">María Contreras</h4>
                    <p className="text-sm text-foreground/60">Cliente</p>
                  </div>
                </div>
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </CardHeader>{" "}
              <CardContent>
                <p className="text-foreground/80">
                  &ldquo;Encontré un electricista excelente en menos de 2 horas.
                  El proceso fue súper fácil y el trabajo quedó perfecto.&rdquo;
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/carlos.jpg" />
                    <AvatarFallback>CM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">Carlos Mendoza</h4>
                    <p className="text-sm text-foreground/60">Profesional</p>
                  </div>
                </div>
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </CardHeader>{" "}
              <CardContent>
                <p className="text-foreground/80">
                  &ldquo;Como plomero, he conseguido más clientes en 3 meses que
                  en todo el año anterior. La plataforma es increíble.&rdquo;
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/ana.jpg" />
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">Ana López</h4>
                    <p className="text-sm text-foreground/60">Cliente</p>
                  </div>
                </div>
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </CardHeader>{" "}
              <CardContent>
                <p className="text-foreground/80">
                  &ldquo;La garantía de satisfacción me da mucha confianza.
                  Siempre encuentro profesionales de calidad.&rdquo;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>{" "}
      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-background">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-200/40 [mask-image:linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.7))]"></div>
        <div className="absolute top-6 left-1/5 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/5 w-64 h-64 bg-accent/15 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            {" "}
            <Badge
              variant="secondary"
              className="bg-secondary text-foreground border border-border shadow-sm"
            >
              <Zap className="mr-2 h-4 w-4" />
              Únete a la Revolución
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              ¿Listo para{" "}
              <span className="">
                comenzar?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              Únete a miles de profesionales y clientes que ya confían en
              nuestra plataforma
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Button
                size="lg"
                variant="default"
                className="px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link href="/auth/register">
                  <Users className="mr-2 h-5 w-5" />
                  Crear Cuenta Gratis
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-medium border-2 border-border text-foreground hover:bg-primary/5 transition-all duration-300"
                asChild
              >
                <Link href="/services">
                  <Search className="mr-2 h-5 w-5" />
                  Explorar Servicios
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-md mx-auto">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-white/80 mx-auto mb-2" />
                <p className="text-sm text-white/70">Registro gratuito</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-white/80 mx-auto mb-2" />
                <p className="text-sm text-white/70">100% seguro</p>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 text-white/80 mx-auto mb-2" />
                <p className="text-sm text-white/70">Sin comisiones</p>
              </div>
            </div>
          </div>
        </div>
      </section>{" "}
      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4">
          {/* Main footer content */}
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Company info */}
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-lg">
                      SP
                    </span>
                  </div>
                  <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Red Profesional
                  </span>
                </div>
                <p className="text-foreground/70 mb-6 max-w-sm">
                  La plataforma líder en servicios profesionales en Colombia.
                  Conectamos talento con oportunidades.
                </p>
              </div>

              {/* Navega */}
              <div>
                <h3 className="font-semibold text-lg mb-6 text-foreground">Explora</h3>
                <ul className="space-y-3 text-foreground/70">
                  <li>
                    <Link
                      href="/services"
                      className="hover:text-primary transition-colors flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Buscar Servicios
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/how-it-works"
                      className="hover:text-primary transition-colors flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Cómo Funciona
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq"
                      className="hover:text-primary transition-colors flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-primary transition-colors flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Acerca de
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Profesionales y Legal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-6 text-foreground">Profesionales</h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li>
                      <Link
                        href="/auth/register"
                        className="hover:text-primary transition-colors flex items-center"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Sé Profesional
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/professionals"
                        className="hover:text-primary transition-colors flex items-center"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Ver Profesionales
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-6 text-foreground">Legal</h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li>
                      <Link
                        href="/legal/privacy"
                        className="hover:text-primary transition-colors flex items-center"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Privacidad
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/legal/terms"
                        className="hover:text-primary transition-colors flex items-center"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Términos
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/legal/cookies"
                        className="hover:text-primary transition-colors flex items-center"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Cookies
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom footer */}
          <div className="border-t py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/60">
              <p>&copy; 2024 Red Profesional. Todos los derechos reservados.</p>
              <p className="text-foreground/50">Construyendo confianza y acceso libre a talento.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
