import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { updateBookingStatusSchema } from '@/shared/utils/validations';
import { handlePrismaError } from '@/infrastructure/database/prisma';

export async function GET(
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
    const booking = await prisma.booking.findUnique({
      where: { id },
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
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            duration: true,
            images: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Check if user has access to this booking
    if (booking.clientId !== session.user.id && booking.professionalId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para ver esta reserva' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const validatedData = updateBookingStatusSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Check permissions based on status change
    const { status, cancellationReason } = validatedData.data;
    
    if (status === 'CONFIRMED' || status === 'IN_PROGRESS' || status === 'COMPLETED') {
      // Only professional can confirm/start/complete
      if (booking.professionalId !== session.user.id) {
        return NextResponse.json(
          { success: false, message: 'Solo el profesional puede actualizar este estado' },
          { status: 403 }
        );
      }
    } else if (status === 'CANCELLED') {
      // Both client and professional can cancel
      if (booking.clientId !== session.user.id && booking.professionalId !== session.user.id) {
        return NextResponse.json(
          { success: false, message: 'No tienes permisos para cancelar esta reserva' },
          { status: 403 }
        );
      }
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // Can't change from completed
      CANCELLED: [], // Can't change from cancelled
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Transición de estado inválida' },
        { status: 400 }
      );
    }    // Update booking
    const updateData: Record<string, unknown> = { status };
    
    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason;
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
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
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            images: true,
          },
        },
      },
    });    // Create notifications
    let notificationUserId: string | undefined;
    let notificationTitle: string | undefined;
    let notificationMessage: string | undefined;
    let notificationType: string | undefined;

    if (status === 'CONFIRMED') {
      notificationUserId = booking.clientId;
      notificationTitle = 'Reserva confirmada';
      notificationMessage = `Tu reserva para "${booking.service.title}" ha sido confirmada`;
      notificationType = 'BOOKING_CONFIRMED';
    } else if (status === 'CANCELLED') {
      notificationUserId = booking.clientId === session.user.id ? booking.professionalId : booking.clientId;
      notificationTitle = 'Reserva cancelada';
      notificationMessage = `La reserva para "${booking.service.title}" ha sido cancelada`;
      notificationType = 'BOOKING_CANCELLED';
    } else if (status === 'COMPLETED') {
      notificationUserId = booking.clientId;
      notificationTitle = 'Servicio completado';
      notificationMessage = `El servicio "${booking.service.title}" ha sido completado`;
      notificationType = 'SERVICE_COMPLETED';
    }    if (notificationUserId && notificationTitle && notificationMessage && notificationType) {
      await prisma.notification.create({
        data: {
          userId: notificationUserId,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType as 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'SERVICE_COMPLETED',
          relatedId: booking.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Estado de la reserva actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
