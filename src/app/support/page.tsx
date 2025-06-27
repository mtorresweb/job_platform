"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  Users, 
  Settings, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Send,
  Book,
  Video,
  Download,
  Loader2
} from "lucide-react";
import { useSubmitContactForm } from "@/shared/hooks/useContact";
import { ContactFormData } from "@/shared/utils/contact-api";

// FAQ Data
const faqCategories = [
  {
    id: "general",
    title: "Preguntas Generales",
    icon: <HelpCircle className="h-5 w-5" />,
    questions: [
      {
        question: "¿Qué es ServiciosPro?",
        answer: "ServiciosPro es una plataforma que conecta profesionales con clientes que buscan servicios especializados. Ofrecemos un marketplace sin comisiones donde profesionales pueden ofrecer sus servicios y clientes pueden encontrar expertos en diferentes áreas."
      },
      {
        question: "¿Cómo funciona la plataforma?",
        answer: "Los profesionales crean perfiles detallados con sus servicios, tarifas y disponibilidad. Los clientes buscan servicios, contactan profesionales y pueden reservar citas. Todo el proceso se gestiona a través de nuestra plataforma."
      },
      {
        question: "¿Es gratuito usar ServiciosPro?",
        answer: "Sí, el registro y uso básico de la plataforma es completamente gratuito tanto para clientes como para profesionales. No cobramos comisiones por las transacciones."
      }
    ]
  },
  {
    id: "professionals",
    title: "Para Profesionales",
    icon: <Users className="h-5 w-5" />,
    questions: [
      {
        question: "¿Cómo creo mi perfil profesional?",
        answer: "Regístrate como profesional, completa tu perfil con tu experiencia, servicios ofrecidos, tarifas y disponibilidad. Sube ejemplos de tu trabajo y obtén verificaciones para aumentar tu credibilidad."
      },
      {
        question: "¿Cómo establezco mis tarifas?",
        answer: "Puedes establecer tarifas por hora, por proyecto o crear paquetes personalizados. Las tarifas son visibles para los clientes y puedes ajustarlas en cualquier momento desde tu perfil."
      },
      {
        question: "¿Cómo gestiono mi disponibilidad?",
        answer: "Utiliza nuestro calendario integrado para establecer tu disponibilidad. Puedes bloquear fechas, establecer horarios de trabajo y configurar recordatorios automáticos."
      }
    ]
  },
  {
    id: "clients",
    title: "Para Clientes",
    icon: <MessageCircle className="h-5 w-5" />,
    questions: [
      {
        question: "¿Cómo encuentro el profesional adecuado?",
        answer: "Utiliza nuestros filtros de búsqueda por categoría, ubicación, precio y calificaciones. Lee reseñas de otros clientes y revisa portfolios antes de contactar a un profesional."
      },
      {
        question: "¿Cómo reservo un servicio?",
        answer: "Contacta al profesional, discute los detalles del proyecto, acuerda términos y utiliza nuestro sistema de reservas para confirmar la cita. Recibirás confirmaciones por email y notificaciones push."
      },
      {
        question: "¿Qué garantías tengo como cliente?",
        answer: "Ofrecemos un sistema de reseñas verificadas, perfiles verificados de profesionales y soporte al cliente. Si hay problemas, nuestro equipo de soporte está disponible para mediar."
      }    ]
  },
  {
    id: "security",
    title: "Seguridad y Privacidad",
    icon: <Shield className="h-5 w-5" />,
    questions: [
      {
        question: "¿Cómo protegen mis datos personales?",
        answer: "Cumplimos con GDPR y utilizamos encriptación de extremo a extremo. Tus datos nunca se comparten con terceros sin tu consentimiento explícito."
      },
      {
        question: "¿Cómo reporto un problema de seguridad?",
        answer: "Contacta inmediatamente a nuestro equipo de seguridad a través del formulario de contacto marcando 'Problema de Seguridad' como prioridad alta."
      }
    ]
  }
];

// Support resources
const supportResources = [
  {
    title: "Guía de Inicio Rápido",
    description: "Todo lo que necesitas saber para empezar",
    icon: <Book className="h-6 w-6" />,
    type: "guide",
    url: "#"
  },
  {
    title: "Video Tutoriales",
    description: "Aprende con videos paso a paso",
    icon: <Video className="h-6 w-6" />,
    type: "video",
    url: "#"
  },
  {
    title: "Documentación API",
    description: "Para desarrolladores e integraciones",
    icon: <FileText className="h-6 w-6" />,
    type: "docs",
    url: "#"
  },
  {
    title: "Centro de Descargas",
    description: "Recursos, logos y materiales",
    icon: <Download className="h-6 w-6" />,
    type: "download",
    url: "#"
  }
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
    priority: "medium",
    phone: ""
  });

  const submitContactMutation = useSubmitContactForm();

  const filteredFAQs = faqCategories.filter(category => {
    if (selectedCategory !== "all" && category.id !== selectedCategory) return false;
    
    if (searchQuery) {
      return category.questions.some(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return true;
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitContactMutation.mutateAsync(contactForm);
      
      // Reset form on success
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general",
        priority: "medium",
        phone: ""
      });
      
    } catch (error) {
      // Error handling is done in the hook
      console.error("Support contact form error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Centro de Ayuda</h1>
        <p className="text-muted-foreground">
          Encuentra respuestas a tus preguntas o contacta con nuestro equipo de soporte
        </p>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Contacto
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Estado
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar en preguntas frecuentes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {faqCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {filteredFAQs.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {category.icon}
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No se encontraron preguntas</h3>
                <p className="text-sm text-muted-foreground">
                  Intenta ajustar tu búsqueda o explora diferentes categorías
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Contactar Soporte</CardTitle>
                <CardDescription>
                  Envíanos un mensaje y te responderemos lo antes posible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({...prev, name: e.target.value}))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (opcional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))}
                      placeholder="+34 600 123 456"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select value={contactForm.category} onValueChange={(value) => setContactForm(prev => ({...prev, category: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>                        <SelectContent>
                          <SelectItem value="general">Consulta General</SelectItem>
                          <SelectItem value="technical">Problema Técnico</SelectItem>
                          <SelectItem value="billing">Facturación</SelectItem>
                          <SelectItem value="feedback">Comentarios</SelectItem>
                          <SelectItem value="report">Reportar Problema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select value={contactForm.priority} onValueChange={(value) => setContactForm(prev => ({...prev, priority: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({...prev, subject: e.target.value}))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({...prev, message: e.target.value}))}
                      rows={5}
                      placeholder="Describe tu consulta o problema en detalle..."
                      required
                    />
                  </div>

                  <Button type="submit" disabled={submitContactMutation.isPending} className="w-full">
                    {submitContactMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">soporte@serviciospro.es</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Teléfono</div>
                      <div className="text-sm text-muted-foreground">+34 900 123 456</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Chat en Vivo</div>
                      <div className="text-sm text-muted-foreground">Lun-Vie 9:00-18:00</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horarios de Atención</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Lunes - Viernes</span>
                      <span className="font-medium">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábados</span>
                      <span className="font-medium">10:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingos</span>
                      <span className="text-muted-foreground">Cerrado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tiempo de Respuesta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Urgente</Badge>
                      </div>
                      <span className="text-sm">1-2 horas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Alta</Badge>
                      </div>
                      <span className="text-sm">4-6 horas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Media/Baja</Badge>
                      </div>
                      <span className="text-sm">24-48 horas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {resource.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {resource.description}
                      </p>
                      <Button variant="outline" size="sm">
                        Acceder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Book className="h-6 w-6" />
                  <span className="font-medium">Blog</span>
                  <span className="text-xs text-muted-foreground">Artículos y consejos</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span className="font-medium">Comunidad</span>
                  <span className="text-xs text-muted-foreground">Foro de usuarios</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Video className="h-6 w-6" />
                  <span className="font-medium">Webinars</span>
                  <span className="text-xs text-muted-foreground">Entrenamientos en vivo</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>
                Todos los servicios funcionan correctamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Plataforma Web</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Operativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Sistema de Pagos</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Operativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Notificaciones</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Operativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Chat en Vivo</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Mantenimiento
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Programados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No hay mantenimientos programados</h3>
                <p className="text-sm text-muted-foreground">
                  Te notificaremos con anticipación sobre cualquier mantenimiento programado
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
