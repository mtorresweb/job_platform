import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find professional by professional ID first, then by user ID
    let professional = await prisma.professional.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        services: {
          where: { isActive: true },
          include: {
            category: true,
            _count: {
              select: {
                bookings: {
                  where: { status: 'COMPLETED' }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
        availability: {
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            services: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    // If not found by professional ID, try by user ID (for backward compatibility)
    if (!professional) {
      professional = await prisma.professional.findUnique({
        where: { userId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              createdAt: true,
            },
          },
          services: {
            where: { isActive: true },
            include: {
              category: true,
              _count: {
                select: {
                  bookings: {
                    where: { status: 'COMPLETED' }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' },
          },
          availability: {
            orderBy: { dayOfWeek: 'asc' },
          },
          _count: {
            select: {
              services: {
                where: { isActive: true },
              },
            },
          },
        },
      });
    }

    if (!professional) {
      return NextResponse.json(
        { success: false, message: 'Profesional no encontrado' },
        { status: 404 }
      );    }

    // Get recent reviews
    const reviews = await prisma.review.findMany({
      where: { professionalId: id },
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
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...professional,
        reviews,
      },
    });
  } catch (error) {
    console.error('Error fetching professional:', error);
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

    const { id } = await params;
    // Only the professional themselves can update their profile
    if (session.user.id !== id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para editar este perfil' },
        { status: 403 }
      );
    }

    const body = await request.json();    const {
      bio,
      experience,
      specialties,
      hourlyRate,
      address,
      city,
      state,
      availability,
    } = body;    // Update professional profile
    const updatedProfessional = await prisma.professional.update({
      where: { userId: id },      data: {
        bio,
        experience,
        specialties,
        hourlyRate,
        address,
        city,
        state,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        services: {
          where: { isActive: true },
          include: {
            category: true,
          },
        },
        availability: true,
      },
    });

    // Update availability if provided
    if (availability && Array.isArray(availability)) {
      // Delete existing availability
      await prisma.availability.deleteMany({
        where: { professionalId: updatedProfessional.id },
      });      // Create new availability
      if ((availability as unknown[]).length > 0) {
        await prisma.availability.createMany({
          data: (availability as Array<{
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            isAvailable: boolean;
          }>).map((slot) => ({
            professionalId: updatedProfessional.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable,
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedProfessional,
      message: 'Perfil profesional actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating professional:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
