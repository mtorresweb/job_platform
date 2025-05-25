"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Star,
  Quote,
  Heart,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Profesional en Limpieza",
    avatar: "/avatars/maria.jpg",
    location: "Bogotá",
    rating: 5,
    quote:
      "Por primera vez en años puedo quedarme con el 100% de lo que gano. Otras plataformas me quitaban hasta el 20% de comisión, aquí es realmente gratis.",
    highlight: "Ahorro $300.000+ mensual en comisiones",
    category: "professional",
    featured: true,
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    role: "Cliente Empresarial",
    avatar: "/avatars/carlos.jpg",
    location: "Medellín",
    rating: 5,
    quote:
      "Contraté servicios de mantenimiento para mi empresa. Me sorprendió que no hubiera costos adicionales ni comisiones ocultas. Todo transparente y gratis.",
    highlight: "Ahorré $200.000 en tarifas de plataforma",
    category: "client",
  },
  {
    id: 3,
    name: "Ana Rodríguez",
    role: "Profesional en Diseño",
    avatar: "/avatars/ana.jpg",
    location: "Cali",
    rating: 5,
    quote:
      "Como freelancer, cada peso cuenta. El hecho de que ServiciosPro sea completamente gratis me permite ofrecer mejores precios a mis clientes.",
    highlight: "100% de mis ganancias van a mi bolsillo",
    category: "professional",
  },
  {
    id: 4,
    name: "Roberto Silva",
    role: "Cliente Particular",
    avatar: "/avatars/roberto.jpg",
    location: "Barranquilla",
    rating: 5,
    quote:
      "Probé varias plataformas antes. Todas cobraban algo al final. Aquí realmente es gratis y la calidad de profesionales es excelente.",
    highlight: "Sin sorpresas en el precio final",
    category: "client",
  },
  {
    id: 5,
    name: "Lucía Herrera",
    role: "Profesional en Tutorías",
    avatar: "/avatars/lucia.jpg",
    location: "Bucaramanga",
    rating: 5,
    quote:
      "Tengo más estudiantes que nunca porque puedo ofrecer precios más competitivos al no pagar comisiones. Es un win-win para todos.",
    highlight: "Incrementé mis clientes en 40%",
    category: "professional",
    featured: true,
  },
  {
    id: 6,
    name: "Pedro Jiménez",
    role: "Cliente Recurrente",
    avatar: "/avatars/pedro.jpg",
    location: "Cartagena",
    rating: 5,
    quote:
      "Llevo 6 meses usando ServiciosPro para varios servicios del hogar. Nunca me han cobrado nada extra. Es realmente lo que prometen.",
    highlight: "6 meses de uso 100% gratuito",
    category: "client",
  },
];

const stats = [
  {
    number: "$2.5M+",
    label: "Ahorrados en comisiones",
    description:
      "Dinero que se quedó en los bolsillos de nuestros profesionales",
    icon: DollarSign,
  },
  {
    number: "15,000+",
    label: "Usuarios activos",
    description:
      "Profesionales y clientes que confían en nuestro modelo gratuito",
    icon: Users,
  },
  {
    number: "98%",
    label: "Satisfacción",
    description: "De usuarios que recomiendan nuestro modelo sin comisiones",
    icon: Heart,
  },
  {
    number: "0",
    label: "Costos ocultos",
    description: "Transparencia total en todos nuestros servicios",
    icon: CheckCircle,
  },
];

export default function TestimonialsPage() {
  const professionalTestimonials = testimonials.filter(
    (t) => t.category === "professional",
  );
  const clientTestimonials = testimonials.filter(
    (t) => t.category === "client",
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <nav className="flex items-center space-x-6">
              <Link
                href="/about"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Acerca de
              </Link>
              <Link
                href="/benefits"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Beneficios
              </Link>
              <Link
                href="/faq"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <Quote className="mr-2 h-4 w-4" />
            Testimonios Reales
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Lo que dicen sobre nuestro{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              modelo gratuito
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
            Escucha las experiencias reales de profesionales y clientes que han
            descubierto las ventajas de una plataforma verdaderamente gratuita.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="font-semibold mb-1">{stat.label}</div>
                <p className="text-sm text-foreground/60">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Testimonios Destacados
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials
              .filter((t) => t.featured)
              .map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="border-primary/30 bg-gradient-to-br from-primary/5 to-background"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <Badge
                            variant={
                              testimonial.category === "professional"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {testimonial.category === "professional"
                              ? "Profesional"
                              : "Cliente"}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/60">
                          {testimonial.role} • {testimonial.location}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {" "}
                    <blockquote className="text-foreground/80 italic mb-4">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="bg-primary/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                        <CheckCircle className="h-4 w-4" />
                        {testimonial.highlight}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Professional Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2">
            Para Profesionales
          </h2>
          <p className="text-center text-foreground/60 mb-8 max-w-2xl mx-auto">
            Descubre cómo nuestro modelo sin comisiones está transformando la
            vida de los profesionales
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {professionalTestimonials
              .filter((t) => !t.featured)
              .map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-foreground/60">
                          {testimonial.role}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-sm text-foreground/80 italic mb-3">
                      &quot;{testimonial.quote}&quot;
                    </blockquote>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-xs">
                        <DollarSign className="h-3 w-3" />
                        {testimonial.highlight}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Client Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2">Para Clientes</h2>
          <p className="text-center text-foreground/60 mb-8 max-w-2xl mx-auto">
            Conoce la experiencia de quienes han encontrado profesionales sin
            costos adicionales
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {clientTestimonials
              .filter((t) => !t.featured)
              .map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-foreground/60">
                          {testimonial.role}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-sm text-foreground/80 italic mb-3">
                      &quot;{testimonial.quote}&quot;
                    </blockquote>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium text-xs">
                        <CheckCircle className="h-3 w-3" />
                        {testimonial.highlight}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para unirte a nuestra comunidad?
              </h2>
              <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
                Únete a miles de profesionales y clientes que ya disfrutan de
                una plataforma verdaderamente gratuita.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    <Users className="mr-2 h-5 w-5" />
                    Comenzar Gratis
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/services">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Explorar Servicios
                  </Link>
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-primary/20">
                <div className="flex items-center justify-center gap-8 text-sm text-foreground/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Sin registro de tarjeta
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Acceso inmediato
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Siempre gratuito
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
