"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Bell, 
  Shield, 
  Star,   
  MapPin, 
  Camera,
  Save,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser, useUserRole } from "@/infrastructure/auth/auth-client";
import { useProfessionalStats } from "@/shared/hooks/useProfessionals";
import { useFileUpload, FileCategory } from "@/shared/hooks/useFileUpload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/utils/api-client";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();  // Auth hooks
  const user = useCurrentUser();
  const {  isAuthenticated } = useUserRole();// API hooks
  const { data: professionalStats, isLoading: statsLoading } = useProfessionalStats(user?.id || "");
  const { uploadFile, isUploading } = useFileUpload(FileCategory.AVATAR);  // Local state for form data
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    profession: "",
    availability: "disponible",
    avatar: ""
  });const [notificationPrefs, setNotificationPrefs] = useState({
    emailMessages: true,
    emailBookings: true,
    emailReviews: false,
    pushMessages: true,
    pushBookings: true,
    pushReviews: true,
    smsReminders: false,
    marketingEmails: false
  });  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    showLastActive: true
  });
  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        // We'll need to fetch extended profile data from API
      }));
    }
  }, [user]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profile) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await apiClient.put(`/api/users/${user.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Perfil actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    }
  });  // Notification settings update mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (settings: typeof notificationPrefs) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await apiClient.put(`/api/users/${user.id}/notification-settings`, settings);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Preferencias de notificación actualizadas");
    },
    onError: (error) => {
      console.error("Error updating notifications:", error);
      toast.error("Error al actualizar las notificaciones");
    }
  });
  // Privacy settings update mutation
  const updatePrivacyMutation = useMutation({
    mutationFn: async (settings: typeof privacy) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await apiClient.put(`/api/users/${user.id}/privacy-settings`, settings);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Configuración de privacidad actualizada");
    },
    onError: (error) => {
      console.error("Error updating privacy:", error);
      toast.error("Error al actualizar la privacidad");
    }  });

  // Handle profile picture upload
  const handleProfilePictureUpload = async (file: File) => {
    try {
      const uploadedFile = await uploadFile(file);
      
      if (uploadedFile) {
        await updateProfileMutation.mutateAsync({
          ...profile,
          avatar: uploadedFile.url
        });
        toast.success("Foto de perfil actualizada");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Error al subir la foto");
    }
  };

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profile);
  };  const handleNotificationUpdate = () => {
    updateNotificationsMutation.mutate(notificationPrefs);
  };  const handlePrivacyUpdate = () => {
    updatePrivacyMutation.mutate(privacy);
  };

  // Show loading skeleton if user is not loaded
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil, notificaciones y preferencias de privacidad
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidad
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información personal y profesional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">              {/* Profile Picture */}              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar || user?.avatar || ""} />
                  <AvatarFallback className="text-lg">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="profile-picture-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleProfilePictureUpload(file);
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      className="mb-2"
                      disabled={isUploading}
                      onClick={() => document.getElementById('profile-picture-upload')?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 mr-2" />
                      )}
                      {isUploading ? 'Subiendo...' : 'Cambiar Foto'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG o GIF. Máximo 10MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profesión</Label>
                  <Input
                    id="profession"
                    value={profile.profession}
                    onChange={(e) => setProfile({...profile, profession: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía Profesional</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe tu experiencia, especialidades y lo que te diferencia..."
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={4}
                />
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label htmlFor="availability">Estado de Disponibilidad</Label>
                <Select
                  value={profile.availability}
                  onValueChange={(value) => setProfile({...profile, availability: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu disponibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        Disponible
                      </div>
                    </SelectItem>
                    <SelectItem value="ocupado">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                        Ocupado
                      </div>
                    </SelectItem>
                    <SelectItem value="no-disponible">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-red-500 rounded-full" />
                        No Disponible
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>              <Button 
                onClick={handleProfileUpdate} 
                className="w-full md:w-auto"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>

          {/* Professional Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Profesionales</CardTitle>
              <CardDescription>
                Tu rendimiento en la plataforma
              </CardDescription>
            </CardHeader>            <CardContent>
              {statsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center space-y-2">
                      <Skeleton className="h-8 w-16 mx-auto" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : (                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {professionalStats?.avgRating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="flex justify-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(professionalStats?.avgRating || 0) 
                              ? "text-yellow-400 fill-current" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">Calificación</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {professionalStats?.completedBookings || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Trabajos Completados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {professionalStats?.completionRate ? `${Math.round(professionalStats.completionRate)}%` : "0%"}
                    </div>
                    <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {professionalStats?.responseTime || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Tiempo Respuesta</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notificaciones por Email</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Nuevos Mensajes</div>
                      <div className="text-sm text-muted-foreground">
                        Recibe emails cuando tengas nuevos mensajes
                      </div>
                    </div>                    <Switch
                      checked={notificationPrefs.emailMessages}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, emailMessages: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Reservas y Citas</div>
                      <div className="text-sm text-muted-foreground">
                        Confirmaciones y cambios en reservas
                      </div>
                    </div>                    <Switch
                      checked={notificationPrefs.emailBookings}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, emailBookings: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Nuevas Reseñas</div>
                      <div className="text-sm text-muted-foreground">
                        Cuando recibas una nueva reseña
                      </div>
                    </div>                    <Switch
                      checked={notificationPrefs.emailReviews}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, emailReviews: checked})
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notificaciones Push</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Mensajes Instantáneos</div>
                      <div className="text-sm text-muted-foreground">
                        Notificaciones en tiempo real
                      </div>
                    </div>                    <Switch
                      checked={notificationPrefs.pushMessages}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, pushMessages: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Recordatorios de Citas</div>
                      <div className="text-sm text-muted-foreground">
                        30 minutos antes de cada cita
                      </div>
                    </div>                    <Switch
                      checked={notificationPrefs.pushBookings}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, pushBookings: checked})
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Otras Comunicaciones</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">SMS Recordatorios</div>
                      <div className="text-sm text-muted-foreground">
                        Recordatorios importantes por SMS
                      </div>
                    </div>                    <Switch
                      checked={notificationPrefs.smsReminders}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, smsReminders: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Emails de Marketing</div>
                      <div className="text-sm text-muted-foreground">
                        Ofertas especiales y novedades
                      </div>
                    </div>                    <Switch
                      checked={notificationPrefs.marketingEmails}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, marketingEmails: checked})
                      }
                    />
                  </div>
                </div>
              </div>              <Button 
                onClick={handleNotificationUpdate} 
                className="w-full md:w-auto"
                disabled={updateNotificationsMutation.isPending}
              >
                {updateNotificationsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {updateNotificationsMutation.isPending ? 'Guardando...' : 'Guardar Preferencias'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Privacidad</CardTitle>
              <CardDescription>
                Controla quién puede ver tu información
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Visibilidad del Perfil</h4>
                <Select
                  value={privacy.profileVisibility}
                  onValueChange={(value) => setPrivacy({...privacy, profileVisibility: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la visibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público - Visible para todos</SelectItem>
                    <SelectItem value="registered">Solo usuarios registrados</SelectItem>
                    <SelectItem value="private">Privado - Solo contactos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Información de Contacto</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Mostrar Email</div>
                      <div className="text-sm text-muted-foreground">
                        Permite que otros vean tu email
                      </div>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, showEmail: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Mostrar Teléfono</div>
                      <div className="text-sm text-muted-foreground">
                        Permite que otros vean tu teléfono
                      </div>
                    </div>
                    <Switch
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, showPhone: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Última Actividad</div>
                      <div className="text-sm text-muted-foreground">
                        Mostrar cuándo estuviste activo por última vez
                      </div>
                    </div>
                    <Switch
                      checked={privacy.showLastActive}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, showLastActive: checked})
                      }
                    />
                  </div>
                </div>
              </div>              <Button 
                onClick={handlePrivacyUpdate} 
                className="w-full md:w-auto"
                disabled={updatePrivacyMutation.isPending}
              >
                {updatePrivacyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {updatePrivacyMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
              <CardDescription>
                Mantén tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña Actual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Ingresa una nueva contraseña"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>

              <Button variant="outline" className="w-full md:w-auto">
                Cambiar Contraseña
              </Button>
            </CardContent>        </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
