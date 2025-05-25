"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  MapPin,
  CheckCircle,
  Search,
  Grid3X3,
  List,
  Users,
  MessageSquare,
} from "lucide-react";

// Mock data - en el futuro vendrá de la API
const MOCK_PROFESSIONALS = [
  {
    id: 1,
    name: "Carlos Méndez",
    title: "Técnico en Electrodomésticos",
    image: "/avatars/carlos.jpg",
    specialties: ["Electrodomésticos", "Refrigeración", "Línea Blanca"],
    location: "Bogotá, Colombia",
    rating: 4.8,
    reviewCount: 124,
    completedJobs: 350,
    memberSince: "2020",
    hourlyRate: "$25.000/hora",
    responseTime: "2 horas",
    verified: true,
    available: true,
    description:
      "Técnico especializado con más de 10 años de experiencia en reparación de electrodomésticos. Certificado internacional y garantía en todos los trabajos.",
    languages: ["Español"],
    serviceArea: ["Bogotá", "Soacha", "Chía"],
  },
  {
    id: 2,
    name: "Ana Rodríguez",
    title: "Estilista Profesional",
    image: "/avatars/ana.jpg",
    specialties: ["Corte", "Color", "Peinados", "Tratamientos"],
    location: "Medellín, Colombia",
    rating: 4.9,
    reviewCount: 89,
    completedJobs: 200,
    memberSince: "2021",
    hourlyRate: "$35.000/hora",
    responseTime: "1 hora",
    verified: true,
    available: true,
    description:
      "Estilista con formación internacional. Especializada en técnicas modernas de coloración y corte. Productos premium garantizados.",
    languages: ["Español", "Inglés"],
    serviceArea: ["Medellín", "Envigado", "Sabaneta"],
  },
  {
    id: 3,
    name: "Miguel Torres",
    title: "Plomero Certificado",
    image: "/avatars/miguel.jpg",
    specialties: ["Plomería", "Destapes", "Instalaciones", "Reparaciones"],
    location: "Cali, Colombia",
    rating: 4.7,
    reviewCount: 156,
    completedJobs: 450,
    memberSince: "2019",
    hourlyRate: "$30.000/hora",
    responseTime: "1.5 horas",
    verified: true,
    available: false,
    description:
      "Plomero con licencia y 15 años de experiencia. Especialista en instalaciones residenciales y comerciales. Disponible 24/7 para emergencias.",
    languages: ["Español"],
    serviceArea: ["Cali", "Palmira", "Yumbo"],
  },
  {
    id: 4,
    name: "Laura González",
    title: "Profesora Particular",
    image: "/avatars/laura.jpg",
    specialties: ["Matemáticas", "Física", "Química", "Inglés"],
    location: "Barranquilla, Colombia",
    rating: 4.9,
    reviewCount: 67,
    completedJobs: 120,
    memberSince: "2022",
    hourlyRate: "$20.000/hora",
    responseTime: "30 minutos",
    verified: true,
    available: true,
    description:
      "Licenciada en Matemáticas con maestría en Educación. Métodos pedagógicos innovadores y resultados comprobados con estudiantes de todas las edades.",
    languages: ["Español", "Inglés", "Francés"],
    serviceArea: ["Barranquilla", "Soledad", "Malambo"],
  },
  {
    id: 5,
    name: "Roberto Silva",
    title: "Técnico en Sistemas",
    image: "/avatars/roberto.jpg",
    specialties: ["Computadores", "Redes", "Software", "Hardware"],
    location: "Bucaramanga, Colombia",
    rating: 4.6,
    reviewCount: 93,
    completedJobs: 180,
    memberSince: "2021",
    hourlyRate: "$40.000/hora",
    responseTime: "3 horas",
    verified: true,
    available: true,
    description:
      "Ingeniero de sistemas con certificaciones internacionales. Especialista en soporte técnico, redes y recuperación de datos.",
    languages: ["Español", "Inglés"],
    serviceArea: ["Bucaramanga", "Floridablanca", "Girón"],
  },
  {
    id: 6,
    name: "Diana Morales",
    title: "Esteticista Profesional",
    image: "/avatars/diana.jpg",
    specialties: ["Facial", "Corporal", "Depilación", "Masajes"],
    location: "Cartagena, Colombia",
    rating: 4.8,
    reviewCount: 142,
    completedJobs: 280,
    memberSince: "2020",
    hourlyRate: "$45.000/hora",
    responseTime: "2 horas",
    verified: true,
    available: true,
    description:
      "Esteticista certificada con especialización en tratamientos faciales y corporales. Productos orgánicos y técnicas avanzadas.",
    languages: ["Español", "Inglés"],
    serviceArea: ["Cartagena", "Turbaco", "Arjona"],
  },
];

// const CATEGORIES = [
//   "Todos",
//   "Hogar",
//   "Belleza",
//   "Educación",
//   "Tecnología",
//   "Salud",
//   "Construcción",
//   "Automotriz",
// ];

const LOCATIONS = [
  "Todas las ciudades",
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Bucaramanga",
  "Cartagena",
];

const SORT_OPTIONS = [
  { value: "rating", label: "Mejor calificados" },
  { value: "price-low", label: "Precio: menor a mayor" },
  { value: "price-high", label: "Precio: mayor a menor" },
  { value: "recent", label: "Más recientes" },
  { value: "experience", label: "Más experiencia" },
];

export default function ProfessionalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  // const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] =
    useState("Todas las ciudades");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // const [showFilters, setShowFilters] = useState(false);

  // Filtrar profesionales basado en los criterios de búsqueda
  const filteredProfessionals = MOCK_PROFESSIONALS.filter((professional) => {
    const matchesSearch =
      professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesLocation =
      selectedLocation === "Todas las ciudades" ||
      professional.location.includes(selectedLocation);

    return matchesSearch && matchesLocation;
  });

  // Ordenar profesionales
  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "price-low":
        return (
          parseInt(a.hourlyRate.replace(/[^\d]/g, "")) -
          parseInt(b.hourlyRate.replace(/[^\d]/g, ""))
        );
      case "price-high":
        return (
          parseInt(b.hourlyRate.replace(/[^\d]/g, "")) -
          parseInt(a.hourlyRate.replace(/[^\d]/g, ""))
        );
      case "recent":
        return parseInt(b.memberSince) - parseInt(a.memberSince);
      case "experience":
        return b.completedJobs - a.completedJobs;
      default:
        return 0;
    }
  });

  const ProfessionalCard = ({
    professional,
    isListView = false,
  }: {
    professional: (typeof MOCK_PROFESSIONALS)[0];
    isListView?: boolean;
  }) => (
    <Card
      className={`h-full hover:shadow-lg transition-shadow ${
        isListView ? "flex flex-row" : ""
      }`}
    >
      <div className={isListView ? "flex-shrink-0" : ""}>
        <CardHeader className={`pb-3 ${isListView ? "p-4" : ""}`}>
          <div
            className={`flex items-start gap-3 ${
              isListView ? "" : "flex-col items-center text-center"
            }`}
          >
            <Avatar
              className={`${
                isListView ? "h-16 w-16" : "h-20 w-20"
              } flex-shrink-0`}
            >
              <AvatarImage src={professional.image} />
              <AvatarFallback>
                {professional.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className={`flex-1 ${isListView ? "" : "mt-3"}`}>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className={`${isListView ? "text-lg" : "text-xl"}`}>
                  {professional.name}
                </CardTitle>
                {professional.verified && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-foreground/70 font-medium">
                {professional.title}
              </p>
              <div
                className={`flex items-center gap-4 mt-2 text-sm text-foreground/60 ${
                  isListView ? "" : "justify-center"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{professional.rating}</span>
                  <span>({professional.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{professional.location.split(",")[0]}</span>
                </div>
              </div>
            </div>
            {!professional.available && (
              <Badge variant="secondary" className="ml-auto">
                No disponible
              </Badge>
            )}
          </div>
        </CardHeader>
      </div>

      <CardContent className={`pt-0 flex-1 ${isListView ? "p-4 pt-4" : ""}`}>
        <div className="space-y-4">
          {/* Specialties */}
          <div>
            <div className="flex flex-wrap gap-1 justify-center">
              {professional.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {professional.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{professional.specialties.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <p
            className={`text-sm text-foreground/70 ${
              isListView ? "" : "text-center"
            } line-clamp-2`}
          >
            {professional.description}
          </p>

          {/* Stats */}
          <div
            className={`grid grid-cols-3 gap-2 text-center text-xs ${
              isListView ? "max-w-md" : ""
            }`}
          >
            <div>
              <div className="font-medium">{professional.completedJobs}</div>
              <div className="text-foreground/60">Trabajos</div>
            </div>
            <div>
              <div className="font-medium">{professional.responseTime}</div>
              <div className="text-foreground/60">Respuesta</div>
            </div>
            <div>
              <div className="font-medium">{professional.hourlyRate}</div>
              <div className="text-foreground/60">Por hora</div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className={`flex gap-2 ${isListView ? "" : "flex-col"}`}>
            <Button asChild className="flex-1">
              <Link href={`/professionals/${professional.id}`}>Ver Perfil</Link>
            </Button>
            <Button variant="outline" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contactar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              Encuentra Profesionales de Confianza
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Conecta con expertos verificados en tu área. Miles de
              profesionales listos para ayudarte.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input
                  placeholder="Buscar profesionales por nombre, especialidad o servicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap gap-4 items-center">
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {" "}
            <h2 className="text-xl font-semibold">
              {sortedProfessionals.length} profesionales encontrados
            </h2>
            {searchQuery && (
              <p className="text-sm text-foreground/60">
                Resultados para &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Professionals Grid/List */}
        {sortedProfessionals.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {sortedProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                isListView={viewMode === "list"}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No se encontraron profesionales
              </h3>
              <p className="text-foreground/60 mb-4">
                Intenta ajustar tus filtros de búsqueda o términos de búsqueda.
              </p>{" "}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  // setSelectedCategory("Todos");
                  setSelectedLocation("Todas las ciudades");
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {sortedProfessionals.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Cargar más profesionales
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
