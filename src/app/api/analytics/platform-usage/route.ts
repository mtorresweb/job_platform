import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handlePrismaError } from "@/infrastructure/database/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "500", 10);

    // Fetch recent login activity logs and aggregate in memory
    const logs = await prisma.activityLog.findMany({
      where: { action: "login", resource: "auth" },
      orderBy: { createdAt: "desc" },
      take: Math.max(100, Math.min(limit, 2000)),
    });

    const counts: Record<string, number> = {};
    for (const log of logs) {
      const platform = (log.details as any)?.platform || "Desconocido";
      counts[platform] = (counts[platform] || 0) + 1;
    }

    const total = Object.values(counts).reduce((sum, v) => sum + v, 0);
    const platforms = Object.entries(counts)
      .map(([platform, count]) => ({ platform, count, percentage: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ success: true, data: { total, platforms } });
  } catch (error) {
    console.error("Error fetching platform usage stats:", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json({ success: false, message: prismaError.message }, { status: 500 });
  }
}
