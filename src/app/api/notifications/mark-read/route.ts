import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { authOptions } from '@/infrastructure/auth/config';
import { getServerSession } from 'next-auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';

type ResolvedUser = { id: string } | undefined;

async function resolveUser(request: NextRequest): Promise<ResolvedUser> {
  const session = await getServerSession(authOptions);
  if (session?.user) return session.user;
  const betterAuthSession = await auth.api.getSession({ headers: request.headers });
  return betterAuthSession?.user;
}

// POST /api/notifications/mark-read - Mark specific notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await resolveUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    if (!data.notificationIds || !Array.isArray(data.notificationIds) || data.notificationIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Se requieren IDs de notificaciones' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    await prisma.notification.updateMany({
      where: {
        id: { in: data.notificationIds },
        userId: user.id,  // Security: ensure user only updates their notifications
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${data.notificationIds.length} notificaciones marcadas como leídas`,
    });
  } catch (error) {
    console.error('Error marking specific notifications as read:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
