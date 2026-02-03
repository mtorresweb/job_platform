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

    const userId = session.user.id;

    const messages = await prisma.message.findMany({
      where: {
        isRead: false,
        senderId: { not: userId },
        conversation: {
          OR: [{ clientId: userId }, { professionalId: userId }],
        },
      },
      select: { id: true, conversationId: true },
    });

    const conversationsCount: Record<string, number> = {};
    for (const msg of messages) {
      conversationsCount[msg.conversationId] =
        (conversationsCount[msg.conversationId] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        total: messages.length,
        conversations: conversationsCount,
      },
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 },
    );
  }
}
