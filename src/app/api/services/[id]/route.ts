import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { auth } from "@/infrastructure/auth/auth";
import { serviceSchema } from '@/shared/utils/validations';
import { handlePrismaError } from '@/infrastructure/database/prisma';

async function getAuthenticatedUserId(headers: Headers): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  try {
    const betterSession = await auth.api.getSession({ headers });
    if (betterSession?.user?.id) return betterSession.user.id;
  } catch (error) {
    console.error("Error obteniendo sesión better-auth:", error);
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            availability: true,
          },
        },
        bookings: {
          where: { status: 'COMPLETED' },
          select: { id: true },
        },
        _count: {
          select: {
            bookings: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Servicio no encontrado' },
        { status: 404 }
      );
    }    // Increment view count
    await prisma.service.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
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
    const userId = await getAuthenticatedUserId(request.headers);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );    }

    const body = await request.json();
    const validatedData = serviceSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id } = await params;
    // Verify ownership
    const service = await prisma.service.findUnique({
      where: { id },
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

    if (service.professional.user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para editar este servicio' },
        { status: 403 }
      );    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: validatedData.data,
      include: {
        category: true,
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedService,
      message: 'Servicio actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating service:', error);
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
    const userId = await getAuthenticatedUserId(request.headers);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    // Verify ownership
    const service = await prisma.service.findUnique({
      where: { id },
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

    if (service.professional.user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para eliminar este servicio' },
        { status: 403 }
      );    }

    // Check for pending bookings
    const pendingBookings = await prisma.booking.count({
      where: {
        serviceId: id,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (pendingBookings > 0) {
      return NextResponse.json(
        { success: false, message: 'No se puede eliminar un servicio con reservas pendientes' },
        { status: 400 }
      );
    }

    // Soft delete - mark as inactive
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Servicio eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
