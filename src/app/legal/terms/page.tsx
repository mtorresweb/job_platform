import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Red Profesional",
  description: "Condiciones de uso de Red Profesional.",
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Términos y Condiciones</h1>
        <p className="text-muted-foreground">Última actualización: 8 de febrero de 2026</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Aceptación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Al usar Red Profesional aceptas estos términos. Si no estás de acuerdo, no uses la
              plataforma. Podemos actualizar los términos y te avisaremos cuando sean cambios
              relevantes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Qué ofrece Red Profesional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Plataforma gratuita para que clientes descubran profesionales y se comuniquen directamente.
              No procesamos pagos ni intervenimos en la relación comercial.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Búsqueda por categorías y perfiles con reseñas.</li>
              <li>Mensajería para coordinar servicios.</li>
              <li>Perfiles y portafolios visibles.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Cuentas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Crea una cuenta con datos correctos y mantén la confidencialidad de tu acceso.</p>
            <p>Podemos suspender cuentas por abuso o información falsa.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Uso aceptable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Respeta a otros usuarios y cumple la ley.</li>
              <li>No envíes spam ni contenido ofensivo.</li>
              <li>No intentes vulnerar la seguridad del sitio.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Profesionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Eres responsable de tus servicios, precios y cumplimiento de requisitos legales o
              habilitaciones que apliquen a tu actividad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Pagos y comisiones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Red Profesional es gratuita. No cobramos comisiones ni procesamos pagos.</p>
            <p>Los acuerdos económicos son directos entre cliente y profesional.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Limitación de responsabilidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Operamos la plataforma, pero no garantizamos ni supervisamos los servicios ofrecidos por
              usuarios. No somos responsables de la calidad, cumplimiento o resultados de esos servicios.
            </p>
            <p>Las decisiones y acuerdos se toman directamente entre clientes y profesionales.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Propiedad intelectual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>El contenido de la plataforma es de Red Profesional o de sus titulares.</p>
            <p>El contenido que publiques sigue siendo tuyo; nos das una licencia no exclusiva para mostrarlo dentro de la plataforma.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Tu información se trata según nuestra Política de Privacidad.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Terminación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Puedes cerrar tu cuenta cuando quieras. Podemos suspender o cerrar cuentas por abuso.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Ley aplicable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Estos términos se rigen por las leyes de Colombia, incluyendo la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas colombianas aplicables en materia comercial y de protección de datos personales.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Publicaremos avisos dentro de la plataforma para cualquier cambio relevante o canal de comunicación que habilitemos.</p>
          </CardContent>
        </Card>

        <Separator className="my-8" />
        <p className="text-center text-muted-foreground text-sm">
          Al usar Red Profesional aceptas estos términos.
        </p>
      </div>
    </div>
  );
}
