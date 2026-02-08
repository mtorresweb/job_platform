import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad | Red Profesional",
  description: "Cómo gestionamos tus datos en Red Profesional.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Política de Privacidad</h1>
        </div>
        <p className="text-muted-foreground">Última actualización: 8 de febrero de 2026</p>
        <p className="text-muted-foreground mt-2">
          Explicamos de forma clara qué datos usamos para operar Red Profesional y cómo puedes
          gestionar tu información.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>1. Datos que recopilamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Lo que nos compartes:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Datos de cuenta: nombre, correo y contraseña.</li>
                <li>Información de perfil y portafolio.</li>
                <li>Mensajes y reseñas dentro de la plataforma.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Lo que se genera automáticamente:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>IP, tipo de dispositivo y navegador.</li>
                <li>Actividad básica de uso (páginas visitadas, tiempo de sesión).</li>
                <li>Cookies y tecnologías similares (ver Política de Cookies).</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>2. Para qué usamos tus datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Operar tu cuenta y mostrar tu perfil a otros usuarios.</li>
              <li>Facilitar contacto y mensajería entre profesionales y clientes.</li>
              <li>Mantener seguridad, prevenir abuso y cumplir la ley.</li>
              <li>Enviar avisos de servicio y novedades relevantes (puedes darte de baja).</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>3. Cómo compartimos la información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>No vendemos tu información personal.</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Se muestra a otros usuarios lo que publiques en tu perfil y reseñas.</li>
              <li>Usamos proveedores de infraestructura y analítica básica para operar el sitio.</li>
              <li>Podemos compartir datos si la ley lo exige o para proteger derechos.</li>
              <li>Solo con tu consentimiento para casos adicionales.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>4. Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Aplicamos medidas razonables (cifrado en tránsito, controles de acceso y monitoreo básico).</p>
            <p className="text-sm text-muted-foreground">
              Ningún sistema es infalible. Usa contraseñas seguras y evita compartir datos sensibles por chat.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Retención</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Conservamos tus datos mientras tengas cuenta o sea necesario para cumplir obligaciones legales.</p>
            <p>Puedes solicitar eliminación; borraremos lo posible salvo requisitos legales o de seguridad.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Tus derechos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Puedes acceder, actualizar o solicitar eliminación de tus datos.</p>
            <p>Usa las opciones disponibles en tu cuenta; si habilitamos un canal específico dentro de la plataforma para ejercer derechos, lo indicaremos ahí.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Menores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Red Profesional está dirigida a mayores de 18 años. Si detectamos datos de menores, los eliminamos.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Contacto y cambios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Comunicaremos cambios materiales a través de la plataforma.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Ley aplicable y protección de datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Esta política se interpreta conforme a la legislación de Colombia, incluyendo la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas sobre protección de datos personales que resulten aplicables.</p>
          </CardContent>
        </Card>

        <Separator className="my-8" />
        <p className="text-center text-muted-foreground text-sm">
          Esta política complementa nuestros Términos y Política de Cookies.
        </p>
      </div>
    </div>
  );
}
