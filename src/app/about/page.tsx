"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Heart,
  Users,
  Target,
  CheckCircle,
  Star,
  Shield,
  Zap,
  Award,
  Globe,
  Handshake,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium"
            >
              <Heart className="mr-2 h-4 w-4" />
              100% Gratuito para Siempre
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Conectamos{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                talento
              </span>{" "}
              sin barreras
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              ServiciosPro nació con la misión de democratizar el acceso a
              servicios profesionales de calidad. Creemos que conectar talento
              con oportunidades debe ser completamente gratuito.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                className="px-8 py-3 text-lg font-medium"
                asChild
              >
                <Link href="/services">
                  <Target className="mr-2 h-5 w-5" />
                  Descubre Servicios
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg font-medium"
                asChild
              >
                <Link href="/auth/register">
                  Únete Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nuestra Misión
              </h2>
              <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
                Revolucionar la forma en que profesionales y clientes se
                conectan, eliminando las barreras económicas
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle>Acceso Universal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">
                    Todos merecen acceso a servicios profesionales de calidad,
                    sin importar su presupuesto o ubicación.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Handshake className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle>Conexión Directa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">
                    Facilitamos el contacto directo entre profesionales y
                    clientes, sin intermediarios que encarezcan el servicio.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle>Calidad Garantizada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">
                    Mantenemos altos estándares de calidad a través de
                    verificaciones y un sistema de reseñas transparente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Por qué somos 100% gratuitos?
              </h2>
              <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
                Creemos en un ecosistema justo donde el talento sea recompensado
                completamente
              </p>
            </div>

            <div className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Profesionales reciben el 100%
                      </h3>
                      <p className="text-foreground/70 leading-relaxed">
                        Los profesionales conservan la totalidad de sus
                        ingresos. No cobramos comisiones, tarifas de
                        procesamiento ni costos ocultos. Tu trabajo, tu ganancia
                        completa.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Clientes pagan menos
                      </h3>
                      <p className="text-foreground/70 leading-relaxed">
                        Sin comisiones de plataforma, los servicios son más
                        accesibles. Los profesionales pueden ofrecer precios más
                        competitivos al no tener que cubrir tarifas adicionales.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Impacto social positivo
                      </h3>
                      <p className="text-foreground/70 leading-relaxed">
                        Democratizamos el acceso a oportunidades laborales y
                        servicios de calidad, contribuyendo al desarrollo
                        económico de las comunidades.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nuestros Valores
              </h2>
              <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
                Los principios que guían cada decisión en ServiciosPro
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Transparencia</h3>
                    <p className="text-sm text-foreground/70">
                      Sin costos ocultos, tarifas sorpresa o comisiones. Todo es
                      claro y directo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Comunidad</h3>
                    <p className="text-sm text-foreground/70">
                      Construimos una comunidad donde todos se benefician
                      mutuamente.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Excelencia</h3>
                    <p className="text-sm text-foreground/70">
                      Promovemos la calidad y el profesionalismo en cada
                      interacción.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Confianza</h3>
                    <p className="text-sm text-foreground/70">
                      Verificamos profesionales y protegemos a nuestra
                      comunidad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Innovación</h3>
                    <p className="text-sm text-foreground/70">
                      Mejoramos constantemente para ofrecer la mejor
                      experiencia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Accesibilidad</h3>
                    <p className="text-sm text-foreground/70">
                      Hacemos que los servicios profesionales sean accesibles
                      para todos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Únete a la revolución gratuita
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Forma parte de una comunidad que cree en el poder del talento sin
              barreras económicas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg font-medium"
                asChild
              >
                <Link href="/auth/register">
                  <Users className="mr-2 h-5 w-5" />
                  Registrarse Gratis
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-medium border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/services">
                  <Target className="mr-2 h-5 w-5" />
                  Explorar Servicios
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
