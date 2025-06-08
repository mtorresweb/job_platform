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
    const timeRange = searchParams.get("timeRange") || "6m";    // Calculate date range
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

    // Get client segmentation for professionals
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "PROFESSIONAL") {
      return NextResponse.json(
        { error: "Only professionals can access client segmentation" },
        { status: 403 }
      );
    }

    // Get all bookings for this professional
    const bookings = await prisma.booking.findMany({
      where: {
        service: { professionalId: session.user.id },
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        client: {
          select: {
            id: true,
            createdAt: true
          }
        }
      }
    });

    // Group clients by segments
    const clientSegments = {
      new: new Set<string>(),
      regular: new Set<string>(),
      premium: new Set<string>(),
      corporate: new Set<string>()
    };

    const clientBookingCounts: { [clientId: string]: number } = {};
    
    // Count bookings per client
    bookings.forEach(booking => {
      const clientId = booking.clientId;
      clientBookingCounts[clientId] = (clientBookingCounts[clientId] || 0) + 1;
    });

    // Classify clients
    Object.entries(clientBookingCounts).forEach(([clientId, bookingCount]) => {
      const client = bookings.find(b => b.clientId === clientId)?.client;
      if (!client) return;

      const clientAge = (now.getTime() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24); // days
      
      if (clientAge <= 30) {
        clientSegments.new.add(clientId);
      } else if (bookingCount >= 10) {
        clientSegments.premium.add(clientId);
      } else if (bookingCount >= 5) {
        clientSegments.regular.add(clientId);
      } else if (bookingCount >= 8) {
        clientSegments.corporate.add(clientId);
      } else {
        clientSegments.regular.add(clientId);
      }
    });

    const totalClients = Object.keys(clientBookingCounts).length || 1;

    const clientSegmentation = [
      {
        segment: "Regulares",
        value: Math.round((clientSegments.regular.size / totalClients) * 100),
        color: "#8884d8"
      },
      {
        segment: "Nuevos",
        value: Math.round((clientSegments.new.size / totalClients) * 100),
        color: "#82ca9d"
      },
      {
        segment: "Premium",
        value: Math.round((clientSegments.premium.size / totalClients) * 100),
        color: "#ffc658"
      },
      {
        segment: "Corporativos",
        value: Math.round((clientSegments.corporate.size / totalClients) * 100),
        color: "#ff7300"
      }
    ];

    return NextResponse.json(clientSegmentation);
  } catch (error) {
    console.error("Error fetching client segmentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
