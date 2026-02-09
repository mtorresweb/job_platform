"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, PlusCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserProfileForm } from "@/components/profile/user-profile-form";
import { useUserRole } from "@/infrastructure/auth/useUserRole";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useServiceCategories, useCreateService, useProfessionalServices, useUpdateService } from "@/shared/hooks/useServices";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { fileUploadService, FileCategory, validateFile } from "@/shared/utils/file-upload";
import { FILE_CONFIG } from "@/shared/constants";

export default function ProfilePage() {
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { isProfessional: sessionIsProfessional } = useUserRole();
  const isProfessional = sessionIsProfessional || user?.role === "PROFESSIONAL";
  const professionalId = user?.professional?.id ?? "";
  const hasPublicProfile = isProfessional && Boolean(professionalId);
  const searchParams = useSearchParams();

  const isLoadingProfile = loadingUser && !user;

  const profileCompletion = useMemo(() => {
    const fields = [user?.name, user?.phone, user?.professional?.bio];
    const filled = fields.filter(Boolean).length;
    const total = fields.length;
    return Math.round((filled / total) * 100);
  }, [user]);

  const emptyServiceForm = {
    title: "",
    description: "",
    categoryId: "",
    price: 0,
    duration: 60,
    tags: "",
    images: [] as string[],
  };

  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [pendingServiceFiles, setPendingServiceFiles] = useState<File[]>([]);
  const [pendingServicePreviews, setPendingServicePreviews] = useState<string[]>([]);
  const [serviceUploadError, setServiceUploadError] = useState<string | null>(null);
  const [serviceUploading, setServiceUploading] = useState(false);

  const toAbsoluteUrl = (url: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "";
    return origin ? `${origin}${url.startsWith('/') ? url : `/${url}`}` : url;
  };

  const { data: categories, isLoading: loadingCategories } = useServiceCategories();
  const { data: servicesData, isLoading: loadingServices } = useProfessionalServices(professionalId, { limit: 20 });
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  useEffect(() => {
    const requestedId = searchParams.get("editService");
    if (!requestedId || !servicesData?.services) return;
    const target = servicesData.services.find((s) => s.id === requestedId);
    if (target) {
      setEditingServiceId(target.id);
      setServiceForm({
        title: target.title || "",
        description: target.description || "",
        categoryId: target.category?.id || target.categoryId || "",
        price: target.price ?? 0,
        duration: target.duration || 60,
        tags: (target.tags || []).join(", "),
        images: target.images || [],
      });
      setPendingServiceFiles([]);
      setPendingServicePreviews([]);
      setServiceUploadError(null);
    }
  }, [searchParams, servicesData]);

  const handleServiceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!professionalId) {
      toast.error("Necesitas tener un perfil profesional para crear servicios");
      return;
    }

    const errors: string[] = [];
    if (!serviceForm.title || serviceForm.title.trim().length < 5) {
      errors.push("El título debe tener al menos 5 caracteres");
    }
    if (!serviceForm.categoryId) {
      errors.push("Selecciona una categoría");
    }
    const descLength = serviceForm.description.trim().length;
    if (descLength < 20) {
      errors.push("La descripción debe tener al menos 20 caracteres");
    }
    const durationValue = Number(serviceForm.duration);
    if (!Number.isFinite(durationValue) || durationValue < 15) {
      errors.push("La duración mínima es 15 minutos");
    }

    const priceValue = Number(serviceForm.price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      errors.push("El precio no puede ser negativo");
    }

    if (errors.length) {
      toast.error(errors[0]);
      return;
    }

    const tags = serviceForm.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10);

    let images = [...serviceForm.images];

    try {
      if (pendingServiceFiles.length) {
        setServiceUploadError(null);
        setServiceUploading(true);
        const uploaded = await fileUploadService.uploadFiles(pendingServiceFiles, FileCategory.SERVICE_IMAGE, undefined, {
          folder: "services",
          maxWidth: 1600,
          maxHeight: 1200,
          quality: 85,
        });
        images = [...images, ...uploaded.map((u) => u.url)];
        setPendingServiceFiles([]);
        pendingServicePreviews.forEach((url) => URL.revokeObjectURL(url));
        setPendingServicePreviews([]);
      }

      images = images
        .map((img) => toAbsoluteUrl(img))
        .filter(Boolean)
        .slice(0, FILE_CONFIG.maxImagesPerService);

      if (editingServiceId) {
        await updateServiceMutation.mutateAsync({
          id: editingServiceId,
          title: serviceForm.title,
          description: serviceForm.description,
          categoryId: serviceForm.categoryId,
          price: priceValue,
          duration: Number(serviceForm.duration),
          tags,
          images,
        });
      } else {
        await createServiceMutation.mutateAsync({
          title: serviceForm.title,
          description: serviceForm.description,
          categoryId: serviceForm.categoryId,
          price: priceValue,
          duration: Number(serviceForm.duration),
          tags,
          images,
        });
      }

      setServiceForm({
        title: "",
        description: "",
        categoryId: "",
        price: 0,
        duration: 60,
        tags: "",
        images: [],
      });
      setPendingServiceFiles([]);
      pendingServicePreviews.forEach((url) => URL.revokeObjectURL(url));
      setPendingServicePreviews([]);
      setEditingServiceId(null);
    } catch (error) {
      console.error(error);
      setServiceUploadError(error instanceof Error ? error.message : "No se pudo guardar el servicio");
    } finally {
      setServiceUploading(false);
    }
  };

  const servicesList = useMemo(() => {
    if (!servicesData) return [] as any[];
    const raw = servicesData as unknown as { services?: any[]; data?: { services?: any[] } };
    return raw?.services ?? raw?.data?.services ?? [];
  }, [servicesData]);

  if (typeof window !== "undefined" && isProfessional) {
    // Log para depurar carga de servicios en perfil
    console.log("[PROFILE] servicesData", servicesData);
    console.log("[PROFILE] servicesList", servicesList);
    console.log("[PROFILE] professionalId", professionalId);
  }
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/50 via-background to-background">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted-foreground">
          Cargando perfil...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 via-background to-background">
      {/* Header */}
      <div className="border-b bg-card/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Mi perfil</h1>
                {isProfessional && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Profesional
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Mantén tu perfil actualizado para que se refleje en tu página pública y en tus servicios.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {hasPublicProfile ? (
                <Button variant="outline" asChild>
                  <Link href={`/professionals/${professionalId}`}>
                    Ver perfil público
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Ver perfil público
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.2fr_0.8fr]">
          {/* Main Content */}
          <div className="space-y-6">
            <Card className="border-muted/70 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">Editar perfil</CardTitle>
                    <p className="text-sm text-muted-foreground">Actualiza tus datos personales y profesionales</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Completo {profileCompletion}%</span>
                    <div className="h-2 w-20 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <UserProfileForm />
              </CardContent>
            </Card>

            {isProfessional && (
              <Card className="border-muted/70 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>Servicios ofrecidos</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Lo que agregues aquí aparece en tu perfil público y en la ficha de cada servicio.
                      </p>
                    </div>
                    <Badge variant={user?.professional?.isVerified ? "secondary" : "outline"} className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      {user?.professional?.isVerified ? "Verificado" : "Pendiente"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Título del servicio</label>
                        <Input
                          value={serviceForm.title}
                          onChange={(e) => setServiceForm((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Instalación eléctrica residencial"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Categoría</label>
                        <Select
                          value={serviceForm.categoryId}
                          onValueChange={(value) => setServiceForm((prev) => ({ ...prev, categoryId: value }))}
                          disabled={loadingCategories}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={loadingCategories ? "Cargando categorías..." : "Seleccionar categoría"} />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-auto w-[--radix-select-trigger-width]">
                            {(categories || []).map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descripción</label>
                      <Textarea
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        placeholder="Explica qué incluye el servicio y cómo trabajas."
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Precio (COP)</label>
                        <Input
                          type="number"
                          min={0}
                          step="1000"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="120000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duración (min)</label>
                        <Input
                          type="number"
                          min={15}
                          max={480}
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm((prev) => ({ ...prev, duration: Number(e.target.value) }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Etiquetas (coma separadas)</label>
                        <Input
                          value={serviceForm.tags}
                          onChange={(e) => setServiceForm((prev) => ({ ...prev, tags: e.target.value }))}
                          placeholder="urgente, instalación, hogar"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          Imágenes del servicio
                        </label>
                        <span className="text-xs text-muted-foreground">PNG/JPEG/WebP, máx 5MB, hasta {FILE_CONFIG.maxImagesPerService}.</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          className="hidden"
                          id="service-images-input"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (!files.length) return;

                            const currentCount = serviceForm.images.length + pendingServiceFiles.length;
                            if (currentCount + files.length > FILE_CONFIG.maxImagesPerService) {
                              setServiceUploadError(`Máximo ${FILE_CONFIG.maxImagesPerService} imágenes por servicio.`);
                              e.target.value = "";
                              return;
                            }

                            const validFiles: File[] = [];
                            for (const f of files) {
                              const validation = validateFile(f, FileCategory.SERVICE_IMAGE);
                              if (!validation.isValid) {
                                setServiceUploadError(validation.error || "Archivo no válido");
                                continue;
                              }
                              validFiles.push(f);
                            }

                            if (!validFiles.length) {
                              e.target.value = "";
                              return;
                            }

                            const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
                            setPendingServiceFiles((prev) => [...prev, ...validFiles]);
                            setPendingServicePreviews((prev) => [...prev, ...newPreviews]);
                            setServiceUploadError(null);
                            e.target.value = "";
                          }}
                        />
                        <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById("service-images-input")?.click()} disabled={serviceUploading}>
                          {serviceUploading ? "Subiendo..." : "Elegir imágenes"}
                        </Button>
                        {(pendingServiceFiles.length > 0 || serviceForm.images.length > 0) && (
                          <span className="text-xs text-muted-foreground">
                            {pendingServiceFiles.length + serviceForm.images.length} / {FILE_CONFIG.maxImagesPerService}
                          </span>
                        )}
                      </div>

                      {serviceUploadError && (
                        <p className="text-sm text-destructive">{serviceUploadError}</p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {pendingServicePreviews.map((url, idx) => (
                          <div key={`pending-${idx}`} className="relative h-20 w-28 overflow-hidden rounded-lg border">
                            <img src={url} alt={`pending-${idx}`} className="h-full w-full object-cover" />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="absolute right-1 top-1 h-6 w-6 rounded-full bg-background/80"
                              onClick={() => {
                                setPendingServiceFiles((prev) => prev.filter((_, i) => i !== idx));
                                setPendingServicePreviews((prev) => {
                                  const copy = [...prev];
                                  const [removed] = copy.splice(idx, 1);
                                  if (removed) URL.revokeObjectURL(removed);
                                  return copy;
                                });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        {serviceForm.images.map((url, idx) => (
                          <div key={`existing-${idx}`} className="relative h-20 w-28 overflow-hidden rounded-lg border">
                            <img src={url} alt={`img-${idx}`} className="h-full w-full object-cover" />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="absolute right-1 top-1 h-6 w-6 rounded-full bg-background/80"
                              onClick={() => {
                                setServiceForm((prev) => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== idx),
                                }));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      {editingServiceId && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setEditingServiceId(null);
                            setServiceForm(emptyServiceForm);
                            setPendingServiceFiles([]);
                            pendingServicePreviews.forEach((url) => URL.revokeObjectURL(url));
                            setPendingServicePreviews([]);
                            setServiceUploadError(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {editingServiceId
                          ? updateServiceMutation.isPending ? "Actualizando..." : "Guardar cambios"
                          : createServiceMutation.isPending ? "Guardando..." : "Agregar servicio"}
                      </Button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Tus servicios</p>
                      <span className="text-xs text-muted-foreground">Aparecen en /professionals y /services</span>
                    </div>

                    {loadingServices ? (
                      <p className="text-sm text-muted-foreground">Cargando servicios...</p>
                    ) : servicesList.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aún no tienes servicios creados.</p>
                    ) : (
                      <div className="space-y-3">
                        {servicesList.map((service) => (
                          <Card key={service.id} className="border-muted/60">
                            <CardContent className="p-4 flex flex-col gap-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold leading-tight">{service.title}</h4>
                                    {service.category?.name && (
                                      <Badge variant="secondary" className="text-xs">
                                        {service.category.name}
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs font-semibold">
                                      {service.price !== undefined ? `$${service.price.toLocaleString("es-CO")}` : "Sin precio"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {service.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Duración: {service.duration} min</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingServiceId(service.id);
                                      setServiceForm({
                                        title: service.title || "",
                                        description: service.description || "",
                                        categoryId: service.category?.id || service.categoryId || "",
                                        price: service.price ?? 0,
                                        duration: service.duration || 60,
                                        tags: (service.tags || []).join(", "),
                                        images: service.images || [],
                                      });
                                      setPendingServiceFiles([]);
                                      setPendingServicePreviews([]);
                                      setServiceUploadError(null);
                                    }}
                                  >
                                    Editar
                                  </Button>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/services/${service.id}`}>Ver ficha</Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-muted/70 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      key={user?.avatar || "fallback-avatar"}
                      src={user?.avatar || ""}
                    />
                    <AvatarFallback>
                      {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold leading-tight">{user?.name || "Tu nombre"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Ubicación</p>
                    <p className="font-medium">Aguachica, Cesar (única zona disponible)</p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{user?.phone || "Agrega tu teléfono"}</p>
                  </div>
                  {isProfessional && (
                    <>
                      <div className="rounded-lg border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <p className="font-medium">{user?.professional?.rating?.toFixed?.(1) || "0.0"}</p>
                      </div>
                      <div className="rounded-lg border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Reseñas</p>
                        <p className="font-medium">{user?.professional?.reviewCount ?? 0}</p>
                      </div>
                    </>
                  )}
                </div>

                {isProfessional && user?.professional?.specialties && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Especialidades</p>
                    <div className="flex flex-wrap gap-2">
                      {user.professional.specialties.map((s, idx) => (
                        <Badge key={idx} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {isProfessional && (
              <Card className="border-muted/70 shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Actualiza tu perfil y se reflejará en tu tarjeta pública.
                  </p>
                  {hasPublicProfile ? (
                    <Button variant="secondary" asChild>
                      <Link href={`/professionals/${professionalId}`}>
                        Ver vista pública
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      Ver vista pública
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}