import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { authOptions } from '@/infrastructure/auth/config';
import { getServerSession } from 'next-auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';

type ResolvedUser = { id: string; role?: string } | undefined;

async function resolveUser(request: NextRequest): Promise<ResolvedUser> {
  const session = await getServerSession(authOptions);
  if (session?.user) return { id: session.user.id, role: (session.user as any).role };
  const betterAuthSession = await auth.api.getSession({ headers: request.headers });
  if (betterAuthSession?.user) {
    return { id: betterAuthSession.user.id, role: (betterAuthSession.user as any).role };
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const user = await resolveUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const scope = searchParams.get('scope'); // 'all' for admin

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (scope === 'all') {
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, message: 'Solo administradores' },
          { status: 403 }
        );
      }
      // no userId filter
    } else {
      where.userId = user.id;
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        total,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await resolveUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Mark all notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
