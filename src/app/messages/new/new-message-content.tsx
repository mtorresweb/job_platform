"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useProfessional } from "@/shared/hooks/useProfessionals";
import { useService } from "@/shared/hooks/useServices";
import { useCreateConversation, useSendMessage } from "@/shared/hooks/useMessages";
import { MessageType } from "@/shared/utils/messages-api";
import { useUserRole } from "@/infrastructure/auth/auth-client";

export default function NewMessageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useUserRole();
  
  // Get parameters from URL
  const professionalId = searchParams.get("professionalId");
  const professionalName = searchParams.get("name");
  const serviceId = searchParams.get("serviceId");
  
  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks for API calls
  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage();

  // Fetch data
  const { data: professional, isLoading: professionalLoading } = useProfessional(professionalId || "");
  const { data: service, isLoading: serviceLoading } = useService(serviceId || "");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/messages/new?professionalId=${professionalId}&name=${professionalName}&serviceId=${serviceId}`);
    }
  }, [isAuthenticated, router, professionalId, professionalName, serviceId]);

  // Set initial subject based on service
  useEffect(() => {
    if (service && !subject) {
      setSubject(`Consulta sobre: ${service.title}`);
    }
  }, [service, subject]);

  // Loading state
  if (!isAuthenticated || professionalLoading || serviceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!professional && !professionalLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Professional not found. Please try again.
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href="/professionals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Professionals
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!professional || !message.trim() || !user) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // First create or get conversation
      const conversation = await createConversationMutation.mutateAsync(professional.id);
      
      // Then send the message
      const messageData = {
        conversationId: conversation.id,
        content: message.trim(),
        messageType: MessageType.TEXT,
      };

      await sendMessageMutation.mutateAsync(messageData);
      
      toast.success("Message sent successfully!");
      router.push(`/messages?conversationId=${conversation.id}`);
      
    } catch (error) {
      console.error("Message error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <Link href="/" className="hover:text-primary">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/messages" className="hover:text-primary">
              Mensajes
            </Link>
            <span>/</span>
            <span className="text-foreground">Nuevo Mensaje</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/messages">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a mensajes
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Nuevo Mensaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Professional Info */}
                {professional && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={professional.user.avatar} />
                        <AvatarFallback>
                          {professional.user.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{professional.user.name}</h3>
                        <p className="text-sm text-foreground/60">
                          {professional.bio?.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service Context */}
                {service && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700 dark:text-blue-300">
                        Relacionado al servicio: <strong>{service.title}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <Label htmlFor="subject">Asunto *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Escribe el asunto del mensaje..."
                    className="mt-2"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                    className="mt-2"
                    rows={6}
                    required
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    Mínimo 10 caracteres
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || message.trim().length < 10}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">💡 Consejos para un buen mensaje:</h4>
            <ul className="text-xs text-foreground/60 space-y-1">
              <li>• Sé claro y específico sobre lo que necesitas</li>
              <li>• Incluye detalles relevantes del proyecto</li>
              <li>• Menciona tu presupuesto aproximado si es posible</li>
              <li>• Pregunta por disponibilidad y tiempos de entrega</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
