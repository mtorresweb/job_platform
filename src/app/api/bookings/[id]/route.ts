import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { authOptions } from '@/infrastructure/auth/config';
import { updateBookingStatusSchema } from '@/shared/utils/validations';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import { BookingStatus, NotificationType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { getToken, decode } from 'next-auth/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ResolvedUser = { id: string; role?: string } | undefined;

async function resolveUser(request: NextRequest): Promise<{ user: ResolvedUser; debug: Record<string, unknown> }> {
  const session = await getServerSession(authOptions);
  let token = !session?.user
    ? await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    : null;

  if (!session?.user && !token) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieMap = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );
    const rawToken = cookieMap['next-auth.session-token'] || cookieMap['__Secure-next-auth.session-token'];
    if (rawToken) {
      token = await decode({ token: rawToken, secret: process.env.NEXTAUTH_SECRET });
    }
  }

  const betterAuthSession = !session?.user && !token
    ? await auth.api.getSession({ headers: request.headers })
    : null;

  const user: ResolvedUser = session?.user ?? (token ? { id: token.sub as string, role: (token as any)?.role as string } : undefined) ?? betterAuthSession?.user;

  const debug = {
    sessionUser: session?.user?.id,
    tokenSub: token?.sub,
    tokenRole: (token as any)?.role,
    betterAuthUser: betterAuthSession?.user?.id,
    hasCookie: (request.headers.get('cookie') || '').includes('next-auth'),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('[BOOKINGS AUTH]', debug);
  }

  return { user, debug };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, debug } = await resolveUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado', debug: process.env.NODE_ENV !== 'production' ? debug : undefined },
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
    if (booking.clientId !== user.id && booking.professionalId !== user.id) {
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
    const { user, debug } = await resolveUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado', debug: process.env.NODE_ENV !== 'production' ? debug : undefined },
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
    const { status, cancellationReason, scheduledAt, message } = validatedData.data;

    const isClient = booking.clientId === user.id;
    const isProfessional = booking.professionalId === user.id;

    if (!isClient && !isProfessional) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para gestionar esta reserva' },
        { status: 403 }
      );
    }

    if (status) {
      if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
        // Solo el profesional puede marcar progreso o completar
        if (!isProfessional) {
          return NextResponse.json(
            { success: false, message: 'Solo el profesional puede actualizar este estado' },
            { status: 403 }
          );
        }
      }
    }

    // Validar transiciones solo si hay cambio de estado
    if (status) {
      const validTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'COMPLETED'],
        IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
        COMPLETED: [],
        CANCELLED: [],
      };

      if (!validTransitions[booking.status]?.includes(status)) {
        return NextResponse.json(
          { success: false, message: 'Transición de estado inválida' },
          { status: 400 }
        );
      }
    }

    // Validar reagendado
    let newDate: Date | undefined;
    if (scheduledAt) {
      newDate = new Date(scheduledAt);

      if (!isClient) {
        return NextResponse.json(
          { success: false, message: 'Solo el cliente puede reagendar la reserva' },
          { status: 403 }
        );
      }

      if ([BookingStatus.CANCELLED, BookingStatus.COMPLETED].includes(booking.status)) {
        return NextResponse.json(
          { success: false, message: 'No se puede reagendar una reserva cancelada o completada' },
          { status: 400 }
        );
      }

      // Conflictos de agenda del profesional
      const conflicting = await prisma.booking.findFirst({
        where: {
          professionalId: booking.professionalId,
          scheduledAt: newDate,
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
          id: { not: booking.id },
        },
      });

      if (conflicting) {
        return NextResponse.json(
          { success: false, message: 'El horario seleccionado no está disponible' },
          { status: 400 }
        );
      }
    }

    // Actualizar reserva
    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = cancellationReason ?? message;
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }

    if (newDate) {
      updateData.scheduledAt = newDate;
    }

    if (message && status !== 'CANCELLED') {
      const previousNotes = booking.notes ? `${booking.notes}\n\n` : '';
      const actor = isClient ? 'Cliente' : 'Profesional';
      updateData.notes = `${previousNotes}${actor}: ${message}`;
    }

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
    });

    // Crear notificaciones (asegurando que el profesional siempre reciba aviso)
    const notifications: Array<{ userId: string; title: string; message: string; type: NotificationType; metadata: Record<string, unknown> }> = [];

    const baseMetadata = {
      serviceTitle: booking.service.title,
      bookingId: booking.id,
      status: status ?? booking.status,
      scheduledAt: newDate ?? booking.scheduledAt,
      message,
      actorId: user.id,
    };

    const addNotification = (
      userId: string,
      title: string,
      note: string,
      type: NotificationType
    ) => {
      // Avoid duplicates for same user/type in this operation
      const exists = notifications.some((n) => n.userId === userId && n.type === type);
      if (exists) return;
      notifications.push({
        userId,
        title,
        message: note,
        type,
        metadata: baseMetadata,
      });
    };

    if (status === 'CONFIRMED') {
      const counterpart = booking.clientId === user.id ? booking.professionalId : booking.clientId;
      addNotification(counterpart, 'Reserva confirmada', `La reserva para "${booking.service.title}" ha sido confirmada`, NotificationType.BOOKING_CONFIRMED);
      addNotification(booking.professionalId, 'Reserva confirmada', `La reserva para "${booking.service.title}" está confirmada.`, NotificationType.BOOKING_CONFIRMED);
    } else if (status === 'CANCELLED') {
      const counterpart = booking.clientId === user.id ? booking.professionalId : booking.clientId;
      addNotification(counterpart, 'Reserva cancelada', `La reserva para "${booking.service.title}" ha sido cancelada`, NotificationType.BOOKING_CANCELLED);
      addNotification(booking.professionalId, 'Reserva cancelada', `Se canceló la reserva para "${booking.service.title}"`, NotificationType.BOOKING_CANCELLED);
    } else if (status === 'COMPLETED') {
      addNotification(booking.clientId, 'Servicio completado', `El servicio "${booking.service.title}" ha sido completado`, NotificationType.SERVICE_COMPLETED);
      addNotification(booking.professionalId, 'Servicio completado', `Marcaste como completado "${booking.service.title}"`, NotificationType.SERVICE_COMPLETED);
    } else if (newDate) {
      // Reagendado: solo el cliente puede iniciarlo, pero garantizamos aviso al profesional
      const counterpart = isClient ? booking.professionalId : booking.clientId;
      addNotification(counterpart, 'Solicitud de cambio de horario', `Hay una nueva propuesta de horario para "${booking.service.title}"`, NotificationType.BOOKING_REQUEST);
      addNotification(booking.professionalId, 'Solicitud de cambio de horario', `Recibiste una propuesta de nuevo horario para "${booking.service.title}"`, NotificationType.BOOKING_REQUEST);
    }

    if (notifications.length) {
      await Promise.all(
        notifications.map((n) =>
          prisma.notification.create({
            data: {
              userId: n.userId,
              title: n.title,
              message: n.message,
              type: n.type,
              relatedId: booking.id,
              metadata: n.metadata,
            },
          })
        )
      );
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
