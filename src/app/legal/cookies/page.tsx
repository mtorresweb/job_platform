import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Política de Cookies | Red Profesional",
  description: "Cómo usamos cookies en Red Profesional.",
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Cookies</h1>
        <p className="text-muted-foreground">Última actualización: 8 de febrero de 2026</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Qué son las cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Son pequeños archivos que ayudan a que el sitio funcione, recuerde preferencias y mida uso
              básico para mejorar la experiencia.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Tipos que usamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Esenciales:</strong> necesarias para iniciar sesión y navegar.</li>
              <li><strong>Funcionales:</strong> recuerdan idioma y preferencias básicas.</li>
              <li><strong>Métricas básicas:</strong> nos permiten saber qué secciones se usan más para mejorar.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Terceros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Usamos proveedores de analítica e infraestructura. No servimos publicidad basada en perfiles.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Cómo gestionarlas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Puedes borrar o bloquear cookies desde la configuración de tu navegador.</p>
            <p className="text-sm text-muted-foreground">Si las deshabilitas, algunas funciones básicas pueden verse limitadas.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Actualizaciones y marco legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Informaremos dentro de la plataforma si actualizamos esta política.</p>
            <p>Se interpreta de acuerdo con la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas colombianas aplicables sobre protección de datos.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
