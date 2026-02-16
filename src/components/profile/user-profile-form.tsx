"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { useUpdateProfile } from "@/shared/hooks/useUpdateProfile";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  professionalProfileSchema,
  updateProfileSchema,
} from "@/shared/utils/validations";
import type { ProfileUpdateData } from "@/shared/types";
import { fileUploadService, FileCategory, validateFile } from "@/shared/utils/file-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Opciones de especialidades predefinidas agrupadas
const SPECIALTY_GROUPS = [
  {
    label: "Servicios varios",
    options: [
      { value: "plomeria", label: "Plomería" },
      { value: "electricidad", label: "Electricidad" },
      { value: "carpinteria", label: "Carpintería" },
      { value: "pintura", label: "Pintura" },
      { value: "jardineria", label: "Jardinería" },
      { value: "limpieza", label: "Limpieza" },
      { value: "mantenimiento-general", label: "Mantenimiento general" },
      { value: "tecnologia", label: "Tecnología" },
      { value: "construccion", label: "Construcción" },
      { value: "albanileria", label: "Albañilería" },
      { value: "cerrajeria", label: "Cerrajería" },
      { value: "soldadura", label: "Soldadura" },
      { value: "tapiceria", label: "Tapicería" },
      { value: "montaje-mobiliario", label: "Montaje de mobiliario" },
      { value: "fumigacion", label: "Fumigación" },
      { value: "domotica", label: "Domótica" },
      { value: "piscinas", label: "Mantenimiento de piscinas" },
    ],
  },
  {
    label: "Técnicos",
    options: [
      { value: "tecnico-electricista", label: "Técnico electricista" },
      { value: "tecnico-refrigeracion", label: "Técnico en refrigeración" },
      { value: "tecnico-automotriz", label: "Técnico automotriz" },
      { value: "tecnico-sistemas", label: "Técnico en sistemas" },
      { value: "tecnico-redes", label: "Técnico en redes" },
      { value: "tecnico-cctv", label: "Técnico CCTV" },
      { value: "tecnico-fibra", label: "Técnico en fibra óptica" },
      { value: "tecnico-telefonia", label: "Técnico en telefonía" },
      { value: "tecnico-ascensores", label: "Técnico de ascensores" },
      { value: "tecnico-solar", label: "Técnico en paneles solares" },
      { value: "tecnico-electrodomesticos", label: "Técnico en electrodomésticos" },
    ],
  },
  {
    label: "Tecnólogos",
    options: [
      { value: "tecnologo-mantenimiento", label: "Tecnólogo en mantenimiento" },
      { value: "tecnologo-sistemas", label: "Tecnólogo en sistemas" },
      { value: "tecnologo-logistica", label: "Tecnólogo en logística" },
      { value: "tecnologo-salud-ocupacional", label: "Tecnólogo en salud ocupacional" },
      { value: "tecnologo-multimedia", label: "Tecnólogo en multimedia" },
      { value: "tecnologo-gastronomia", label: "Tecnólogo en gastronomía" },
      { value: "tecnologo-finanzas", label: "Tecnólogo en finanzas" },
      { value: "tecnologo-mercadeo", label: "Tecnólogo en mercadeo" },
      { value: "tecnologo-desarrollo-web", label: "Tecnólogo en desarrollo web" },
      { value: "tecnologo-redes", label: "Tecnólogo en redes" },
    ],
  },
  {
    label: "Pregrado",
    options: [
      { value: "pregrado-administracion", label: "Pregrado en Administración" },
      { value: "pregrado-ingenieria", label: "Pregrado en Ingeniería" },
      { value: "pregrado-contaduria", label: "Pregrado en Contaduría" },
      { value: "pregrado-psicologia", label: "Pregrado en Psicología" },
      { value: "pregrado-derecho", label: "Pregrado en Derecho" },
      { value: "pregrado-enfermeria", label: "Pregrado en Enfermería" },
      { value: "pregrado-arquitectura", label: "Pregrado en Arquitectura" },
      { value: "pregrado-marketing", label: "Pregrado en Marketing" },
      { value: "pregrado-turismo", label: "Pregrado en Turismo" },
      { value: "pregrado-diseno", label: "Pregrado en Diseño gráfico" },
      { value: "pregrado-economia", label: "Pregrado en Economía" },
    ],
  },
  {
    label: "Posgrado",
    options: [
      { value: "posgrado-mba", label: "Posgrado / MBA" },
      { value: "posgrado-gerencia", label: "Especialización en Gerencia" },
      { value: "posgrado-ingenieria", label: "Maestría en Ingeniería" },
      { value: "posgrado-educacion", label: "Maestría en Educación" },
      { value: "posgrado-doctorado", label: "Doctorado" },
      { value: "posgrado-finanzas", label: "Maestría en Finanzas" },
      { value: "posgrado-data", label: "Maestría en Ciencia de Datos" },
      { value: "posgrado-marketing", label: "Maestría en Marketing Digital" },
      { value: "posgrado-derecho", label: "Especialización en Derecho" },
      { value: "posgrado-salud-publica", label: "Maestría en Salud Pública" },
      { value: "posgrado-proyectos", label: "Especialización en Gestión de Proyectos" },
    ],
  },
  {
    label: "Certificaciones y títulos",
    options: [
      { value: "certificacion-pmp", label: "Certificación PMP" },
      { value: "certificacion-scrum", label: "Scrum Master" },
      { value: "certificacion-aws", label: "AWS Architect" },
      { value: "certificacion-itil", label: "ITIL" },
      { value: "certificacion-six-sigma", label: "Six Sigma" },
      { value: "certificacion-ccna", label: "Cisco CCNA" },
      { value: "certificacion-azure", label: "Azure Administrator" },
      { value: "certificacion-gcp", label: "Google Cloud Architect" },
      { value: "certificacion-cka", label: "Kubernetes CKA" },
      { value: "certificacion-po", label: "Product Owner" },
      { value: "certificacion-salesforce", label: "Salesforce Admin" },
    ],
  },
];

export function UserProfileForm() {
  const { isProfessional: sessionIsProfessional } = useUserRole();
  const { data: currentUser, isLoading } = useCurrentUser();
  const isProfessional = sessionIsProfessional || currentUser?.role === "PROFESSIONAL";
  const { mutate: updateProfile, status } = useUpdateProfile();
  const isUpdating = status === 'pending';
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(
      isProfessional ? professionalProfileSchema : updateProfileSchema,
    ),
    defaultValues: {
      name: "",
      avatar: "",
      phone: "",
      address: "",
      ...(isProfessional
        ? {
            bio: "",
            experience: 0,
            specialties: [],
          }
        : {}),
    },
  });

  useEffect(() => {
    if (!currentUser) return;

    const professional = currentUser.professional;

    form.reset({
      name: currentUser.name || "",
      avatar: currentUser.avatar || "",
      phone: currentUser.phone || "",
      address: currentUser.address || professional?.address || "",
      ...(isProfessional
        ? {
            bio: professional?.bio || "",
            experience: professional?.experience || 0,
            specialties: professional?.specialties || [],
          }
        : {}),
    });
  }, [currentUser, form, isProfessional]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function onSubmit(values: ProfileUpdateData) {
    setUploadError(null);

    let avatarUrl = typeof values.avatar === "string" ? values.avatar.trim() : values.avatar;

    if (pendingFile) {
      setUploading(true);
      try {
        const uploaded = await fileUploadService.uploadFile(pendingFile, FileCategory.AVATAR, undefined, {
          folder: "avatars",
          maxWidth: 800,
          maxHeight: 800,
          quality: 85,
        });
        avatarUrl = uploaded.url;
      } catch (error) {
        console.error("Error al subir avatar:", error);
        const message = error instanceof Error ? error.message : "No se pudo subir el archivo";
        setUploadError(message);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload: ProfileUpdateData = {
      ...values,
      avatar: avatarUrl || "",
    };

    try {
      await updateProfile(payload);
      if (pendingFile) {
        setPendingFile(null);
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
    }
  }

  async function handleAvatarSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const validation = validateFile(file, FileCategory.AVATAR);
    if (!validation.isValid) {
      setUploadError(validation.error || "Archivo no válido");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    form.setValue("avatar", "", { shouldDirty: true, shouldTouch: true });

    // Reset input value so the same file can be re-selected after removing
    event.target.value = "";
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando perfil...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto de perfil</FormLabel>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={previewUrl || field.value || undefined} alt={form.watch("name") || "Avatar"} />
                    <AvatarFallback>
                      {(form.watch("name") || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleAvatarSelect}
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? "Subiendo..." : "Elegir foto"}
                      </Button>
                      {(previewUrl || field.value) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (previewUrl) URL.revokeObjectURL(previewUrl);
                            setPreviewUrl(null);
                            setPendingFile(null);
                            form.setValue("avatar", "", { shouldDirty: true });
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          Quitar
                        </Button>
                      )}
                    </div>
                    {pendingFile ? (
                      <p className="text-xs text-muted-foreground">Archivo listo para subir: {pendingFile.name}</p>
                    ) : field.value ? (
                      <p className="text-xs text-muted-foreground">Se usará la foto actual.</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Aún no has seleccionado una foto.</p>
                    )}
                    {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
                    <p className="text-xs text-muted-foreground">PNG/JPEG/WebP, máx 5MB. La foto se sube al guardar cambios.</p>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ubicación fija: la plataforma opera sólo en Aguachica, Cesar */}
        </div>

        {/* Professional Fields */}
        {isProfessional && (
          <>
            <Separator />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía profesional</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Años de experiencia</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidades</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span>Buscar y agregar especialidades</span>
                            <span className="text-xs text-muted-foreground">(múltiples)</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[360px] max-h-[320px] p-0" align="start">
                          <Command className="h-[320px] flex flex-col">
                            <CommandInput placeholder="Escribe para buscar" />
                            <CommandList className="flex-1 overflow-y-auto">
                              <CommandEmpty>Sin resultados</CommandEmpty>
                              {SPECIALTY_GROUPS.map((group) => (
                                <CommandGroup key={group.label} heading={group.label}>
                                  {group.options.map((option) => (
                                    <CommandItem
                                      key={option.value}
                                      value={option.label}
                                      onSelect={() => {
                                        const specialties = field.value || [];
                                        if (!specialties.includes(option.label)) {
                                          field.onChange([...specialties, option.label]);
                                        }
                                      }}
                                    >
                                      {option.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {field.value?.map((specialty, index) => (
                          <Button
                            key={index}
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const newSpecialties =
                                field.value?.filter((s) => s !== specialty) || [];
                              field.onChange(newSpecialties);
                            }}
                          >
                            {specialty}
                            <span className="ml-2">×</span>
                          </Button>
                        ))}
                        {(!field.value || field.value.length === 0) && (
                          <p className="text-sm text-muted-foreground">No has agregado especialidades aún.</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Form>
  );
}