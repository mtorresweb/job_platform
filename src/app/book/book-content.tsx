"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User } from "lucide-react";

export default function BookContent() {
  const searchParams = useSearchParams();
  const professionalId = searchParams.get("professionalId");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Reservar Servicio</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Professional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-5 w-5" />
              Profesional
            </CardTitle>
            <CardDescription>
              {professionalId ? `ID: ${professionalId}` : "No se ha seleccionado un profesional"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              La información del profesional se cargará aquí.
            </p>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              Detalles de la Reserva
            </CardTitle>
            <CardDescription>
              Completa los detalles para tu reserva
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Fecha y Hora</div>
                <div className="text-sm text-muted-foreground">Selecciona tu horario preferido</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Ubicación</div>
                <div className="text-sm text-muted-foreground">Especifica dónde se realizará el servicio</div>
              </div>
            </div>

            <Button className="w-full mt-6">
              Continuar con la Reserva
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
