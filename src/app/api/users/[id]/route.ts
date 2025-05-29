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
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        professional: {
          include: {
            services: {
              where: { isActive: true },
              take: 5,
              include: {
                category: true,
                _count: {
                  select: {
                    bookings: {
                      where: { status: 'COMPLETED' }
                    }
                  }
                }
              }
            },
            availability: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );    }

    // Remove sensitive information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = user;

    return NextResponse.json({
      success: true,
      data: publicUser,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
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
    // Users can only update their own profile
    if (session.user.id !== id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permisos para editar este perfil' },
        { status: 403 }
      );    }

    const body = await request.json();    const { name, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        avatar,
      },
      include: {
        professional: {
          include: {
            services: {
              where: { isActive: true },
              take: 5,
            },
          },
        },
      },    });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = updatedUser;

    return NextResponse.json({
      success: true,
      data: publicUser,
      message: 'Perfil actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
