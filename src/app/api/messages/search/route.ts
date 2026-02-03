import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { auth } from "@/infrastructure/auth/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { handlePrismaError } from "@/infrastructure/database/prisma";

async function resolveSession(request: NextRequest) {
  const nextSession = await getServerSession(authOptions);
  if (nextSession?.user) {
    return { user: nextSession.user } as { user: { id: string } };
  }

  let session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    const authHeader = request.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (bearer) {
      const headers = new Headers();
      headers.set("Authorization", `Bearer ${bearer}`);
      session = await auth.api.getSession({ headers });
    }
  }

  return session;
}

export async function GET(request: NextRequest) {
  try {
    const session = await resolveSession(request);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const conversationId = searchParams.get("conversationId") || undefined;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "La búsqueda debe tener al menos 2 caracteres" },
        { status: 400 },
      );
    }

    const where = {
      content: { contains: query, mode: "insensitive" as const },
      conversation: {
        OR: [
          { clientId: session.user.id },
          { professionalId: session.user.id },
        ],
      },
    } as Record<string, unknown>;

    if (conversationId) {
      where.conversationId = conversationId;
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: {
        messages,
        total: messages.length,
      },
    });
  } catch (error) {
    console.error("Error searching messages:", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 },
    );
  }
}
