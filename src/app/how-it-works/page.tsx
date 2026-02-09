"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserCheck,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Users,
  Shield,
  Heart,
  Star,
  Clock,
  DollarSign,
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "Busca profesionales especializados",
      description:
        "Explora perfiles detallados por categoría y conecta con expertos que se ajusten a lo que necesitas.",
      icon: Search,
      color: "blue",
    },
    {
      number: "02",
      title: "Conecta y revisa perfiles",
      description:
        "Revisa reseñas, experiencia y conversa por mensajes para validar disponibilidad y expectativas antes de contratar.",
      icon: UserCheck,
      color: "green",
    },
    {
      number: "03",
      title: "Comunícate directamente",
      description:
        "Usa nuestro sistema de mensajería integrado para discutir detalles, acordar precios y coordinar el servicio.",
      icon: MessageSquare,
      color: "purple",
    },
    {
      number: "04",
      title: "Completa y califica",
      description:
        "Una vez completado el servicio, califica la experiencia para ayudar a otros usuarios y fortalecer la comunidad.",
      icon: CheckCircle,
      color: "orange",
    },
  ];

  const features = [
    {
      icon: Heart,
      title: "100% Gratuito",
      description:
        "Sin comisiones ni tarifas ocultas. Todo el dinero va directamente al profesional.",
    },
    {
      icon: Shield,
      title: "Confianza y transparencia",
      description:
        "Consulta reseñas y conversa con el profesional para confirmar experiencia, disponibilidad y alcance.",
    },
    {
      icon: Star,
      title: "Sistema de Reseñas",
      description:
        "Reseñas y calificaciones reales de usuarios para tomar decisiones informadas.",
    },
    {
      icon: Clock,
      title: "Respuesta Rápida",
      description:
        "Conecta con profesionales disponibles en tu área en minutos, no días.",
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description:
        "Miles de profesionales calificados y clientes satisfechos en Aguachica.",
    },
    {
      icon: DollarSign,
      title: "Precios Justos",
      description:
        "Negocia directamente con el profesional sin intermediarios que inflen los precios.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <Heart className="mr-2 h-4 w-4" />
            Simple y Transparente
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ¿Cómo funciona{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Red Profesional?
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
            Conectar con profesionales calificados nunca fue tan fácil. En 4
            simples pasos puedes encontrar el servicio que necesitas o empezar a
            ofrecer tus habilidades.
          </p>
        </div>{" "}
        {/* Steps Section */}
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-4">
            El proceso paso a paso
          </h2>
          <p className="text-lg text-foreground/60 text-center mb-16 max-w-3xl mx-auto">
            Únete a nuestra plataforma y comienza a conectar con profesionales o
            clientes en solo cuatro pasos simples
          </p>
          <p className="text-sm text-foreground/60 text-center mb-8 max-w-2xl mx-auto">
            Nota: hoy no habilitamos la publicación de necesidades y el filtro por ubicación está en desarrollo. Busca y contacta profesionales directamente; revisa la zona que cubren en su perfil y confirma por mensaje.
          </p>
          <div className="grid lg:grid-cols-2 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={index}
                  className="relative p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Icon in top right corner */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`
                        h-12 w-12 rounded-lg flex items-center justify-center
                        ${
                          step.color === "blue"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            : ""
                        }
                        ${
                          step.color === "green"
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : ""
                        }
                        ${
                          step.color === "purple"
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                            : ""
                        }
                        ${
                          step.color === "orange"
                            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                            : ""
                        }
                      `}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <CardContent className="p-0">
                    <div className="mb-4">
                      <div
                        className={`
                          inline-flex h-12 w-12 rounded-lg items-center justify-center text-white font-bold text-lg mb-4
                          ${
                            step.color === "blue" ? "bg-blue-600" : ""
                          }
                          ${
                            step.color === "green" ? "bg-green-600" : ""
                          }
                          ${
                            step.color === "purple" ? "bg-purple-600" : ""
                          }
                          ${
                            step.color === "orange" ? "bg-orange-600" : ""
                          }
                        `}
                      >
                        {step.number}
                      </div>
                      
                      <CardTitle className="text-xl font-bold mb-3 pr-16">
                        {step.title}
                      </CardTitle>
                    </div>

                    <p className="text-foreground/70 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-4">
            ¿Por qué elegir Red Profesional?
          </h2>
          <p className="text-lg text-foreground/70 text-center mb-12 max-w-3xl mx-auto">
            Ofrecemos una experiencia única que beneficia tanto a profesionales
            como a clientes, sin las comisiones y limitaciones de otras
            plataformas.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="pt-6">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        {/* For Professionals */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">
                Para Profesionales
              </CardTitle>
              <p className="text-foreground/70">
                Convierte tus habilidades en ingresos sin pagar comisiones
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Crea tu perfil profesional
                  </h4>
                  <p className="text-sm text-foreground/70 mb-4">
                    Destaca tus habilidades, experiencia y proyectos anteriores
                    con un perfil completo y atractivo.
                  </p>

                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Recibe proyectos directamente
                  </h4>
                  <p className="text-sm text-foreground/70">
                    Los clientes te contactarán directamente cuando busquen
                    profesionales con tu expertise.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Negocia tus precios
                  </h4>
                  <p className="text-sm text-foreground/70 mb-4">
                    Establece tus tarifas y negocia directamente con el cliente
                    sin intermediarios que reduzcan tus ganancias.
                  </p>

                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Construye tu reputación
                  </h4>
                  <p className="text-sm text-foreground/70">
                    Acumula reseñas positivas que te ayudarán a conseguir más
                    clientes y mejores proyectos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* For Clients */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Para Clientes</CardTitle>
              <p className="text-foreground/70">
                Encuentra el profesional perfecto para tu proyecto
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Busca por categoría
                  </h4>
                  <p className="text-sm text-foreground/70 mb-4">
                    Navega por categorías y revisa la zona que cubre cada
                    profesional en su perfil; confirma por mensaje antes de
                    acordar.
                  </p>

                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Compara profesionales
                  </h4>
                  <p className="text-sm text-foreground/70">
                    Revisa perfiles, portfolios, reseñas y precios para tomar la
                    mejor decisión.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Comunícate directamente
                  </h4>
                  <p className="text-sm text-foreground/70 mb-4">
                    Habla directamente con el profesional para aclarar dudas y
                    ajustar detalles del proyecto.
                  </p>

                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Coordina pagos
                  </h4>
                  <p className="text-sm text-foreground/70">
                    Define el método de pago directamente con el profesional y
                    conserva los comprobantes de forma segura.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-3 text-foreground">¿Listo para comenzar?</h2>
          <p className="text-xl text-foreground/85 mb-8 max-w-2xl mx-auto">
            Únete a miles de profesionales y clientes que ya están conectando en
            Red Profesional de forma completamente gratuita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/professionals">Ver Profesionales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
