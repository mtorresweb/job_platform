"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Sparkles, User, ShieldCheck } from "lucide-react";
import { useService } from "@/shared/hooks/useServices";
import { useCreateBooking, useCheckAvailability } from "@/shared/hooks/useBookings";
import { useUserRole } from "@/infrastructure/auth/auth-client";

export default function BookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const serviceId = searchParams.get("serviceId") || "";
  const professionalId = searchParams.get("professionalId");

  const { isAuthenticated } = useUserRole();
  const { data: service, isLoading, error } = useService(serviceId);
  const createBooking = useCreateBooking();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const professionalIdFromService = service?.professional?.user?.id || professionalId || "";

  const formattedPrice = useMemo(() => {
    if (!service?.price) return "A convenir";
    const suffix = service.priceType === "PER_HOUR" ? " / hora" : " por trabajo";
    const value = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(service.price);
    return `${value}${suffix}`;
  }, [service?.price, service?.priceType]);

  const suggestedSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 8; hour <= 18; hour += 1) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour !== 18) slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  }, []);

  const scheduledAt = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const date = new Date(selectedDate);
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  }, [selectedDate, selectedTime]);

  const availabilityDate = useMemo(() => {
    if (!selectedDate) return null;
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [selectedDate]);

  const isSlotInPast = (slot: string) => {
    if (!selectedDate) return false;
    const [h, m] = slot.split(":").map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(h || 0, m || 0, 0, 0);
    return slotDate.getTime() <= Date.now();
  };

  const availability = useCheckAvailability(
    professionalIdFromService,
    availabilityDate || "",
    service?.duration || 0
  );

  const takenSlots = availability.data?.takenSlots || [];
  const isCheckingAvailability = availability.isFetching;
  const allSlotsTaken = suggestedSlots.length > 0 && suggestedSlots.every((slot) => takenSlots.includes(slot));

  const handleSubmit = async () => {
    setFormError(null);

    if (!isAuthenticated) {
      setFormError("Debes iniciar sesión para reservar.");
      return;
    }

    if (!serviceId) {
      setFormError("No se ha seleccionado un servicio.");
      return;
    }

    if (!professionalIdFromService) {
      setFormError("No se pudo identificar al profesional del servicio.");
      return;
    }

    if (!scheduledAt) {
      setFormError("Selecciona una fecha y hora para continuar.");
      return;
    }

    const now = new Date();
    if (scheduledAt < now) {
      setFormError("No puedes agendar en una fecha u hora pasada.");
      return;
    }

    if (takenSlots.includes(selectedTime)) {
      setFormError("Ese horario ya está ocupado. Selecciona otro.");
      return;
    }

    try {
      await createBooking.mutateAsync({
        serviceId,
        professionalId: professionalId || undefined,
        scheduledAt: scheduledAt.toISOString(),
        notes,
      });

      router.push("/bookings");
    } catch (mutationError) {
      console.error("Error creating booking", mutationError);
      setFormError(
        (mutationError as { message?: string })?.message ||
          "No se pudo crear la reserva. Intenta nuevamente.",
      );
    }
  };

  if (!serviceId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Alert className="max-w-xl">
          <AlertDescription>
            No se proporcionó un servicio para reservar. Vuelve a la página de servicios e intenta de nuevo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Alert className="max-w-xl">
          <AlertDescription>
            No pudimos cargar la información del servicio. Intenta nuevamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 p-6 shadow-lg text-white">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white text-xs font-semibold shadow-sm ring-1 ring-white/20">
                <Sparkles className="h-4 w-4" />
                Agenda en menos de 1 minuto
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reservar servicio</h1>
                <p className="text-sm md:text-base text-slate-200">
                  Confirma la fecha y hora para {service.title} con {service.professional?.user?.name}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
                <Badge variant="outline" className="border-white/30 text-white">
                  {service.category?.name || "Servicio"}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-slate-100">
                  <Clock className="h-3.5 w-3.5" />
                  {Math.floor(service.duration / 60)}h {service.duration % 60}m
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto rounded-xl border border-white/20 bg-white/10 text-white px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-xs font-medium text-white/80">Precio estimado</div>
              <div className="text-2xl md:text-3xl font-semibold leading-tight">
                {formattedPrice}
              </div>
              <div className="text-xs text-white/70">
                Incluye impuestos y cargos de servicio
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b ">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Calendar className="h-5 w-5" />
                  Fecha y hora
                </CardTitle>
                <CardDescription>
                  Elige una fecha disponible y el horario que mejor te funcione.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-6 md:gap-8 p-4 md:p-6">
                <div className="space-y-3 flex flex-col items-center xl:items-start">
                  <CalendarPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    fromDate={new Date()}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const d = new Date(date);
                      d.setHours(0, 0, 0, 0);
                      return d < today;
                    }}
                    locale={es}
                    className="rounded-xl border border-border bg-card p-3 md:p-4 shadow-lg w-full max-w-[360px]"
                  />
                  <div className="flex items-center justify-between rounded-lg bg-muted border border-border px-3 py-2 text-xs text-muted-foreground w-full max-w-[360px]">
                    <span>Zona horaria local</span>
                    <span className="font-medium text-foreground">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                  </div>
                  {allSlotsTaken && selectedDate && (
                    <div className="text-xs text-destructive font-medium">
                      Este día no tiene horarios disponibles. Prueba con otra fecha.
                    </div>
                  )}
                </div>

                <div className="space-y-4 flex flex-col min-w-0">
                  <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-primary font-medium">Fecha seleccionada</span>
                      <span className="font-semibold text-foreground text-sm">{selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Sin seleccionar"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">Hora</span>
                      <span className="font-medium text-foreground text-sm">{selectedTime || "--:--"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Horario sugerido</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-4 gap-2">
                      {suggestedSlots.map((slot) => {
                        const isSelected = selectedTime === slot;
                        const isPast = isSlotInPast(slot);
                        const isTaken = takenSlots.includes(slot);
                        const disabled = isTaken || isPast || isCheckingAvailability;
                        return (
                          <Button
                            key={slot}
                            type="button"
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className={`w-full justify-center text-xs h-9 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={disabled}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </Button>
                        );
                      })}
                    </div>
                    {takenSlots.length > 0 && (
                      <p className="text-xs text-destructive">Horarios ocupados: {takenSlots.join(", ")}</p>
                    )}
                    {isCheckingAvailability && (
                      <p className="text-xs text-muted-foreground">Verificando disponibilidad...</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hora personalizada</label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notas para el profesional</label>
                    <Textarea
                      placeholder="Comparte detalles útiles: acceso, referencias, materiales..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={500}
                      className="min-h-[100px] resize-none"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {notes.length}/500 caracteres
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {scheduledAt && (
                      <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
                        <AlertDescription className="text-sm">
                          Reservarás el {format(scheduledAt, "PPP 'a las' p", { locale: es })}.
                        </AlertDescription>
                      </Alert>
                    )}

                    {formError && (
                      <Alert variant="destructive">
                        <AlertDescription className="text-sm">{formError}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      className="w-full h-11 text-base font-medium"
                      onClick={handleSubmit}
                      disabled={createBooking.isPending || !scheduledAt}
                    >
                      {createBooking.isPending ? "Creando reserva..." : "Confirmar reserva"}
                    </Button>

                    {!isAuthenticated && (
                      <p className="text-xs text-foreground/60 text-center">
                        Debes iniciar sesión para completar la reserva.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Profesional
                  </CardTitle>
                  <CardDescription>{service.professional?.user?.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Duración: {Math.floor(service.duration / 60)}h {service.duration % 60}m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Ubicación: Aguachica, Cesar</span>
                  </div>
                  <Separator />
                  <div className="text-foreground/80 text-sm leading-relaxed line-clamp-4">
                    {service.description}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Resumen rápido</CardTitle>
                  <CardDescription>Confirma los detalles antes de enviar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-foreground/70">
                  <div className="flex items-center justify-between">
                    <span>Servicio</span>
                    <Badge variant="secondary">{service.title}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Profesional</span>
                    <span className="font-medium">{service.professional?.user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Precio</span>
                    <span className="font-semibold">
                      {service.price
                        ? `${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(service.price)}${service.priceType === "PER_HOUR" ? " / hora" : " por trabajo"}`
                        : "A convenir"}
                    </span>
                  </div>
                  {/* Estado removed to avoid verification messaging */}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
