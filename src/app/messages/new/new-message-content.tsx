"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, User, MessageCircle } from "lucide-react";

export default function NewMessageContent() {
  const searchParams = useSearchParams();
  const professionalId = searchParams.get("professionalId");
  
  const [message, setMessage] = useState({
    recipient: professionalId || "",
    subject: "",
    content: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement message sending API call
    console.log("Sending message:", message);
    
    // Reset form
    setMessage({
      recipient: professionalId || "",
      subject: "",
      content: ""
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Nuevo Mensaje</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recipient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-5 w-5" />
              Destinatario
            </CardTitle>
          </CardHeader>
          <CardContent>
            {professionalId ? (
              <div className="space-y-2">
                <p className="font-medium">Profesional ID: {professionalId}</p>
                <p className="text-sm text-muted-foreground">
                  La información del profesional se cargará aquí.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No se ha seleccionado un destinatario específico.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Message Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5" />
              Componer Mensaje
            </CardTitle>
            <CardDescription>
              Envía un mensaje al profesional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Para</Label>
                <Input
                  id="recipient"
                  value={message.recipient}
                  onChange={(e) => setMessage(prev => ({...prev, recipient: e.target.value}))}
                  placeholder="ID o email del destinatario"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={message.subject}
                  onChange={(e) => setMessage(prev => ({...prev, subject: e.target.value}))}
                  placeholder="Asunto del mensaje"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Mensaje</Label>
                <Textarea
                  id="content"
                  value={message.content}
                  onChange={(e) => setMessage(prev => ({...prev, content: e.target.value}))}
                  rows={8}
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
