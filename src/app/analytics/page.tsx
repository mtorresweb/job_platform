"use client";

import { useState } from "react";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { useUserAnalytics, usePlatformAnalytics, useTimeAnalytics, useClientSegmentation } from "@/shared/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Star,
  Clock,
  Target,
  Award,
  Download,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
} from "lucide-react";
import { redirect } from "next/navigation";

export default function AnalyticsPage() {
  const { isAuthenticated, isProfessional } = useUserRole();
  const [timeRange, setTimeRange] = useState("6m");
  const [selectedTab, setSelectedTab] = useState("overview");
  // Fetch analytics data
  const { 
    data: userAnalytics, 
    isLoading: isLoadingUser, 
    error: userError 
  } = useUserAnalytics(timeRange);
  
  const { 
    data: platformAnalytics, 
    isLoading: isLoadingPlatform, 
    error: platformError 
  } = usePlatformAnalytics(timeRange);

  const { 
    data: timeAnalytics, 
    isLoading: isLoadingTime, 
    error: timeError 
  } = useTimeAnalytics(timeRange);

  const { 
    data: clientSegmentation, 
    isLoading: isLoadingSegmentation, 
    error: segmentationError 
  } = useClientSegmentation(timeRange);

  if (!isAuthenticated) {
    redirect("/auth/login");
  }
  // Loading state
  if (isLoadingUser || isLoadingPlatform || isLoadingTime || isLoadingSegmentation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando analytics...</span>
          </div>
        </div>
      </div>
    );
  }
  // Error state
  if (userError || platformError || timeError || segmentationError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error al cargar analytics</h1>            <p className="text-foreground/60">
              {userError?.message || platformError?.message || timeError?.message || segmentationError?.message || 'Error desconocido'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  const earningsData = userAnalytics?.monthlyData || [];
  const servicePerformance = userAnalytics?.isProfessional ? userAnalytics.servicePerformance : [];
  const platformMetrics = platformAnalytics?.metrics || [];
  const timeData = timeAnalytics || [];
  const segmentationData = clientSegmentation || [];

  const StatCard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon: Icon, 
    description 
  }: {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down" | "neutral";
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend === "up" && <ArrowUp className="h-3 w-3 text-green-500 mr-1" />}
          {trend === "down" && <ArrowDown className="h-3 w-3 text-red-500 mr-1" />}
          {trend === "neutral" && <Minus className="h-3 w-3 text-gray-500 mr-1" />}
          <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}>
            {change}
          </span>
          <span className="ml-1">vs mes anterior</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-foreground/60">
              {isProfessional 
                ? "Analiza el rendimiento de tu negocio y optimiza tus servicios"
                : "Insights sobre tu actividad en la plataforma y uso de servicios"
              }
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Mes</SelectItem>
                <SelectItem value="3m">3 Meses</SelectItem>
                <SelectItem value="6m">6 Meses</SelectItem>
                <SelectItem value="1y">1 Año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="platform">Plataforma</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">              {userAnalytics?.isProfessional ? (
                <>
                  <StatCard
                    title="Ingresos Totales"
                    value={`$${userAnalytics.totalEarnings?.toLocaleString() || '0'}`}
                    change={`${userAnalytics.earningsGrowth > 0 ? '+' : ''}${userAnalytics.earningsGrowth?.toFixed(1) || 0}%`}
                    trend={userAnalytics.earningsGrowth > 0 ? "up" : userAnalytics.earningsGrowth < 0 ? "down" : "neutral"}
                    icon={DollarSign}
                    description="Sin comisiones, 100% para ti"
                  />
                  <StatCard
                    title="Reservas del Mes"
                    value={userAnalytics.totalBookings?.toString() || '0'}
                    change={`${userAnalytics.bookingsGrowth > 0 ? '+' : ''}${userAnalytics.bookingsGrowth?.toFixed(1) || 0}%`}
                    trend={userAnalytics.bookingsGrowth > 0 ? "up" : userAnalytics.bookingsGrowth < 0 ? "down" : "neutral"}
                    icon={Calendar}
                  />
                  <StatCard
                    title="Clientes Únicos"
                    value={userAnalytics.uniqueClients?.toString() || '0'}
                    change={`${userAnalytics.clientsGrowth > 0 ? '+' : ''}${userAnalytics.clientsGrowth?.toFixed(1) || 0}%`}
                    trend={userAnalytics.clientsGrowth > 0 ? "up" : userAnalytics.clientsGrowth < 0 ? "down" : "neutral"}
                    icon={Users}
                  />
                  <StatCard
                    title="Calificación"
                    value={userAnalytics.avgRating?.toFixed(1) || '0.0'}
                    change={`${userAnalytics.ratingGrowth > 0 ? '+' : ''}${userAnalytics.ratingGrowth?.toFixed(1) || 0}`}
                    trend={userAnalytics.ratingGrowth > 0 ? "up" : userAnalytics.ratingGrowth < 0 ? "down" : "neutral"}
                    icon={Star}
                  />
                </>
              ) : userAnalytics && !userAnalytics.isProfessional ? (
                <>
                  <StatCard
                    title="Servicios Utilizados"
                    value={userAnalytics.totalBookings?.toString() || '0'}
                    change={`${userAnalytics.bookingsGrowth > 0 ? '+' : ''}${userAnalytics.bookingsGrowth?.toFixed(1) || 0}%`}
                    trend={userAnalytics.bookingsGrowth > 0 ? "up" : userAnalytics.bookingsGrowth < 0 ? "down" : "neutral"}
                    icon={Activity}
                  />                  <StatCard
                    title="Gasto Total"
                    value={`$${userAnalytics.totalSpent?.toLocaleString() || '0'}`}
                    change={`${userAnalytics.spentGrowth > 0 ? '+' : ''}${userAnalytics.spentGrowth?.toFixed(1) || 0}%`}
                    trend={userAnalytics.spentGrowth > 0 ? "up" : userAnalytics.spentGrowth < 0 ? "down" : "neutral"}
                    icon={DollarSign}
                  />
                  <StatCard
                    title="Profesionales Favoritos"
                    value={userAnalytics.favoriteProfessionals?.toString() || '0'}
                    change={`${userAnalytics.favoritesGrowth > 0 ? '+' : ''}${userAnalytics.favoritesGrowth?.toFixed(1) || 0}%`}
                    trend={userAnalytics.favoritesGrowth > 0 ? "up" : userAnalytics.favoritesGrowth < 0 ? "down" : "neutral"}
                    icon={Users}
                  />                  <StatCard
                    title="Ahorro en Comisiones"
                    value={`$${((userAnalytics.totalSpent || 0) * 0.15).toLocaleString()}`}
                    change="∞"
                    trend="up"
                    icon={Target}
                    description="15% que no pagaste en otras plataformas"
                  />
                </>
              ) : null}
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings/Spending Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isProfessional ? "Evolución de Ingresos" : "Evolución de Gastos"}
                  </CardTitle>
                  <CardDescription>
                    Últimos 6 meses - Sin comisiones aplicadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, isProfessional ? "Ingresos" : "Gastos"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bookings Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Mes</CardTitle>
                  <CardDescription>
                    Crecimiento constante en tu actividad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Performance */}
              {isProfessional && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento por Servicio</CardTitle>
                    <CardDescription>
                      Análisis detallado de tus servicios más exitosos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {servicePerformance.map((service, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{service.name}</span>
                            <div className="flex items-center gap-4 text-sm">
                              <span>{service.bookings} reservas</span>
                              <span className="font-medium">
                                ${service.revenue.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{service.avgRating}</span>
                              </div>
                            </div>
                          </div>
                          <Progress 
                            value={(service.bookings / 52) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Time Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Horarios</CardTitle>
                  <CardDescription>
                    Horas pico de actividad en la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone"
                        dataKey="bookings" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Client Segmentation */}
              <Card>
                <CardHeader>
                  <CardTitle>Segmentación de Clientes</CardTitle>
                  <CardDescription>
                    Distribución de tu base de clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={segmentationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {segmentationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Insights de Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Excelente Crecimiento</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Tus ingresos han crecido un 15% este mes. Sigue promocionando 
                          tus servicios de plomería, que son los más solicitados.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Optimización de Horarios</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          La mayoría de tus reservas son entre 3-6 PM. Considera 
                          ofrecer descuentos en horarios de menor demanda.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Calidad Destacada</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Tu calificación promedio de 4.8 te coloca en el top 10% 
                          de profesionales. ¡Excelente trabajo!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recomendaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-medium">Amplía tus servicios</h4>
                        <p className="text-sm text-foreground/70 mt-1">
                          Hay alta demanda de servicios de electricidad en tu área.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-medium">Mejora tiempo de respuesta</h4>
                        <p className="text-sm text-foreground/70 mt-1">
                          Responder en menos de 1 hora puede aumentar tus reservas 30%.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-medium">Actualiza tu perfil</h4>
                        <p className="text-sm text-foreground/70 mt-1">
                          Agrega más fotos de trabajos recientes para aumentar confianza.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Savings Tracker (for clients) */}
              {!isProfessional && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Ahorro en Red Profesional vs Otras Plataformas
                    </CardTitle>
                    <CardDescription>
                      Dinero que te has ahorrado al usar nuestra plataforma gratuita
                    </CardDescription>
                  </CardHeader>
                  <CardContent>                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ${userAnalytics && !userAnalytics.isProfessional ? ((userAnalytics.totalSpent || 0) * 0.15).toLocaleString() : '0'}
                        </div>
                        <p className="text-sm text-foreground/70">Ahorrado en comisiones</p>
                        <p className="text-xs text-foreground/50 mt-1">
                          15% que no pagaste vs otras plataformas
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">$0</div>
                        <p className="text-sm text-foreground/70">Tarifas de registro</p>
                        <p className="text-xs text-foreground/50 mt-1">
                          Otras plataformas cobran $50-200/mes
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                        <p className="text-sm text-foreground/70">Acceso completo</p>
                        <p className="text-xs text-foreground/50 mt-1">
                          Todas las funciones sin restricciones
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Platform Tab */}
          <TabsContent value="platform" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">              {platformMetrics.map((metric, index) => (
                <StatCard
                  key={index}
                  title={metric.metric}
                  value={metric.value}
                  change={metric.change}
                  trend={metric.trend as "up" | "down" | "neutral"}
                  icon={Activity}
                />
              ))}
            </div>

            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de la Plataforma</CardTitle>
                <CardDescription>
                  Métricas clave del ecosistema Red Profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Satisfacción del Cliente</span>
                        <span className="text-sm text-foreground/70">97%</span>
                      </div>
                      <Progress value={97} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Profesionales Activos</span>
                        <span className="text-sm text-foreground/70">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Tiempo de Resolución</span>
                        <span className="text-sm text-foreground/70">2.3h promedio</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-1">Sin Comisiones</h4>
                      <p className="text-sm text-green-700">
                        $0 en comisiones cobradas. 100% gratuito para todos.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-1">Crecimiento Sostenible</h4>
                      <p className="text-sm text-blue-700">
                        +12% nuevos profesionales y +8% nuevos clientes este mes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
