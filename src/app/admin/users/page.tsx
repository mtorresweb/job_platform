"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/infrastructure/auth/useUserRole";
import { apiClient } from "@/shared/utils/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { isAdmin, status, user } = useUserRole();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; phone?: string | null; role: string; isActive: boolean; createdAt: string; lastLoginAt: string | null }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [total, setTotal] = useState(0);
  const PAGE_LIMIT = 10;

  const handleChange = (field: "name" | "email" | "password", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchUsers = async (search?: string) => {
    try {
      setLoadingUsers(true);
      const qValue = search !== undefined ? search : query;
      const res = await apiClient.get<{ data: typeof users; pagination?: { total?: number } }>(API_ENDPOINTS.ADMIN.CREATE_ADMIN, {
        q: qValue,
        limit: PAGE_LIMIT,
      });
      setUsers(res.data || []);
      setTotal(res.pagination?.total || (res.data ? res.data.length : 0));
    } catch (error: any) {
      toast.error(error?.message || "No se pudieron cargar los usuarios");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post(API_ENDPOINTS.ADMIN.CREATE_ADMIN, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success("Administrador creado");
      setForm({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "No se pudo crear el administrador");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    if (user?.id === userId && !isActive) {
      toast.error("No puedes desactivar tu propia cuenta");
      return;
    }
    try {
      await apiClient.patch(API_ENDPOINTS.ADMIN.CREATE_ADMIN, { userId, isActive });
      toast.success(`Usuario ${isActive ? "activado" : "desactivado"}`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive } : u)));
    } catch (error: any) {
      toast.error(error?.message || "No se pudo actualizar el usuario");
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Esta sección es solo para administradores.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Crear administrador</h1>
          <p className="text-muted-foreground mt-2">
            Los administradores pueden crear otros administradores, gestionar usuarios y ver la actividad de la plataforma.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear administrador"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-14 space-y-6 border-t pt-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Usuarios</h2>
              <p className="text-sm text-muted-foreground">Busca y activa/desactiva usuarios existentes (máximo {PAGE_LIMIT} por página).</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre, correo o teléfono"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72"
              />
              <Button variant="secondary" onClick={() => fetchUsers()} disabled={loadingUsers}>
                {loadingUsers ? "Buscando..." : "Buscar"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  fetchUsers("");
                }}
                disabled={loadingUsers}
              >
                Limpiar
              </Button>
            </div>
          </div>

          <Card className="mt-2">
            <CardContent>
              {loadingUsers ? (
                <div className="space-y-2">
                  {[1,2,3,4,5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground">No se encontraron usuarios.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mostrando {users.length} de {total} usuarios</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.phone || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="uppercase text-[11px]">{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                              <div className="flex items-center gap-3">
                                <Badge variant={u.isActive ? "success" : "destructive"}>
                                  {u.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                                {user?.id !== u.id && (
                                  <Switch
                                    checked={u.isActive}
                                    onCheckedChange={(checked) => handleToggleActive(u.id, checked)}
                                    aria-label={u.isActive ? "Desactivar usuario" : "Activar usuario"}
                                  />
                                )}
                              </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
