import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isActive = searchParams.get('isActive') !== 'false';

    const skip = (page - 1) * limit;

    const where = {
      isActive,
      OR: [
        { clientId: session.user.id },
        { professionalId: session.user.id },
      ],
    };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              messageType: true,
              senderId: true,
              createdAt: true,
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.conversation.count({ where }),
    ]);

    // Transform to include lastMessage
    const transformedConversations = conversations.map((conv) => ({
      ...conv,
      lastMessage: conv.messages[0] || null,
      messages: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        conversations: transformedConversations,
        total,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
