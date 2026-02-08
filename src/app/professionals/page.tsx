"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  CheckCircle,
  Search,
  Grid3X3,
  List,
  Users,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useProfessionals, useSearchProfessionals } from "@/shared/hooks/useProfessionals";
import { Professional } from "@/shared/utils/professionals-api";

const SORT_OPTIONS = [
  { value: "rating", label: "Mejor calificados" },
  { value: "experience", label: "Más experiencia" },
  { value: "recent", label: "Más recientes" },
];

export default function ProfessionalsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Always call both hooks but enable/disable based on search state
  const { 
    data: allProfessionalsData, 
    isLoading: isLoadingAll, 
    isError: isErrorAll, 
    error: errorAll 
  } = useProfessionals({
    sortBy,
    sortOrder: 'desc' as const,
  });

  const { 
    data: searchResults, 
    isLoading: isLoadingSearch, 
    isError: isErrorSearch, 
    error: errorSearch 
  } = useSearchProfessionals({
    query: debouncedSearch,
    sortBy,
    sortOrder: 'desc' as const,
  });

  // Determine which data to use
  const isSearching = debouncedSearch.trim().length > 0;
  const data = isSearching ? searchResults : allProfessionalsData;
  const isLoading = isSearching ? isLoadingSearch : isLoadingAll;
  const isError = isSearching ? isErrorSearch : isErrorAll;
  const error = isSearching ? errorSearch : errorAll;
  const professionals = data?.professionals || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the debounced effect
  };
  const ProfessionalCard = ({
    professional,
    isListView = false,
  }: {
    professional: Professional;
    isListView?: boolean;
  }) => {
    const handleContact = () => {
      router.push(`/messages?conversationWith=${professional.user.id}`);
    };

    return (
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <div className={isListView ? "sm:flex sm:items-start sm:gap-6" : ""}>
          <CardHeader className={`pb-3 ${isListView ? "p-4 sm:w-64 sm:border-r sm:border-border/60" : ""}`}>
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
                <AvatarImage src={professional.user.avatar || professional.avatar} />
                <AvatarFallback>
                  {professional.user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className={`flex-1 ${isListView ? "" : "mt-3"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className={`${isListView ? "text-lg" : "text-xl"}`}>
                    {professional.user.name}
                  </CardTitle>
                  {professional.isVerified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-foreground/70 font-medium">
                  {professional.specialties?.[0] || "Profesional verificado"}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-foreground/60">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{professional.rating || 0}</span>
                  <span>({professional.reviewCount || 0})</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className={`pt-0 flex-1 flex flex-col ${isListView ? "sm:p-4" : ""}`}>
            <div className={`space-y-3 flex flex-col h-full`}>
              <p className="text-sm text-foreground/80 line-clamp-2">
                {professional.bio}
              </p>

              <div className="flex flex-wrap gap-1">
                {professional.specialties.slice(0, 3).map((specialty: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-foreground/60">
                    <Users className="h-3 w-3" />
                    <span>{professional._count?.services || 0} servicios</span>
                  </div>
                  <div className="text-sm text-foreground/60">
                    {professional.experience} años de experiencia
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-foreground/60">
                    Verificado: {professional.isVerified ? 'Sí' : 'No'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <Button asChild className="flex-1">
                  <Link href={`/professionals/${professional.id}`}>Ver Perfil</Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleContact}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

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
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input
                  placeholder="Buscar profesionales por especialidad o servicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap gap-4 items-center">
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
                    type="button"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    type="button"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Cargando profesionales...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error al cargar profesionales</h3>
              <p className="text-foreground/60 mb-4">
                {error?.message || 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'}
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results Header */}        {!isLoading && !isError && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {professionals.length} profesionales encontrados
              </h2>
              {searchQuery && (
                <p className="text-sm text-foreground/60">
                  Resultados para &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}

        {/* Professionals Grid/List */}
        {!isLoading && !isError && professionals.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
                : "space-y-4"
            }
          >
            {professionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                isListView={viewMode === "list"}
              />
            ))}
          </div>
        ) : !isLoading && !isError && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No se encontraron profesionales
              </h3>
              <p className="text-foreground/60 mb-4">
                Intenta ajustar tus filtros de búsqueda o términos de búsqueda.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLocation("Todas las ciudades");
                  setSortBy("rating");
                }}              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Load More - Future Enhancement */}
        {!isLoading && !isError && professionals.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" disabled>
              Cargar más profesionales
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
