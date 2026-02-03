import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { prisma } from "@/infrastructure/database/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "6m";

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case "1m":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Get bookings by hour for the current user
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { clientId: session.user.id },
          { service: { professionalId: session.user.id } }
        ],
        createdAt: {
          gte: startDate,
          lte: now
        }
      },      select: {
        createdAt: true,
        scheduledAt: true
      }
    });

    // Group bookings by hour
    const hourlyData: { [key: string]: number } = {};
    
    // Initialize all hours with 0
    for (let hour = 8; hour <= 19; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      hourlyData[hourStr] = 0;
    }

    // Count bookings by hour
    bookings.forEach(booking => {
      const bookingDate = booking.scheduledAt || booking.createdAt;
      const hour = bookingDate.getHours();
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      
      if (hour >= 8 && hour <= 19) {
        hourlyData[hourStr]++;
      }
    });

    // Convert to array format
    const timeAnalytics = Object.entries(hourlyData).map(([hour, bookings]) => ({
      hour,
      bookings
    }));

    return NextResponse.json(timeAnalytics);
  } catch (error) {
    console.error("Error fetching time analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
