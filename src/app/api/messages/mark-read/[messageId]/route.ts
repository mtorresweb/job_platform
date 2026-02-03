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
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const session = await resolveSession(request);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 },
      );
    }

    const { messageId } = await params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Mensaje no encontrado" },
        { status: 404 },
      );
    }

    const isParticipant =
      message.conversation.clientId === session.user.id ||
      message.conversation.professionalId === session.user.id;

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para esta conversación" },
        { status: 403 },
      );
    }

    // Only mark messages from the other user as read
    if (message.senderId === session.user.id) {
      return NextResponse.json({ success: true, data: message });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true, readAt: new Date() },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    const io = getSocketServer();
    if (io) {
      io.to(`conversation:${message.conversationId}`).emit("message_read", {
        messageId,
        conversationId: message.conversationId,
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Mensaje marcado como leído",
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 },
    );
  }
}
