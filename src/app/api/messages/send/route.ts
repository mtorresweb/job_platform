import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { auth } from "@/infrastructure/auth/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { messageSchema } from "@/shared/utils/validations";
import { handlePrismaError } from "@/infrastructure/database/prisma";
import { getSocketServer } from "@/infrastructure/socket/io-instance";

async function resolveSession(request: NextRequest) {
  const nextSession = await getServerSession(authOptions);
  if (nextSession?.user) {
    return { user: nextSession.user } as { user: { id: string; name?: string } };
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

export async function POST(request: NextRequest) {
  try {
    const session = await resolveSession(request);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 },
      );
    }

    const rawBody = await request.json();
    const parsed = messageSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { conversationId, content, messageType } = parsed.data;
    const { fileName, fileSize, fileMimeType } = rawBody as {
      fileName?: string;
      fileSize?: number;
      fileMimeType?: string;
    };

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
        {
          success: false,
          message: "No tienes permisos para enviar mensajes en esta conversación",
        },
        { status: 403 },
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content,
        messageType,
        fileName,
        fileSize,
        fileMimeType,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update conversation timestamp for ordering
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    const recipientId =
      conversation.clientId === session.user.id
        ? conversation.professionalId
        : conversation.clientId;

    // Create notification for the recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: "Nuevo mensaje",
        message: `${session.user.name || "Alguien"} te ha enviado un mensaje`,
        type: "NEW_MESSAGE",
        relatedId: conversationId,
      },
    });

    // Emit real-time events if socket server is available
    const io = getSocketServer();
    if (io) {
      io.to(`conversation:${conversationId}`).emit("new_message", {
        conversationId,
        message,
      });

      io.to(`user:${recipientId}`).emit("new_notification", {
        id: message.id,
        title: "Nuevo mensaje",
        message: `${session.user.name || "Alguien"} te ha enviado un mensaje`,
        type: "NEW_MESSAGE",
        relatedId: conversationId,
      });
    }

    return NextResponse.json({
      success: true,
      data: message,
      message: "Mensaje enviado exitosamente",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 },
    );
  }
}
