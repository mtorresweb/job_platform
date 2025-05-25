"use client";

import { useUserRole } from "@/infrastructure/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Bell,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { user, isAuthenticated, isProfessional } = useUserRole();

  if (!isAuthenticated) {
    redirect("/auth/login");
  }

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "US";
  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido de vuelta, {user?.name}!
            </h1>
            <p className="text-foreground/60 mb-4">
              {isProfessional
                ? "Administra tus servicios y conecta con nuevos clientes"
                : "Encuentra los mejores servicios profesionales para tus necesidades"}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={isProfessional ? "default" : "secondary"}>
                {isProfessional ? "Profesional" : "Cliente"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Free Platform Highlight */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary"
                    >
                      100% Gratuito
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    {isProfessional
                      ? "Conecta con clientes sin comisiones"
                      : "Encuentra profesionales sin costo"}
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    {isProfessional
                      ? "Mantén el 100% de tus ganancias. Sin tarifas ocultas, sin comisiones."
                      : "Accede a miles de profesionales verificados completamente gratis."}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">0%</div>
                    <div className="text-xs text-foreground/60">Comisión</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">∞</div>
                    <div className="text-xs text-foreground/60">Ilimitado</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isProfessional ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Reservas Activas
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 desde ayer</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingresos Mensuales
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,340,000</div>
                  <p className="text-xs text-muted-foreground">
                    +15% desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Calificación
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">
                    Basado en 24 reseñas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clientes Nuevos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    +3 esta semana
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Reservas Activas
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Próximas citas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Servicios Completados
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15</div>
                  <p className="text-xs text-muted-foreground">En total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Gastos del Mes
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$850,000</div>
                  <p className="text-xs text-muted-foreground">En servicios</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Profesionales Favoritos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">Guardados</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                {isProfessional
                  ? "Gestiona tu negocio de manera eficiente"
                  : "Encuentra y reserva servicios fácilmente"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProfessional ? (
                <>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Agenda del Día
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Crear Nuevo Servicio
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Mensajes Pendientes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    asChild
                  >
                    <Link href="/services">
                      <Calendar className="mr-2 h-4 w-4" />
                      Buscar Servicios
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Star className="mr-2 h-4 w-4" />
                    Mis Reservas
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Mis Conversaciones
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas actualizaciones en tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Nueva reserva confirmada
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace 2 horas
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mensaje recibido</p>
                    <p className="text-xs text-muted-foreground">
                      Hace 4 horas
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pago procesado</p>
                    <p className="text-xs text-muted-foreground">Hace 1 día</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started (for new users) */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isProfessional ? "Optimiza tu Perfil" : "Comienza tu Búsqueda"}
            </CardTitle>
            <CardDescription>
              {isProfessional
                ? "Completa tu perfil para atraer más clientes"
                : "Sigue estos pasos para encontrar el servicio perfecto"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isProfessional ? (
                <>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="font-medium mb-1">Completa tu Perfil</div>
                    <div className="text-xs text-muted-foreground">
                      Agrega tu experiencia y especialidades
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="font-medium mb-1">
                      Configura tus Servicios
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Define precios y disponibilidad
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="font-medium mb-1">Verifica tu Cuenta</div>
                    <div className="text-xs text-muted-foreground">
                      Aumenta la confianza de los clientes
                    </div>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    asChild
                  >
                    <Link href="/services">
                      <div className="font-medium mb-1">Explora Servicios</div>
                      <div className="text-xs text-muted-foreground">
                        Descubre profesionales cerca de ti
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="font-medium mb-1">Lee Reseñas</div>
                    <div className="text-xs text-muted-foreground">
                      Conoce la experiencia de otros clientes
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="font-medium mb-1">
                      Haz tu Primera Reserva
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Conecta con un profesional
                    </div>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
