import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { auth } from "@/infrastructure/auth/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { handlePrismaError } from "@/infrastructure/database/prisma";
import { getSocketServer } from "@/infrastructure/socket/io-instance";

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const session = await resolveSession(request);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 },
      );
    }

    const { conversationId } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Conversación no encontrada" },
        { status: 404 },
      );
    }

    const isParticipant =
      conversation.clientId === session.user.id ||
      conversation.professionalId === session.user.id;

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para esta conversación" },
        { status: 403 },
      );
    }

    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    const io = getSocketServer();
    if (io) {
      io.to(`conversation:${conversationId}`).emit("message_read", {
        conversationId,
      });
    }

    return NextResponse.json({
      success: true,
      data: { updated: result.count },
      message: "Conversación marcada como leída",
    });
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 },
    );
  }
}
