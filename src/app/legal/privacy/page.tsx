import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, UserCheck, Database, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad | JobPlatform',
  description: 'Política de privacidad y protección de datos de JobPlatform.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Política de Privacidad</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Última actualización: 8 de junio de 2025
        </p>
        <p className="text-muted-foreground mt-2">
          En JobPlatform, protegemos su privacidad y somos transparentes sobre cómo recopilamos, 
          usamos y protegemos su información personal.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>1. Información que Recopilamos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Información que usted proporciona:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Datos de registro (nombre, email, teléfono)</li>
                <li>Información de perfil profesional</li>
                <li>Comunicaciones y mensajes en la plataforma</li>
                <li>Reseñas y calificaciones</li>
                <li>Información de soporte al cliente</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Información recopilada automáticamente:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dirección IP y ubicación aproximada</li>
                <li>Información del dispositivo y navegador</li>
                <li>Páginas visitadas y tiempo de uso</li>
                <li>Cookies y tecnologías similares</li>
                <li>Logs de actividad en la plataforma</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Información de terceros:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Datos de redes sociales (si se conecta con ellas)</li>
                <li>Información de verificación de identidad</li>
                <li>Datos de servicios de mapas y geolocalización</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>2. Cómo Utilizamos su Información</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Propósitos principales:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Facilitar conexiones entre clientes y profesionales</li>
                <li>Crear y mantener perfiles de usuario</li>
                <li>Procesar y gestionar reservas</li>
                <li>Facilitar comunicaciones en la plataforma</li>
                <li>Verificar identidad y prevenir fraude</li>
                <li>Proporcionar soporte al cliente</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Mejora del servicio:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Personalizar su experiencia en la plataforma</li>
                <li>Analizar uso y patrones para mejorar funcionalidades</li>
                <li>Desarrollar nuevas características</li>
                <li>Realizar investigación y análisis</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Comunicaciones:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Enviar notificaciones importantes del servicio</li>
                <li>Responder a consultas y solicitudes</li>
                <li>Enviar actualizaciones de seguridad</li>
                <li>Comunicaciones promocionales (con su consentimiento)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <CardTitle>3. Compartir Información</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold text-green-700">
              No vendemos ni alquilamos su información personal a terceros.
            </p>
            
            <div>
              <h4 className="font-semibold mb-2">Compartimos información únicamente:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Con otros usuarios:</strong> Información de perfil visible públicamente</li>
                <li><strong>Proveedores de servicios:</strong> Para funcionalidades técnicas necesarias</li>
                <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley</li>
                <li><strong>Protección de derechos:</strong> Para prevenir fraude o abuso</li>
                <li><strong>Consentimiento:</strong> Cuando usted autorice expresamente</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-800 mb-2">Información visible en su perfil:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700">
                <li>Nombre e información profesional</li>
                <li>Servicios ofrecidos y descripciones</li>
                <li>Reseñas y calificaciones recibidas</li>
                <li>Ubicación general (ciudad)</li>
                <li>Información de contacto autorizada</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>4. Seguridad de Datos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Implementamos medidas de seguridad técnicas, administrativas y físicas para 
              proteger su información personal contra acceso no autorizado, pérdida o mal uso.
            </p>

            <div>
              <h4 className="font-semibold mb-2">Medidas de seguridad:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encriptación de datos en tránsito y en reposo</li>
                <li>Autenticación de dos factores disponible</li>
                <li>Acceso limitado a datos personales</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Actualizaciones regulares de seguridad</li>
                <li>Auditorías de seguridad periódicas</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
              <p className="text-orange-800">
                <strong>Importante:</strong> Ningún sistema es 100% seguro. Le recomendamos 
                mantener segura su contraseña y no compartir información sensible por mensajes 
                en la plataforma.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Sus Derechos de Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Usted tiene los siguientes derechos sobre su información personal:</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Acceso y Portabilidad</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Solicitar copia de sus datos</li>
                  <li>Exportar información en formato estándar</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Rectificación</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Corregir información inexacta</li>
                  <li>Actualizar datos obsoletos</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Eliminación</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Solicitar eliminación de datos</li>
                  <li>Cancelar cuenta permanentemente</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Limitación</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Restringir ciertos usos</li>
                  <li>Oponerse al procesamiento</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <p className="text-green-800">
                Para ejercer cualquiera de estos derechos, contáctenos en: 
                <strong> privacy@jobplatform.com</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Cookies y Tecnologías de Seguimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Utilizamos cookies y tecnologías similares para mejorar su experiencia, 
              analizar el uso del sitio y personalizar contenido.
            </p>

            <div>
              <h4 className="font-semibold mb-2">Tipos de cookies que utilizamos:</h4>
              <div className="space-y-3">
                <div>
                  <strong>Cookies esenciales:</strong>
                  <p className="text-sm text-muted-foreground">
                    Necesarias para el funcionamiento básico de la plataforma
                  </p>
                </div>
                <div>
                  <strong>Cookies de rendimiento:</strong>
                  <p className="text-sm text-muted-foreground">
                    Nos ayudan a entender cómo los usuarios interactúan con el sitio
                  </p>
                </div>
                <div>
                  <strong>Cookies de funcionalidad:</strong>
                  <p className="text-sm text-muted-foreground">
                    Recuerdan sus preferencias y personalizan su experiencia
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm">
              Puede gestionar sus preferencias de cookies en cualquier momento a través 
              de la configuración de su navegador o nuestro centro de preferencias.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Retención de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Conservamos su información personal durante el tiempo necesario para 
              proporcionar nuestros servicios y cumplir con obligaciones legales.
            </p>

            <div>
              <h4 className="font-semibold mb-2">Períodos de retención:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Cuenta activa:</strong> Mientras mantenga su cuenta</li>
                <li><strong>Cuenta cerrada:</strong> Hasta 2 años después del cierre</li>
                <li><strong>Comunicaciones:</strong> 3 años para soporte y resolución de disputas</li>
                <li><strong>Logs técnicos:</strong> 12 meses para seguridad y análisis</li>
                <li><strong>Información legal:</strong> Según requerimientos legales aplicables</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Privacidad de Menores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              JobPlatform no está dirigida a menores de 18 años. No recopilamos 
              intencionalmente información personal de menores de edad.
            </p>
            <p>
              Si nos enteramos de que hemos recopilado información de un menor, 
              eliminaremos esa información inmediatamente. Si cree que un menor 
              ha proporcionado información personal, contáctenos de inmediato.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Transferencias Internacionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Sus datos pueden ser transferidos y procesados en países fuera de Colombia. 
              En tales casos, implementamos salvaguardas adecuadas para proteger su información.
            </p>
            <p>
              Estas salvaguardas incluyen cláusulas contractuales estándar y certificaciones 
              de privacidad reconocidas internacionalmente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>10. Contacto y Actualizaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Para consultas sobre privacidad:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email: privacy@jobplatform.com</li>
                <li>Teléfono: +57 (1) 234-5678</li>
                <li>Formulario de contacto en nuestra página de soporte</li>
              </ul>
            </div>

            <p>
              Nos comprometemos a responder a sus consultas de privacidad dentro de 
              30 días hábiles.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-blue-800">
                <strong>Actualizaciones:</strong> Le notificaremos sobre cambios 
                significativos en esta política a través de email o notificaciones 
                en la plataforma.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />
        
        <div className="text-center text-muted-foreground">
          <p>
            Esta Política de Privacidad complementa nuestros Términos y Condiciones 
            y forma parte integral de nuestro compromiso con la protección de su privacidad.
          </p>
        </div>
      </div>
    </div>
  );
}
