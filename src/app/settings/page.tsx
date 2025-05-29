"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Star,   MapPin, 
  Camera,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage] = useState("");
  
  // Mock user data - replace with real data from your auth system
  const [profile, setProfile] = useState({
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+34 666 123 456",
    location: "Madrid, España",
    bio: "Profesional del diseño gráfico con más de 8 años de experiencia. Especializada en branding e identidad corporativa.",
    profession: "Diseñadora Gráfica",
    hourlyRate: "45",
    availability: "disponible"
  });

  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailBookings: true,
    emailReviews: false,
    pushMessages: true,
    pushBookings: true,
    pushReviews: true,
    smsReminders: false,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    showLastActive: true
  });

  const handleProfileUpdate = () => {
    // Handle profile update logic here
    console.log("Profile updated:", profile);
  };

  const handleNotificationUpdate = () => {
    // Handle notification preferences update
    console.log("Notifications updated:", notifications);
  };

  const handlePrivacyUpdate = () => {
    // Handle privacy settings update
    console.log("Privacy updated:", privacy);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil, notificaciones y preferencias de privacidad
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Facturación
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
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileImage} />
                  <AvatarFallback className="text-lg">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="mb-2">
                    <Camera className="h-4 w-4 mr-2" />
                    Cambiar Foto
                  </Button>
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
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Tarifa por Hora (€)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})}
                  />
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
              </div>

              <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.9</div>
                  <div className="flex justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 5 ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">Calificación</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">127</div>
                  <div className="text-sm text-muted-foreground">Trabajos Completados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2.1</div>
                  <div className="text-sm text-muted-foreground">Tiempo Respuesta (h)</div>
                </div>
              </div>
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
                    </div>
                    <Switch
                      checked={notifications.emailMessages}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, emailMessages: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Reservas y Citas</div>
                      <div className="text-sm text-muted-foreground">
                        Confirmaciones y cambios en reservas
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailBookings}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, emailBookings: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Nuevas Reseñas</div>
                      <div className="text-sm text-muted-foreground">
                        Cuando recibas una nueva reseña
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailReviews}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, emailReviews: checked})
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
                    </div>
                    <Switch
                      checked={notifications.pushMessages}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, pushMessages: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Recordatorios de Citas</div>
                      <div className="text-sm text-muted-foreground">
                        30 minutos antes de cada cita
                      </div>
                    </div>
                    <Switch
                      checked={notifications.pushBookings}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, pushBookings: checked})
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
                    </div>
                    <Switch
                      checked={notifications.smsReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, smsReminders: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Emails de Marketing</div>
                      <div className="text-sm text-muted-foreground">
                        Ofertas especiales y novedades
                      </div>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, marketingEmails: checked})
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleNotificationUpdate} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Guardar Preferencias
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
              </div>

              <Button onClick={handlePrivacyUpdate} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Facturación</CardTitle>
              <CardDescription>
                Gestiona tus métodos de pago y facturación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Methods */}
              <div className="space-y-4">
                <h4 className="font-medium">Métodos de Pago</h4>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div>
                        <div className="font-medium">•••• •••• •••• 4242</div>
                        <div className="text-sm text-muted-foreground">Expira 12/27</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Principal</Badge>
                  </div>
                </div>
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Agregar Método de Pago
                </Button>
              </div>

              <Separator />

              {/* Billing History */}
              <div className="space-y-4">
                <h4 className="font-medium">Historial de Facturación</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Comisión Marzo 2025</div>
                      <div className="text-sm text-muted-foreground">Trabajo: Diseño Logo</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">€45.00</div>
                      <div className="text-sm text-muted-foreground">15 Mar 2025</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Comisión Febrero 2025</div>
                      <div className="text-sm text-muted-foreground">Trabajo: Branding Completo</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">€120.00</div>
                      <div className="text-sm text-muted-foreground">28 Feb 2025</div>
                    </div>
                  </div>
                </div>
                <Button variant="outline">
                  Ver Historial Completo
                </Button>
              </div>

              <Separator />

              {/* Tax Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Información Fiscal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-id">NIF/CIF</Label>
                    <Input
                      id="tax-id"
                      placeholder="Ingresa tu NIF o CIF"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nombre Comercial</Label>
                    <Input
                      id="business-name"
                      placeholder="Nombre de tu empresa (opcional)"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-address">Dirección de Facturación</Label>
                  <Textarea
                    id="billing-address"
                    placeholder="Dirección completa para facturación"
                    rows={3}
                  />
                </div>
                <Button className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Información Fiscal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
