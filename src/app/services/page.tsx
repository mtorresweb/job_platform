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
import {
  Search,
  MapPin,
  Star,
  Clock,
  Grid3X3,
  List,
  SortAsc,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// Datos de ejemplo - en el futuro vendrán de la API
const MOCK_SERVICES = [
  {
    id: 1,
    title: "Reparación de Electrodomésticos",
    description:
      "Reparación profesional de lavadoras, neveras, estufas y más. Servicio a domicilio con garantía.",
    category: "Hogar",
    price: "Desde $50.000",
    location: "Bogotá, Colombia",
    rating: 4.8,
    reviewCount: 124,
    provider: {
      name: "Carlos Méndez",
      image: "/avatars/carlos.jpg",
      verified: true,
    },
    tags: ["Reparación", "A domicilio", "Garantía"],
    responseTime: "2 horas",
  },
  {
    id: 2,
    title: "Desarrollo Web Profesional",
    description:
      "Creación de sitios web modernos y aplicaciones web. React, Next.js, Node.js.",
    category: "Tecnología",
    price: "Desde $800.000",
    location: "Medellín, Colombia",
    rating: 4.9,
    reviewCount: 89,
    provider: {
      name: "Ana García",
      image: "/avatars/ana.jpg",
      verified: true,
    },
    tags: ["React", "Next.js", "Responsive"],
    responseTime: "1 hora",
  },
  {
    id: 3,
    title: "Plomería Residencial",
    description:
      "Instalación y reparación de tuberías, grifos, sanitarios. Servicio 24/7.",
    category: "Hogar",
    price: "Desde $40.000",
    location: "Cali, Colombia",
    rating: 4.7,
    reviewCount: 156,
    provider: {
      name: "Miguel Torres",
      image: "/avatars/miguel.jpg",
      verified: true,
    },
    tags: ["24/7", "Emergencias", "Garantía"],
    responseTime: "30 min",
  },
  {
    id: 4,
    title: "Fotografía de Eventos",
    description:
      "Fotografía profesional para bodas, cumpleaños, eventos corporativos.",
    category: "Eventos",
    price: "Desde $200.000",
    location: "Barranquilla, Colombia",
    rating: 4.9,
    reviewCount: 78,
    provider: {
      name: "Laura Jiménez",
      image: "/avatars/laura.jpg",
      verified: true,
    },
    tags: ["Bodas", "Corporativo", "Edición"],
    responseTime: "3 horas",
  },
  {
    id: 5,
    title: "Pintura de Interiores",
    description:
      "Pintura profesional de casas y oficinas. Acabados de alta calidad.",
    category: "Pintura",
    price: "Desde $15.000/m²",
    location: "Bogotá, Colombia",
    rating: 4.6,
    reviewCount: 92,
    provider: {
      name: "Roberto Silva",
      image: "/avatars/roberto.jpg",
      verified: true,
    },
    tags: ["Interiores", "Acabados", "Presupuesto"],
    responseTime: "4 horas",
  },
  {
    id: 6,
    title: "Mecánica Automotriz",
    description:
      "Reparación y mantenimiento de vehículos. Diagnóstico computarizado.",
    category: "Automotive",
    price: "Desde $80.000",
    location: "Medellín, Colombia",
    rating: 4.8,
    reviewCount: 134,
    provider: {
      name: "Jorge Ramírez",
      image: "/avatars/jorge.jpg",
      verified: true,
    },
    tags: ["Diagnóstico", "Mantenimiento", "Garantía"],
    responseTime: "1 hora",
  },
];

const CATEGORIES = [
  "Todas las categorías",
  "Hogar",
  "Tecnología",
  "Eventos",
  "Pintura",
  "Automotive",
  "Reparaciones",
];

const LOCATIONS = [
  "Todas las ubicaciones",
  "Bogotá, Colombia",
  "Medellín, Colombia",
  "Cali, Colombia",
  "Barranquilla, Colombia",
  "Cartagena, Colombia",
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    "Todas las categorías",
  );
  const [selectedLocation, setSelectedLocation] = useState(
    "Todas las ubicaciones",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("rating");

  // Filtrar servicios
  const filteredServices = MOCK_SERVICES.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas las categorías" ||
      service.category === selectedCategory;
    const matchesLocation =
      selectedLocation === "Todas las ubicaciones" ||
      service.location === selectedLocation;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Ordenar servicios
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviewCount - a.reviewCount;
      case "price":
        return a.price.localeCompare(b.price);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Encuentra el Servicio{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Perfecto
              </span>
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Miles de profesionales verificados listos para ayudarte. Compara
              precios, lee reseñas y contrata con confianza.
            </p>

            {/* Search Bar */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-lg border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="¿Qué servicio necesitas?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-lg"
                    />
                  </div>
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="h-12">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {sortedServices.length} servicios encontrados
              </h2>
              <p className="text-foreground/60">
                Profesionales verificados en tu área
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Mejor calificación</SelectItem>
                  <SelectItem value="reviews">Más reseñas</SelectItem>
                  <SelectItem value="price">Precio</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Services Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }
          >
            {sortedServices.map((service) => (
              <Card
                key={service.id}
                className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                }`}
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="mb-2">
                          {service.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-foreground/60">
                          <Clock className="h-3 w-3" />
                          {service.responseTime}
                        </div>
                      </div>

                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>

                      <p className="text-sm text-foreground/70 line-clamp-2">
                        {service.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Provider */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={service.provider.image} />
                          <AvatarFallback>
                            {service.provider.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm truncate">
                              {service.provider.name}
                            </span>
                            {service.provider.verified && (
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating and Location */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.rating}</span>
                          <span className="text-foreground/60">
                            ({service.reviewCount})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-foreground/60">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">{service.location}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {service.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-lg text-primary">
                          {service.price}
                        </span>
                        <Button size="sm" asChild>
                          <Link href={`/services/${service.id}`}>
                            Ver detalles
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  // List View
                  <div className="flex flex-col sm:flex-row w-full">
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{service.category}</Badge>
                          <div className="flex items-center gap-1 text-sm text-foreground/60">
                            <Clock className="h-3 w-3" />
                            {service.responseTime}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.rating}</span>
                          <span className="text-foreground/60">
                            ({service.reviewCount})
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>

                      <p className="text-foreground/70 mb-4">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={service.provider.image} />
                            <AvatarFallback>
                              {service.provider.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {service.provider.name}
                            </span>
                            {service.provider.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold text-xl text-primary">
                            {service.price}
                          </span>
                          <Button asChild>
                            <Link href={`/services/${service.id}`}>
                              Ver detalles
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* No Results */}
          {sortedServices.length === 0 && (
            <div className="text-center py-16">
              <div className="mb-6">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">
                  No se encontraron servicios
                </h3>
                <p className="text-foreground/60 max-w-md mx-auto">
                  Intenta ajustar tus filtros de búsqueda o explora otras
                  categorías.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Todas las categorías");
                  setSelectedLocation("Todas las ubicaciones");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
