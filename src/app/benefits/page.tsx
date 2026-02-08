"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Star,
  Shield,
  Users,
  MessageSquare,
  Calendar,
  Search,
  Award,
  Heart,
  Zap,
  Target,
  ArrowRight,
  Gift,
} from "lucide-react";

export default function BenefitsPage() {
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
              <Gift className="mr-2 h-4 w-4" />
              Todos los beneficios, $0 de costo
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Beneficios{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                100% gratuitos
              </span>{" "}
              para todos
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Disfruta de todas las funcionalidades premium de Red Profesional sin
              pagar ni un peso. Sin pruebas gratuitas, sin restricciones, sin
              sorpresas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                className="px-8 py-3 text-lg font-medium"
                asChild
              >
                <Link href="/auth/register">
                  <Users className="mr-2 h-5 w-5" />
                  Comenzar Gratis
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg font-medium"
                asChild
              >
                <Link href="/services">
                  Explorar Servicios
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Beneficios Principales
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Todo lo que necesitas para conectar con profesionales de calidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">0% Comisiones</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-foreground/70 mb-4">
                  Los profesionales reciben el 100% de sus ingresos. Sin tarifas
                  ocultas ni comisiones.
                </p>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Ahorro total para profesionales
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Verificación Completa</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-foreground/70 mb-4">
                  Sistema completo de verificación de profesionales sin costo
                  adicional.
                </p>
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                >
                  Seguridad garantizada
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Chat Ilimitado</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-foreground/70 mb-4">
                  Comunícate directamente con profesionales sin límites ni
                  restricciones.
                </p>
                <Badge
                  variant="outline"
                  className="text-purple-600 border-purple-600"
                >
                  Comunicación libre
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Búsqueda Avanzada</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-foreground/70 mb-4">
                  Filtros avanzados, geolocalización y búsqueda inteligente
                  completamente gratis.
                </p>
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-600"
                >
                  Encuentra lo que buscas
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Reservas Flexibles</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-foreground/70 mb-4">
                  Sistema completo de reservas y gestión de citas sin costos
                  adicionales.
                </p>
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-600"
                >
                  Organiza tu tiempo
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Reseñas y Ratings</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-foreground/70 mb-4">
                  Sistema completo de reseñas y calificaciones para mantener la
                  calidad.
                </p>
                <Badge
                  variant="outline"
                  className="text-teal-600 border-teal-600"
                >
                  Transparencia total
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Professionals */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Para Profesionales
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Todas las herramientas que necesitas para hacer crecer tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Perfil Profesional Completo
                    </h3>
                    <ul className="text-foreground/70 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Galería de trabajos ilimitada</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Descripción detallada de servicios</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Certificaciones y especialidades</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Horarios de disponibilidad</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Alcance y Visibilidad
                    </h3>
                    <ul className="text-foreground/70 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Aparece en búsquedas relevantes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Notificaciones de nuevos clientes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Estadísticas de visualizaciones</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Posicionamiento basado en calidad</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Gestión de Clientes
                    </h3>
                    <ul className="text-foreground/70 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Dashboard completo de proyectos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Historial de servicios</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Sistema de seguimiento</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Gestión de disponibilidad</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Crecimiento Profesional
                    </h3>
                    <ul className="text-foreground/70 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Sistema de insignias y logros</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Análisis de rendimiento</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Recomendaciones personalizadas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Comunidad de profesionales</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Clients */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Para Clientes
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Encuentra y contrata profesionales de forma fácil y segura
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Búsqueda Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Filtros por ubicación, precio y especialidad</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Recomendaciones basadas en tus necesidades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Comparación de profesionales</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Seguridad Total</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Profesionales verificados y certificados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Sistema de reseñas auténticas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Soporte al cliente 24/7</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Experiencia Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Proceso de contratación simplificado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Seguimiento en tiempo real</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Historial completo de servicios</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Red Profesional vs. Otras Plataformas
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Ve por qué somos la mejor opción para profesionales y clientes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="text-left p-6 font-semibold">
                          Característica
                        </th>
                        <th className="text-center p-6 font-semibold text-primary">
                          Red Profesional
                        </th>
                        <th className="text-center p-6 font-semibold text-foreground/60">
                          Otras Plataformas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-6 font-medium">
                          Comisiones para profesionales
                        </td>
                        <td className="text-center p-6">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700"
                          >
                            0%
                          </Badge>
                        </td>
                        <td className="text-center p-6 text-foreground/60">
                          5-20%
                        </td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="p-6 font-medium">Costo de registro</td>
                        <td className="text-center p-6">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700"
                          >
                            Gratis
                          </Badge>
                        </td>
                        <td className="text-center p-6 text-foreground/60">
                          $50-200/mes
                        </td>
                      </tr>
                      <tr>
                        <td className="p-6 font-medium">Chat con clientes</td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        </td>
                        <td className="text-center p-6 text-foreground/60">
                          Limitado
                        </td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="p-6 font-medium">
                          Verificación de profesionales
                        </td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        </td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-6 font-medium">Soporte al cliente</td>
                        <td className="text-center p-6">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700"
                          >
                            24/7
                          </Badge>
                        </td>
                        <td className="text-center p-6 text-foreground/60">
                          Horario limitado
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <Badge
              variant="secondary"
              className="bg-white/10 text-white border-white/20 backdrop-blur-sm"
            >
              <Zap className="mr-2 h-4 w-4" />
              Sin límites, sin costos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Comienza a disfrutar todos los beneficios hoy
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Únete a miles de profesionales y clientes que ya disfrutan de la
              plataforma 100% gratuita
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg font-medium"
                asChild
              >
                <Link href="/auth/register">
                  <Users className="mr-2 h-5 w-5" />
                  Registrarse Gratis
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-medium border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/professionals">
                  <Search className="mr-2 h-5 w-5" />
                  Ver Profesionales
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-md mx-auto">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-white/80 mx-auto mb-2" />
                <p className="text-sm text-white/70">Sin pagos</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-white/80 mx-auto mb-2" />
                <p className="text-sm text-white/70">100% seguro</p>
              </div>
              <div className="text-center">
                <Heart className="h-8 w-8 text-white/80 mx-auto mb-2" />
                <p className="text-sm text-white/70">Para siempre</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
