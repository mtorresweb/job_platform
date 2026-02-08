import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/config';

async function resolveSession(request: NextRequest) {
  const nextSession = await getServerSession(authOptions);
  if (nextSession?.user) {
    return { user: nextSession.user } as { user: { id: string } };
  }

  let session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (bearer) {
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${bearer}`);
      session = await auth.api.getSession({ headers });
    }
  }

  return session;
}

export async function POST(request: NextRequest) {
  try {
    const session = await resolveSession(request);

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

    // Resolve current user and target user so we can place each side correctly
    const [currentUser, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true },
      }),
      prisma.user.findUnique({
        where: { id: professionalId },
        select: { id: true, role: true },
      }),
    ]);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Usuario destino no encontrado' },
        { status: 404 }
      );
    }

    const isCurrentProfessional = currentUser.role === 'PROFESSIONAL';
    const isTargetProfessional = targetUser.role === 'PROFESSIONAL';

    if (!isCurrentProfessional && !isTargetProfessional) {
      return NextResponse.json(
        {
          success: false,
          message: 'La conversación requiere un profesional como participante',
        },
        { status: 400 }
      );
    }

    // Determine which side is client/professional
    const clientId = isCurrentProfessional ? targetUser.id : currentUser.id;
    const targetProfessionalId = isCurrentProfessional ? currentUser.id : targetUser.id;

    if (clientId === targetProfessionalId) {
      // Evita error cuando la URL trae tu propio id; simplemente responde ok sin crear
      return NextResponse.json({ success: true, message: 'Conversación no creada: mismo usuario' });
    }

    const includeRelations = {
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
    };

    const conversation = await prisma.conversation.upsert({
      where: {
        clientId_professionalId: {
          clientId,
          professionalId: targetProfessionalId,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        clientId,
        professionalId: targetProfessionalId,
      },
      include: includeRelations,
    });

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
