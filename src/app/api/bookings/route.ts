import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { bookingSchema } from '@/shared/utils/validations';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import { Prisma, BookingStatus } from '@prisma/client';

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // 'client' or 'professional'

    const skip = (page - 1) * limit;    // Build where clause based on user role
    const where: Prisma.BookingWhereInput = {};
    
    if (role === 'professional') {
      // User is viewing bookings as a professional
      where.professionalId = session.user.id;
    } else {
      // User is viewing bookings as a client
      where.clientId = session.user.id;
    }    if (status) {
      where.status = status as BookingStatus;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,        include: {
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
              duration: true,
              images: true,
            },
          },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        total,
        hasMore: skip + limit < total,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
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
    const validatedData = bookingSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: validatedData.data.serviceId },
      include: {
        professional: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    if (!service.isActive) {
      return NextResponse.json(
        { success: false, message: 'Servicio no disponible' },
        { status: 400 }
      );
    }

    // Check if user is trying to book their own service
    if (service.professional.user.id === session.user.id) {
      return NextResponse.json(
        { success: false, message: 'No puedes reservar tu propio servicio' },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        professionalId: service.professional.user.id,
        scheduledAt: validatedData.data.scheduledAt,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { success: false, message: 'El horario seleccionado no está disponible' },
        { status: 400 }
      );
    }    const booking = await prisma.booking.create({
      data: {
        clientId: session.user.id,
        professionalId: service.professional.user.id,
        serviceId: service.id,
        scheduledAt: validatedData.data.scheduledAt,
        duration: service.duration,
        totalPrice: service.price || 0.0,
        notes: validatedData.data.notes,
      },
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
        },        service: {
          select: {
            id: true,
            title: true,
            duration: true,
            images: true,
          },
        },
      },
    });

    // Update service booking count
    await prisma.service.update({
      where: { id: service.id },
      data: { bookingCount: { increment: 1 } },
    });

    // Create notification for professional
    await prisma.notification.create({
      data: {
        userId: service.professional.user.id,
        title: 'Nueva reserva',
        message: `${session.user.name} ha solicitado reservar tu servicio "${service.title}"`,
        type: 'BOOKING_REQUEST',
        relatedId: booking.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Reserva creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
