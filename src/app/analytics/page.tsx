"use client";

import { useState } from "react";
import { useUserRole } from "@/infrastructure/auth/auth-client";
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
} from "lucide-react";
import { redirect } from "next/navigation";

// Mock data for analytics
const earningsData = [
  { month: "Ene", earnings: 1200000, bookings: 15, clients: 8 },
  { month: "Feb", earnings: 1450000, bookings: 18, clients: 12 },
  { month: "Mar", earnings: 1680000, bookings: 22, clients: 15 },
  { month: "Abr", earnings: 1890000, bookings: 25, clients: 18 },
  { month: "May", earnings: 2340000, bookings: 31, clients: 22 },
  { month: "Jun", earnings: 2150000, bookings: 28, clients: 20 },
];

const servicePerformance = [
  { name: "Plomería", bookings: 45, revenue: 2250000, avgRating: 4.8, color: "#8884d8" },
  { name: "Electricidad", bookings: 38, revenue: 1900000, avgRating: 4.9, color: "#82ca9d" },
  { name: "Carpintería", bookings: 32, revenue: 1600000, avgRating: 4.7, color: "#ffc658" },
  { name: "Pintura", bookings: 28, revenue: 1400000, avgRating: 4.6, color: "#ff7300" },
  { name: "Limpieza", bookings: 52, revenue: 1300000, avgRating: 4.5, color: "#8dd1e1" },
];

const timeAnalytics = [
  { hour: "08:00", bookings: 5 },
  { hour: "09:00", bookings: 12 },
  { hour: "10:00", bookings: 18 },
  { hour: "11:00", bookings: 24 },
  { hour: "12:00", bookings: 15 },
  { hour: "13:00", bookings: 10 },
  { hour: "14:00", bookings: 22 },
  { hour: "15:00", bookings: 28 },
  { hour: "16:00", bookings: 35 },
  { hour: "17:00", bookings: 30 },
  { hour: "18:00", bookings: 20 },
  { hour: "19:00", bookings: 8 },
];

const clientSegmentation = [
  { segment: "Regulares", value: 45, color: "#8884d8" },
  { segment: "Nuevos", value: 30, color: "#82ca9d" },
  { segment: "Premium", value: 15, color: "#ffc658" },
  { segment: "Corporativos", value: 10, color: "#ff7300" },
];

const platformMetrics = [
  { metric: "Total Profesionales", value: "5,247", change: "+12%", trend: "up" },
  { metric: "Total Clientes", value: "18,392", change: "+8%", trend: "up" },
  { metric: "Servicios Completados", value: "52,148", change: "+15%", trend: "up" },
  { metric: "Ingresos Plataforma", value: "$0", change: "0%", trend: "neutral" },
  { metric: "Calificación Promedio", value: "4.7", change: "+0.1", trend: "up" },
  { metric: "Tiempo Respuesta", value: "2.3h", change: "-15%", trend: "up" },
];

export default function AnalyticsPage() {
  const { isAuthenticated, isProfessional } = useUserRole();
  const [timeRange, setTimeRange] = useState("6m");
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!isAuthenticated) {
    redirect("/auth/login");
  }

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
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isProfessional ? (
                <>
                  <StatCard
                    title="Ingresos Totales"
                    value="$2,340,000"
                    change="+15%"
                    trend="up"
                    icon={DollarSign}
                    description="Sin comisiones, 100% para ti"
                  />
                  <StatCard
                    title="Reservas del Mes"
                    value="31"
                    change="+25%"
                    trend="up"
                    icon={Calendar}
                  />
                  <StatCard
                    title="Clientes Únicos"
                    value="22"
                    change="+18%"
                    trend="up"
                    icon={Users}
                  />
                  <StatCard
                    title="Calificación"
                    value="4.8"
                    change="+0.2"
                    trend="up"
                    icon={Star}
                  />
                </>
              ) : (
                <>
                  <StatCard
                    title="Servicios Utilizados"
                    value="15"
                    change="+20%"
                    trend="up"
                    icon={Activity}
                  />
                  <StatCard
                    title="Gasto Total"
                    value="$850,000"
                    change="+5%"
                    trend="up"
                    icon={DollarSign}
                  />
                  <StatCard
                    title="Profesionales Favoritos"
                    value="7"
                    change="+2"
                    trend="up"
                    icon={Users}
                  />
                  <StatCard
                    title="Ahorro en Comisiones"
                    value="$127,500"
                    change="∞"
                    trend="up"
                    icon={Target}
                    description="15% que no pagaste en otras plataformas"
                  />
                </>
              )}
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
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeAnalytics}>
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
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={clientSegmentation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {clientSegmentation.map((entry, index) => (
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
                      Ahorro en ServiciosPro vs Otras Plataformas
                    </CardTitle>
                    <CardDescription>
                      Dinero que te has ahorrado al usar nuestra plataforma gratuita
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">$127,500</div>
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
                  Métricas clave del ecosistema ServiciosPro
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
