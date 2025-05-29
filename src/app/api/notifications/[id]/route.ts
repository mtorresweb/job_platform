import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para modificar esta notificación' },
        { status: 403 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: 'Notificación marcada como leída',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para eliminar esta notificación' },
        { status: 403 }
      );    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Notificación eliminada',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
