import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/config';

async function resolveSession(request: NextRequest) {
  // 1) Try NextAuth session
  const nextSession = await getServerSession(authOptions);
  if (nextSession?.user) {
    return { user: nextSession.user } as { user: { id: string } };
  }

  // 2) Try better-auth via cookies/headers
  let session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (bearer) {
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${bearer}`);
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

    const [conversations, total, unreadCounts] = await Promise.all([
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
      prisma.message.groupBy({
        by: ['conversationId'],
        where: {
          isRead: false,
          senderId: { not: session.user.id },
          conversation: { OR: [{ clientId: session.user.id }, { professionalId: session.user.id }] },
        },
        _count: true,
      }),
    ]);

    const unreadCountMap = unreadCounts.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.conversationId] = curr._count;
      return acc;
    }, {});

    // Transform to include lastMessage and user-specific unread count
    const transformedConversations = conversations.map((conv) => ({
      ...conv,
      unreadCount: unreadCountMap[conv.id] || 0,
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
