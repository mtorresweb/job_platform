import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { BookingStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get("professionalId");
    const dateParam = searchParams.get("date");
    const durationParam = searchParams.get("duration");

    if (!professionalId || !dateParam || !durationParam) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros obligatorios" },
        { status: 400 }
      );
    }

    const duration = Number(durationParam);
    if (Number.isNaN(duration) || duration <= 0) {
      return NextResponse.json(
        { success: false, message: "Duración inválida" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, message: "Fecha inválida" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return NextResponse.json(
        { success: false, message: "No se pueden agendar fechas pasadas", available: false, takenSlots: [] },
        { status: 200 }
      );
    }

    // Use the incoming date (already normalized to the client's local midnight) as the lower bound
    // to avoid timezone shifts that hide bookings from the same calendar day.
    const startOfDay = new Date(date);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Get bookings for that professional on the selected day (excluding cancel/completed)
    const bookings = await prisma.booking.findMany({
      where: {
        professionalId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
        },
        scheduledAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Build taken slots relative to the requested day to avoid timezone drift
    const takenSlots = bookings.map((b) => {
      const scheduled = new Date(b.scheduledAt);
      const minutesFromStart = Math.max(0, Math.round((scheduled.getTime() - startOfDay.getTime()) / 60000));
      const hh = Math.floor(minutesFromStart / 60)
        .toString()
        .padStart(2, "0");
      const mm = (minutesFromStart % 60).toString().padStart(2, "0");
      return `${hh}:${mm}`;
    });

    // Simple availability flag: slot available if not taken
    const available = takenSlots.length === 0;

    return NextResponse.json({
      success: true,
      available,
      takenSlots,
      suggestedTimes: [],
    });
  } catch (error) {
    console.error("Error checking availability", error);
    return NextResponse.json(
      { success: false, message: "Error al verificar disponibilidad" },
      { status: 500 }
    );
  }
}
