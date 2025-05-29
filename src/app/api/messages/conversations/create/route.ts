import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';

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
    const { professionalId } = body;

    if (!professionalId) {
      return NextResponse.json(
        { success: false, message: 'ID del profesional es requerido' },
        { status: 400 }
      );
    }

    // Check if professional exists
    const professional = await prisma.user.findUnique({
      where: { id: professionalId, role: 'PROFESSIONAL' },
    });

    if (!professional) {
      return NextResponse.json(
        { success: false, message: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        clientId: session.user.id,
        professionalId: professionalId,
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
        },
      },
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          clientId: session.user.id,
          professionalId: professionalId,
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
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
