"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  HelpCircle,
  CheckCircle,
  XCircle,
  Heart,
  DollarSign,
  Shield,
  Users,
  Star,
} from "lucide-react";

const faqs = [
  {
    category: "Modelo Gratuito",
    questions: [
      {
        question: "¿Red Profesional es realmente 100% gratuito?",
        answer:
          "Sí, absolutamente. No cobramos comisiones, no tenemos planes premium, no hay costos ocultos. Tanto profesionales como clientes pueden usar todas las funcionalidades sin pagar nada.",
        highlighted: true,
      },
      {
        question: "¿Van a empezar a cobrar en el futuro?",
        answer:
          "Tenemos un compromiso público de mantener Red Profesional gratuito durante al menos 10 años como parte de nuestros estatutos corporativos.",
      },
      {
        question: "¿Qué diferencia a Red Profesional de otras plataformas?",
        answer:
          "Mientras que otras plataformas cobran entre 5% y 20% de comisión, nosotros no cobramos absolutamente nada. El 100% del pago va directo al profesional, sin intermediarios.",
      },
    ],
  },
  {
    category: "Para Profesionales",
    questions: [
      {
        question: "¿Hay límites en la cantidad de servicios que puedo ofrecer?",
        answer:
          "No hay límites. Puedes publicar tantos servicios como quieras, contactar ilimitados clientes y usar todas las herramientas de gestión sin restricciones.",
      },
      {
        question: "¿Cobran por procesar los pagos?",
        answer:
          "No procesamos pagos. Los clientes pagan directamente a los profesionales, por lo que no hay comisiones ni tarifas de procesamiento de nuestra parte.",
      },
      {
        question: "¿Puedo promocionar mis servicios gratis?",
        answer:
          "Destaca con un perfil completo, portafolio y reseñas: así ganas visibilidad en las búsquedas orgánicas.",
      },
      {
        question: "¿Qué pasa si tengo problemas con un cliente?",
        answer:
          "Usa el chat para documentar acuerdos y las reseñas para compartir tu experiencia. Define términos claros por escrito y conserva los comprobantes.",
      },
    ],
  },
  {
    category: "Para Clientes",
    questions: [
      {
        question: "¿Puedo contactar a todos los profesionales que quiera?",
        answer:
          "Sí, puedes contactar a tantos profesionales como necesites, solicitar cotizaciones múltiples y comparar ofertas sin ningún límite o costo.",
      },
      {
        question: "¿Las reseñas y calificaciones son reales?",
        answer:
          "Las reseñas provienen de la comunidad. Revisa contexto y fechas; si necesitas más detalle, pide ejemplos de trabajos similares.",
      },
      {
        question: "¿Qué garantías tengo al contratar un servicio?",
        answer:
          "Apóyate en reseñas, perfiles y portafolios, y acuerda entregables, fechas y pagos directamente con el profesional.",
      },
      {
        question: "¿Puedo buscar profesionales en toda Colombia?",
        answer:
          "Puedes contactar profesionales de distintas zonas en Aguachica; revisa su cobertura en el perfil y confirma disponibilidad por mensaje.",
      },
    ],
  },
  {
    category: "Seguridad y Confianza",
    questions: [
      {
        question: "¿Cómo verifican a los profesionales sin cobrar?",
        answer:
          "Mostramos perfiles, portafolios y reseñas para que tomes decisiones informadas. Usa el chat para aclarar experiencia, disponibilidad y alcance antes de contratar.",
      },
      {
        question: "¿Mis datos están seguros?",
        answer:
          "Utilizamos encriptación de nivel bancario y nunca vendemos datos personales. La seguridad es una prioridad incluida en nuestro servicio gratuito.",
      },
      {
        question: "¿Qué pasa si un profesional no cumple?",
        answer:
          "Deja una reseña y reporta comportamientos inapropiados. Acordar términos claros y conservar comprobantes protege a ambas partes.",
      },
    ],
  },
  {
    category: "Tecnología",
    questions: [
      {
        question: "¿Puedo usar la plataforma desde el móvil?",
        answer:
          "Sí, nuestra plataforma es completamente responsive y funciona perfectamente en todos los dispositivos. También tendremos apps móviles próximamente.",
      },
      {
        question: "¿Hay funciones que requieren pago?",
        answer:
          "No hay absolutamente ninguna función que requiera pago. Todo lo que ves está incluido: chat en tiempo real, notificaciones, calendario, gestión de proyectos, todo gratis.",
      },
      {
        question: "¿Qué tan rápido es el sistema de matching?",
        answer:
          "Utilizamos algoritmos inteligentes que conectan profesionales con clientes en segundos. La velocidad y eficiencia son parte de nuestro compromiso de servicio gratuito.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <HelpCircle className="mr-2 h-4 w-4" />
            Preguntas Frecuentes
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Todo lo que necesitas saber sobre{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              nuestro modelo gratuito
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
            Resolvemos todas tus dudas sobre cómo funciona Red Profesional y por
            qué podemos mantenerlo 100% gratuito para siempre.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                0%
              </div>
              <p className="text-sm text-green-600 dark:text-green-300">
                Comisión cobrada
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                Perfil
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Reseñas y portafolios visibles
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                ∞
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Contactos ilimitados
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                Comunidad
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-300">
                Reseñas y contacto directo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto space-y-12">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {categoryIndex + 1}
                  </span>
                </div>
                {category.category}
              </h2>

              <div className="space-y-4">
                {category.questions.map((faq, index) => (
                  <Card
                    key={index}
                    className={
                      faq.highlighted ? "border-primary/30 bg-primary/5" : ""
                    }
                  >
                    <CardHeader>
                      <CardTitle className="flex items-start gap-3 text-lg">
                        {faq.highlighted ? (
                          <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <HelpCircle className="h-5 w-5 text-foreground/60 flex-shrink-0 mt-0.5" />
                        )}
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80 leading-relaxed pl-8">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Comparación con Otras Plataformas
          </h2>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">
                      Característica
                    </th>
                    <th className="text-center p-4 font-semibold text-primary">
                      <div className="flex items-center justify-center gap-2">
                        <Heart className="h-5 w-5" />
                        Red Profesional
                      </div>
                    </th>
                    <th className="text-center p-4 font-semibold">
                      Otras Plataformas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-4 font-medium">
                      Comisión por transacción
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        0%
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        5% - 20%
                      </div>
                    </td>
                  </tr>
                  <tr className="border-t bg-muted/20">
                    <td className="p-4 font-medium">Contactos ilimitados</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Sí
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        Limitado
                      </div>
                    </td>
                  </tr>
                  <tr className="border-t bg-muted/20">
                    <td className="p-4 font-medium">
                      Herramientas de promoción
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Visibilidad orgánica (perfil + reseñas)
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        Pago adicional
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
