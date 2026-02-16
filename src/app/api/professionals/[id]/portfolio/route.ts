import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handlePrismaError } from "@/infrastructure/database/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const professional = await prisma.professional.findUnique({ where: { id } });
    if (!professional) {
      return NextResponse.json({ success: false, message: "Profesional no encontrado" }, { status: 404 });
    }

    const items = await prisma.professionalPortfolio.findMany({
      where: { professionalId: id },
      orderBy: [
        { isCurrent: "desc" },
        { startDate: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Error fetching public portfolio", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json({ success: false, message: prismaError.message }, { status: 500 });
  }
}
