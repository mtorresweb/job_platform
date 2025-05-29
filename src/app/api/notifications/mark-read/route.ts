import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';

// POST /api/notifications/mark-read - Mark specific notifications as read
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
        userId: session.user.id,  // Security: ensure user only updates their notifications
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
