"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  DollarSign,
  Zap,
  Globe,
  Star,
} from "lucide-react";

export default function TransparencyPage() {
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
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <Heart className="mr-2 h-4 w-4" />
            100% Transparente
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ¿Cómo mantenemos{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              ServiciosPro gratuito?
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
            Creemos en la transparencia total. Aquí te explicamos exactamente
            cómo funciona nuestro modelo económico y por qué podemos mantener
            nuestra plataforma 100% gratuita para siempre.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Our Philosophy */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Heart className="h-6 w-6 text-primary" />
                Nuestra Filosofía
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg text-foreground/80">
              <p>
                <strong>
                  Creemos que conectar talento con oportunidades no debería
                  tener un costo.
                </strong>
                Nuestro compromiso es mantener ServiciosPro como una plataforma
                verdaderamente gratuita donde profesionales y clientes puedan
                conectar sin barreras económicas.
              </p>
              <p>
                A diferencia de otras plataformas que cobran comisiones del 5%
                al 20%, nosotros hemos diseñado un modelo sostenible que no
                requiere extraer dinero de las transacciones entre nuestros
                usuarios.
              </p>
            </CardContent>
          </Card>

          {/* How We Sustain */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Partnerships Estratégicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-4">
                  Trabajamos con empresas que quieren apoyar el ecosistema de
                  servicios profesionales en Colombia, sin afectar la
                  experiencia de nuestros usuarios.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Patrocinios no intrusivos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Colaboraciones con instituciones educativas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Apoyo de organizaciones sin ánimo de lucro
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Eficiencia Tecnológica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-4">
                  Utilizamos tecnología moderna y automatización para mantener
                  costos operativos mínimos y ofrecer una experiencia
                  excepcional.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Infraestructura cloud optimizada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Procesos automatizados
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Algoritmos inteligentes de matching
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* What We Don't Do */}
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-700 dark:text-red-400">
                <Shield className="h-5 w-5" />
                Lo que NUNCA haremos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">
                    Cobrar comisiones
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    Jamás tomaremos un porcentaje de los pagos entre
                    profesionales y clientes. El 100% del dinero va directamente
                    al profesional.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">
                    Vender datos personales
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    Tu información personal es sagrada. Nunca venderemos,
                    alquilaremos o compartiremos tus datos con terceros para
                    fines comerciales.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">
                    Crear versiones &quot;premium&quot;
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    No habrá funcionalidades bloqueadas detrás de un paywall.
                    Todas las herramientas están disponibles para todos los
                    usuarios.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">
                    Publicidad invasiva
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    No llenaremos la plataforma con anuncios molestos que
                    interrumpan tu experiencia de usuario.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Globe className="h-6 w-6 text-primary" />
                Impacto en la Comunidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-foreground/80">
                Al mantener ServiciosPro gratuito, generamos un impacto positivo
                real:
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    Más ingresos para profesionales
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Sin comisiones, los profesionales mantienen el 100% de sus
                    ganancias
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Acceso democrático</h3>
                  <p className="text-sm text-foreground/60">
                    Cualquier persona puede acceder a servicios de calidad
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Mejor economía local</h3>
                  <p className="text-sm text-foreground/60">
                    Fortalecemos el ecosistema de servicios en Colombia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Long-term Commitment */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Nuestro Compromiso a Largo Plazo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg text-foreground/80">
                <strong>
                  Prometemos mantener ServiciosPro gratuito durante al menos los
                  próximos 10 años.
                </strong>
              </p>
              <p className="text-foreground/70">
                Este compromiso está respaldado por nuestros inversionistas y
                forma parte de nuestros estatutos corporativos. Creemos en el
                poder de la tecnología para democratizar las oportunidades
                económicas.
              </p>
              <div className="pt-6">
                <Button size="lg" asChild>
                  <Link href="/about">Conoce más sobre nosotros</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 pt-12 border-t">
          <h2 className="text-3xl font-bold mb-4">¿Tienes más preguntas?</h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
            Estamos aquí para responder cualquier duda sobre nuestro modelo o
            funcionamiento de la plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">Contáctanos</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/faq">Ver FAQ</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
