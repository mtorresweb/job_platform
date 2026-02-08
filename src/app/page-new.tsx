"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { usePlatformStats } from "@/shared/hooks/useReviews";
import {
  Search,
  Star,
  Clock,
  Shield,
  Users,
  ArrowRight,
  MessageSquare,
  Calendar,
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated } = useUserRole();
  
  // Fetch real platform statistics
  const { 
    data: platformStats, 
    isLoading: statsLoading, 
    error: statsError 
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
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  SP
                </span>
              </div>
              <span className="font-bold text-xl">Red Profesional</span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/services"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Servicios
              </Link>
              <Link
                href="/professionals"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Profesionales
              </Link>
              <Link
                href="/how-it-works"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Cómo funciona
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-foreground/60">
                    Hola, {user?.name}
                  </span>
                  <Button asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Iniciar Sesión</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register">Registrarse</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge variant="secondary" className="mb-4">
              🚀 Plataforma #1 en servicios profesionales
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Conectamos <span className="text-primary">profesionales</span> con{" "}
              <span className="text-primary">clientes</span>
            </h1>

            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Encuentra los mejores servicios profesionales o promociona tus
              habilidades. Una plataforma segura, confiable y fácil de usar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8" asChild>
                <Link href="/services">
                  <Search className="mr-2 h-5 w-5" />
                  Buscar Servicios
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8" asChild>
                <Link href="/auth/register">
                  Únete como Profesional
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Por qué elegir Red Profesional?
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Ofrecemos una experiencia completa para profesionales y clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover-lift">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Pagos Seguros</CardTitle>
                <CardDescription>
                  Sistema de pagos protegido con garantía de satisfacción
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Profesionales Verificados</CardTitle>
                <CardDescription>
                  Todos nuestros profesionales están verificados y calificados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Chat en Tiempo Real</CardTitle>
                <CardDescription>
                  Comunícate directamente con profesionales al instante
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Reservas Flexibles</CardTitle>
                <CardDescription>
                  Agenda servicios cuando más te convenga
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Respuesta Rápida</CardTitle>
                <CardDescription>
                  Los profesionales responden en promedio en menos de 2 horas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Comunidad Activa</CardTitle>
                <CardDescription>
                  Miles de profesionales y clientes satisfechos
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container-custom">
          {statsError ? (
            <div className="text-center text-foreground/60">
              <p>No se pudieron cargar las estadísticas</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-8 text-center">              <div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {statsLoading ? (
                    <Skeleton className="h-10 w-20 mx-auto" />
                  ) : (
                    formatMetric(platformStats?.completedBookings)
                  )}
                </div>
                <div className="text-foreground/60">Servicios Completados</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {statsLoading ? (
                    <Skeleton className="h-10 w-20 mx-auto" />
                  ) : (
                    formatMetric(platformStats?.totalProfessionals)
                  )}
                </div>
                <div className="text-foreground/60">Profesionales Activos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {statsLoading ? (
                    <Skeleton className="h-10 w-16 mx-auto" />
                  ) : platformStats?.satisfactionRate ? (
                    `${platformStats.satisfactionRate}%`
                  ) : (
                    <Skeleton className="h-10 w-16 mx-auto" />
                  )}
                </div>
                <div className="text-foreground/60">Satisfacción del Cliente</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-foreground/60">Soporte al Cliente</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="container-custom text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Únete a miles de profesionales y clientes que ya confían en
              nuestra plataforma
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/register">Crear Cuenta Gratis</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/services">Explorar Servicios</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12 px-4">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    RP
                  </span>
                </div>
                <span className="font-bold text-xl">Red Profesional</span>
              </div>
              <p className="text-foreground/60 text-sm">
                La plataforma líder en servicios profesionales en Aguachica.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Para Clientes</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link
                    href="/services"
                    className="hover:text-foreground transition-colors"
                  >
                    Buscar Servicios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="hover:text-foreground transition-colors"
                  >
                    Cómo Funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="/safety"
                    className="hover:text-foreground transition-colors"
                  >
                    Seguridad
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Para Profesionales</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link
                    href="/become-pro"
                    className="hover:text-foreground transition-colors"
                  >
                    Ser Profesional
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Precios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/success-stories"
                    className="hover:text-foreground transition-colors"
                  >
                    Casos de Éxito
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-foreground/60">
            <p>&copy; 2024 Red Profesional. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
