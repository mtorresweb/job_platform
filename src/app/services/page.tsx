"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  Clock,
  Grid3X3,
  List,
  SortAsc,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useServices, useServiceCategories, useSearchServices } from "@/shared/hooks/useServices";
import { ServiceSearchParams } from "@/shared/utils/services-api";

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("rating");

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useServiceCategories();
  const categories = categoriesData || [];

  // Build search params
  const searchParams: ServiceSearchParams = {
    query: searchTerm.length > 0 ? searchTerm : undefined,
    filters: {
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      location: selectedLocation !== "all" ? selectedLocation : undefined,
    },
  };

  // Fetch services based on search term
  const { data: searchData, isLoading: isSearching } = useSearchServices(searchParams);
  const { data: servicesData, isLoading: isLoadingServices } = useServices(searchParams);

  // Use search results if there's a search term, otherwise use regular services
  const data = searchTerm.length > 0 ? searchData : servicesData;
  const services = data?.services || [];
  const isLoading = searchTerm.length > 0 ? isSearching : isLoadingServices;

  // Sort services
  const sortedServices = [...services].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.professional?.rating || 0) - (a.professional?.rating || 0);
      case "reviews":
        return (b.professional?.reviewCount || 0) - (a.professional?.reviewCount || 0);
      default:
        return 0;
    }
  });

  // Loading state
  if (isLoading || isLoadingCategories) {
    return (
      <div className="min-h-screen bg-background">
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Skeleton className="h-12 w-96 mx-auto" />
              <Skeleton className="h-6 w-80 mx-auto" />
              <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-lg border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Skeleton className="h-12 md:col-span-2" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

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
                </div>                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    <SelectItem value="bogota">Bogotá, Colombia</SelectItem>
                    <SelectItem value="medellin">Medellín, Colombia</SelectItem>
                    <SelectItem value="cali">Cali, Colombia</SelectItem>
                    <SelectItem value="barranquilla">Barranquilla, Colombia</SelectItem>
                    <SelectItem value="cartagena">Cartagena, Colombia</SelectItem>
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
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="rating">Mejor calificación</SelectItem>
                  <SelectItem value="reviews">Más reseñas</SelectItem>
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
                {viewMode === "grid" ? (                  // Grid View
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="mb-2">
                          {service.category?.name || 'Sin categoría'}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-foreground/60">
                          <Clock className="h-3 w-3" />
                          {service.duration} min
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
                          <AvatarImage src={service.professional?.user?.avatar} />
                          <AvatarFallback>
                            {service.professional?.user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm truncate">
                              {service.professional?.user?.name || 'Usuario'}
                            </span>
                            {service.professional?.isVerified && (
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating and Views */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.professional?.rating || 0}</span>
                          <span className="text-foreground/60">
                            ({service.professional?.reviewCount || 0})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-foreground/60">
                          <span className="text-xs">{service.viewCount} vistas</span>
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
                      </div>                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-foreground/60">
                          {Math.floor(service.duration / 60)}h {service.duration % 60}min
                        </span>
                        <Button size="sm" asChild>
                          <Link href={`/services/${service.id}`}>
                            Ver detalles
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (                  // List View
                  <div className="flex flex-col sm:flex-row w-full">
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{service.category?.name || 'Sin categoría'}</Badge>
                          <div className="flex items-center gap-1 text-sm text-foreground/60">
                            <Clock className="h-3 w-3" />
                            {service.duration} min
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.professional?.rating || 0}</span>
                          <span className="text-foreground/60">
                            ({service.professional?.reviewCount || 0})
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
                            <AvatarImage src={service.professional?.user?.avatar} />
                            <AvatarFallback>
                              {service.professional?.user?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {service.professional?.user?.name || 'Usuario'}
                            </span>
                            {service.professional?.isVerified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>                        <div className="flex items-center gap-4">
                          <span className="text-sm text-foreground/60">
                            {Math.floor(service.duration / 60)}h {service.duration % 60}min
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
              </div>              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
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
