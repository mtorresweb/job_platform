"use client";

import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  professionalProfileSchema,
  updateProfileSchema,
} from "@/shared/utils/validations";
import type { ProfileUpdateData } from "@/shared/types";

// Opciones de especialidades predefinidas
const SPECIALTY_OPTIONS = [
  { value: "plomeria", label: "Plomería" },
  { value: "electricidad", label: "Electricidad" },
  { value: "carpinteria", label: "Carpintería" },
  { value: "pintura", label: "Pintura" },
  { value: "jardineria", label: "Jardinería" },
  { value: "tecnologia", label: "Tecnología" },
];

export function UserProfileForm() {
  const { isProfessional: sessionIsProfessional } = useUserRole();
  const { data: currentUser, isLoading } = useCurrentUser();
  const isProfessional = sessionIsProfessional || currentUser?.role === "PROFESSIONAL";
  const { mutate: updateProfile, status } = useUpdateProfile();
  const isUpdating = status === 'pending';
  
  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(
      isProfessional ? professionalProfileSchema : updateProfileSchema,
    ),
    defaultValues: {
      name: "",
      avatar: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Colombia",
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
      city: currentUser.city || professional?.city || "",
      state: currentUser.state || professional?.state || "",
      zipCode: currentUser.zipCode || professional?.zipCode || "",
      country: professional?.country || "Colombia",
      ...(isProfessional
        ? {
            bio: professional?.bio || "",
            experience: professional?.experience || 0,
            specialties: professional?.specialties || [],
          }
        : {}),
    });
  }, [currentUser, form, isProfessional]);

  async function onSubmit(values: ProfileUpdateData) {
    const payload: ProfileUpdateData = {
      ...values,
      avatar: typeof values.avatar === "string" ? values.avatar.trim() : values.avatar,
    };
    try {
      await updateProfile(payload);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
    }
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
                <FormLabel>URL de avatar</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://..." />
                </FormControl>
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

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código postal</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Colombia" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                      <Select
                        onValueChange={(value) => {
                          const specialties = field.value || [];
                          if (!specialties.includes(value)) {
                            field.onChange([...specialties, value]);
                          }
                        }}
                        value=""
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar especialidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          align="start"
                          className="max-h-60 overflow-auto w-[--radix-select-trigger-width]"
                        >
                          {SPECIALTY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-2 flex flex-wrap gap-2">
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