import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { messageSchema } from '@/shared/utils/validations';
import { handlePrismaError } from '@/infrastructure/database/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const { conversationId } = await params;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversación no encontrada' },
        { status: 404 }
      );
    }

    if (conversation.clientId !== session.user.id && conversation.professionalId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para ver esta conversación' },
        { status: 403 }
      );    }    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      conversationId: conversationId,
    };

    if (unreadOnly) {
      where.isRead = false;
      where.senderId = { not: session.user.id }; // Only unread messages from others
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        total,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = messageSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }    const { conversationId, content, messageType = 'TEXT' } = validatedData.data;
    
    // Handle optional file properties that might be sent with file messages
    const bodyData = body as {
      conversationId: string;
      content: string;
      messageType?: string;
      fileName?: string;
      fileSize?: number;
      fileMimeType?: string;
    };
    
    const { fileName, fileSize, fileMimeType } = bodyData;

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversación no encontrada' },
        { status: 404 }
      );
    }

    if (conversation.clientId !== session.user.id && conversation.professionalId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para enviar mensajes en esta conversación' },
        { status: 403 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content,
        messageType: messageType as 'TEXT' | 'FILE' | 'IMAGE',
        fileName,
        fileSize,
        fileMimeType,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
      },
    });

    // Create notification for the other user
    const recipientId = conversation.clientId === session.user.id 
      ? conversation.professionalId 
      : conversation.clientId;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: 'Nuevo mensaje',
        message: `${session.user.name} te ha enviado un mensaje`,
        type: 'NEW_MESSAGE',
        relatedId: conversationId,
      },
    });

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Mensaje enviado exitosamente',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
