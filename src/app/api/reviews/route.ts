import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { auth } from '@/infrastructure/auth/auth';
import { reviewSchema } from '@/shared/utils/validations';
import { handlePrismaError } from '@/infrastructure/database/prisma';

export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;
    let userName: string | null = null;

    const nextAuthSession = await getServerSession(authOptions);
    if (nextAuthSession?.user?.id) {
      userId = nextAuthSession.user.id;
      userName = nextAuthSession.user.name || null;
    } else {
      const betterSession = await auth.api.getSession({ headers: request.headers });
      if (betterSession?.user?.id) {
        userId = betterSession.user.id;
        userName = betterSession.user.name || null;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = reviewSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { bookingId, rating, comment } = validatedData.data;

    // Verify booking exists and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true,
        service: {
          include: {
            professional: true,
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

    if (booking.clientId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Solo el cliente puede crear una reseña' },
        { status: 403 }
      );
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, message: 'Solo se pueden reseñar servicios completados' },
        { status: 400 }
      );
    }

    if (booking.review) {
      return NextResponse.json(
        { success: false, message: 'Ya existe una reseña para esta reserva' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        clientId: userId,
        professionalId: booking.professionalId,
        rating,
        comment,
        isVerified: true, // Auto-verify since it's from a completed booking
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        booking: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Recalcular rating y conteo después de crear la reseña
    const stats = await prisma.review.aggregate({
      where: { professionalId: booking.professionalId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const reviewCount = Number((stats._count as { _all?: number })?._all ?? 0);
    const ratingAvg = Number(stats._avg.rating ?? 0);

    const updatedProfessional = await prisma.professional.update({
      where: { userId: booking.professionalId },
      data: {
        rating: Math.round(ratingAvg * 10) / 10, // Round to 1 decimal
        reviewCount,
      },
      select: {
        id: true,
        userId: true,
        rating: true,
        reviewCount: true,
      },
    });

    // Create notification for professional
    await prisma.notification.create({
      data: {
        userId: booking.professionalId,
        title: 'Nueva reseña',
        message: `${userName || 'Un cliente'} ha dejado una reseña para tu servicio`,
        type: 'NEW_REVIEW',
        relatedId: review.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        review,
        professional: updatedProfessional,
      },
      message: 'Reseña creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating review:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const serviceId = searchParams.get('serviceId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (professionalId) {
      where.professionalId = professionalId;
    }

    if (serviceId) {
      where.booking = {
        serviceId: serviceId,
      };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          booking: {
            include: {
              service: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        total,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
