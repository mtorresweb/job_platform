import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | JobPlatform',
  description: 'Términos y condiciones de uso de la plataforma de servicios profesionales.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Términos y Condiciones</h1>
        <p className="text-muted-foreground text-lg">
          Última actualización: 8 de junio de 2025
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Aceptación de los Términos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>              Al acceder y utilizar JobPlatform (&quot;la Plataforma&quot;), usted acepta estar sujeto a estos 
              Términos y Condiciones (&quot;Términos&quot;). Si no está de acuerdo con alguna parte de estos
              términos, no debe utilizar nuestra plataforma.
            </p>
            <p>
              Estos Términos constituyen un acuerdo legal vinculante entre usted y JobPlatform. 
              Nos reservamos el derecho de modificar estos términos en cualquier momento, y dichas 
              modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Descripción del Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              JobPlatform es una plataforma digital gratuita que conecta a usuarios que necesitan 
              servicios profesionales con profesionales calificados. Facilitamos la conexión entre 
              ambas partes, pero no somos parte directa de las transacciones comerciales.
            </p>
            <p>
              <strong>Servicios incluidos:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Búsqueda y filtrado de profesionales por categoría y ubicación</li>
              <li>Perfiles detallados de profesionales verificados</li>
              <li>Sistema de reseñas y calificaciones</li>
              <li>Herramientas de comunicación entre usuarios y profesionales</li>
              <li>Gestión de reservas y citas</li>
              <li>Soporte al cliente</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Registro y Cuentas de Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Para utilizar ciertos servicios de la plataforma, debe crear una cuenta proporcionando 
              información precisa, actual y completa. Usted es responsable de mantener la confidencialidad 
              de su cuenta y contraseña.
            </p>
            <p>
              <strong>Tipos de cuenta:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Usuario Cliente:</strong> Busca y contrata servicios profesionales</li>
              <li><strong>Usuario Profesional:</strong> Ofrece servicios a través de la plataforma</li>
            </ul>
            <p>
              Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos 
              o proporcionen información falsa.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Uso Aceptable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Al utilizar JobPlatform, usted se compromete a:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Proporcionar información veraz y actualizada</li>
              <li>Respetar a otros usuarios de la plataforma</li>
              <li>Cumplir con todas las leyes y regulaciones aplicables</li>
              <li>No utilizar la plataforma para actividades ilegales o fraudulentas</li>
              <li>No spam, acosar o enviar contenido ofensivo</li>
              <li>No intentar acceder sin autorización a otras cuentas</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Responsabilidades de los Profesionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Los profesionales que utilizan la plataforma se comprometen a:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Poseer las licencias, certificaciones y seguros necesarios para sus servicios</li>
              <li>Proporcionar servicios de calidad profesional</li>
              <li>Cumplir con los acuerdos establecidos con los clientes</li>
              <li>Mantener actualizada su información de perfil</li>
              <li>Responder de manera oportuna a las consultas</li>
              <li>Respetar las políticas de cancelación establecidas</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Política de Pagos y Tarifas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>JobPlatform es completamente gratuita.</strong> No cobramos comisiones ni tarifas 
              por conectar clientes con profesionales.
            </p>
            <p>
              Todos los acuerdos de pago y términos comerciales se establecen directamente entre 
              el cliente y el profesional. JobPlatform no procesa pagos ni es responsable de 
              disputas relacionadas con pagos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Limitación de Responsabilidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              JobPlatform actúa únicamente como intermediario para facilitar conexiones entre 
              usuarios. No somos responsables por:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>La calidad, seguridad o legalidad de los servicios ofrecidos</li>
              <li>La veracidad de la información proporcionada por los usuarios</li>
              <li>Disputas entre clientes y profesionales</li>
              <li>Daños o pérdidas resultantes del uso de servicios contratados</li>
              <li>Problemas técnicos o interrupciones del servicio</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Propiedad Intelectual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Todo el contenido de JobPlatform, incluyendo pero no limitado a textos, gráficos, 
              logotipos, iconos, imágenes, clips de audio, descargas digitales y software, está 
              protegido por derechos de autor y otras leyes de propiedad intelectual.
            </p>
            <p>
              Los usuarios conservan los derechos sobre el contenido que publican, pero otorgan 
              a JobPlatform una licencia no exclusiva para usar, mostrar y distribuir dicho 
              contenido en la plataforma.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Privacidad y Protección de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Su privacidad es importante para nosotros. El tratamiento de sus datos personales 
              se rige por nuestra Política de Privacidad, que forma parte integral de estos términos.
            </p>
            <p>
              Al utilizar JobPlatform, usted consiente el tratamiento de sus datos según se describe 
              en nuestra Política de Privacidad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Terminación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cualquiera de las partes puede terminar este acuerdo en cualquier momento. 
              Nos reservamos el derecho de suspender o terminar su acceso a la plataforma 
              si viola estos términos.
            </p>
            <p>
              Tras la terminación, su derecho a utilizar la plataforma cesará inmediatamente, 
              pero las disposiciones relacionadas con limitación de responsabilidad y 
              resolución de disputas permanecerán vigentes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Resolución de Disputas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cualquier disputa relacionada con estos términos se resolverá mediante arbitraje 
              vinculante, excepto que usted puede presentar reclamaciones individuales en 
              tribunales de menor cuantía.
            </p>
            <p>
              Estos términos se rigen por las leyes de Colombia, sin consideración a principios 
              de conflicto de leyes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email: legal@jobplatform.com</li>
              <li>Teléfono: +57 (1) 234-5678</li>
              <li>Dirección: Bogotá, Colombia</li>
            </ul>
          </CardContent>
        </Card>

        <Separator className="my-8" />
        
        <div className="text-center text-muted-foreground">
          <p>
            Al continuar utilizando JobPlatform, usted confirma que ha leído, 
            entendido y acepta estos Términos y Condiciones.
          </p>
        </div>
      </div>
    </div>
  );
}
