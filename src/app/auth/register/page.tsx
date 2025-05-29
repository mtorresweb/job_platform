"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUp } from "@/infrastructure/auth/auth-client";
import { registerSchema } from "@/shared/utils/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/shared/types";
import type { RegisterFormData } from "@/shared/types";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: UserRole.CLIENT,
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        setError(result.error.message || "Error al crear la cuenta");
        return;
      }

      // TODO: Store role in separate API call or user profile update
      // For now, we'll assume role is handled elsewhere or in user profile

      toast.success(
        "¡Cuenta creada exitosamente! Revisa tu correo para verificar tu cuenta.",
      );
      router.push("/auth/verify-email?email=" + encodeURIComponent(data.email));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error inesperado al crear la cuenta";
      setError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);    }
  };

  const watchedRole = form.watch("role");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Únete a nuestra plataforma de servicios profesionales
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Tu nombre completo"
                {...form.register("name")}
                disabled={isLoading}
                className={
                  form.formState.errors.name ? "border-destructive" : ""
                }
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                {...form.register("email")}
                disabled={isLoading}
                className={
                  form.formState.errors.email ? "border-destructive" : ""
                }
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Tipo de cuenta</Label>
              <Select
                value={watchedRole}
                onValueChange={(value) =>
                  form.setValue("role", value as UserRole)
                }
                disabled={isLoading}
              >
                <SelectTrigger
                  className={
                    form.formState.errors.role ? "border-destructive" : ""
                  }
                >
                  <SelectValue placeholder="Selecciona tu tipo de cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.CLIENT}>
                    Cliente - Busco servicios
                  </SelectItem>
                  <SelectItem value={UserRole.PROFESSIONAL}>
                    Profesional - Ofrezco servicios
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  {...form.register("password")}
                  disabled={isLoading}
                  className={
                    form.formState.errors.password ? "border-destructive" : ""
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  {...form.register("confirmPassword")}
                  disabled={isLoading}
                  className={
                    form.formState.errors.confirmPassword
                      ? "border-destructive"
                      : ""
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={form.watch("acceptTerms")}
                  onCheckedChange={(checked) =>
                    form.setValue("acceptTerms", !!checked)
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="acceptTerms" className="text-sm leading-none">
                  Acepto los{" "}
                  <Link
                    href="/legal/terms"
                    className="text-primary underline-offset-4 hover:underline"
                    target="_blank"
                  >
                    términos y condiciones
                  </Link>
                </Label>
              </div>
              {form.formState.errors.acceptTerms && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.acceptTerms.message}
                </p>
              )}{" "}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptPrivacy"
                  checked={form.watch("acceptPrivacy")}
                  onCheckedChange={(checked) =>
                    form.setValue("acceptPrivacy", !!checked)
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="acceptPrivacy" className="text-sm leading-none">
                  Acepto la{" "}
                  <Link
                    href="/legal/privacy"
                    className="text-primary underline-offset-4 hover:underline"
                    target="_blank"
                  >
                    política de privacidad
                  </Link>
                </Label>
              </div>{" "}
              {form.formState.errors.acceptPrivacy && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.acceptPrivacy.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
            </span>
            <Link
              href="/auth/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
