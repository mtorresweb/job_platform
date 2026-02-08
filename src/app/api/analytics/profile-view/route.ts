import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handlePrismaError } from "@/infrastructure/database/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const professionalId = body?.professionalId as string | undefined;

    if (!professionalId) {
      return NextResponse.json({ success: false, message: "professionalId es requerido" }, { status: 400 });
    }

    await prisma.professional.update({
      where: { id: professionalId },
      data: { profileViewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementando vistas de perfil", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json({ success: false, message: prismaError.message }, { status: 500 });
  }
}
