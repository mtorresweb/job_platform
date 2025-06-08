"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Hooks
import { useProfessional } from "@/shared/hooks/useProfessionals";
import { useService } from "@/shared/hooks/useServices";
import { useCreateBooking, useCheckAvailability } from "@/shared/hooks/useBookings";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { BookingStatus } from "@/shared/types";

export default function BookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useUserRole();
  
  // Get parameters from URL
  const professionalId = searchParams.get("professionalId");
  const serviceId = searchParams.get("serviceId");
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks for API calls
  const createBookingMutation = useCreateBooking();

  // Fetch data
  const { data: professional, isLoading: professionalLoading } = useProfessional(professionalId || "");
  const { data: selectedService, isLoading: serviceLoading } = useService(serviceId || "");
  const { data: availability, isLoading: availabilityLoading } = useCheckAvailability(
    professionalId || "",
    selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    selectedService?.duration || 0
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/book?professionalId=${professionalId}&serviceId=${serviceId}`);
    }
  }, [isAuthenticated, router, professionalId, serviceId]);

  // Generate time slots
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  // Loading state
  if (!isAuthenticated || professionalLoading || serviceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
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
              <div>
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!selectedService && !serviceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Service not found. Please try again.
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href="/services">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !professional || !selectedDate || !selectedTime || !user) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const bookingData = {
        professionalId: professional.userId,
        serviceId: selectedService.id,
        scheduledAt: scheduledAt.toISOString(),
        duration: selectedService.duration,
        notes: notes.trim() || undefined,
        status: BookingStatus.PENDING,
      };

      await createBookingMutation.mutateAsync(bookingData);
      
      toast.success("Booking request sent successfully!");
      router.push("/bookings");
      
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <Link href="/" className="hover:text-primary">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-primary">
              Servicios
            </Link>
            <span>/</span>
            <span className="text-foreground">Reservar</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Reservar Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Service Selection */}
                    {selectedService && (
                      <div>
                        <Label>Servicio Seleccionado</Label>
                        <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                          <h3 className="font-medium">{selectedService.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-foreground/60">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{selectedService.duration} min</span>
                            </div>
                            {selectedService.category && (
                              <Badge variant="outline">
                                {selectedService.category.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date Selection */}
                    <div>
                      <Label>Fecha *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-2",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date() || date.getDay() === 0}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <Label>Hora *</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecciona una hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityLoading ? (
                            <div className="p-2 text-center">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                          ) : (
                            timeSlots.map((time) => (
                              <SelectItem 
                                key={time} 
                                value={time}
                                disabled={availability && !availability.available}
                              >
                                {time}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label>Notas adicionales</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Describe cualquier detalle específico sobre el servicio que necesitas..."
                        className="mt-2"
                        rows={4}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting || !selectedDate || !selectedTime}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando solicitud...
                        </>
                      ) : (
                        "Enviar Solicitud de Reserva"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Resumen de Reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Professional Info */}
                  {professional && (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={professional.user.avatar} />
                        <AvatarFallback>
                          {professional.user.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{professional.user.name}</h3>
                          {professional.isVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-foreground/60">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{professional.rating}</span>
                          <span>({professional.reviewCount} reseñas)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service Details */}
                  {selectedService && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Servicio</h4>
                      <p className="text-sm">{selectedService.title}</p>
                      <div className="flex items-center gap-1 text-sm text-foreground/60">
                        <Clock className="h-3 w-3" />
                        <span>{selectedService.duration} min</span>
                      </div>
                    </div>
                  )}

                  {/* Selected Date & Time */}
                  {selectedDate && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Fecha y Hora</h4>
                      <p className="text-sm">{format(selectedDate, "PPP", { locale: es })}</p>
                      {selectedTime && (
                        <p className="text-sm">{selectedTime}</p>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {professional && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Ubicación</h4>
                      <p className="text-sm">{professional.city}, {professional.state}</p>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💡 Tu reserva será confirmada por el profesional antes de ser finalizada.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
