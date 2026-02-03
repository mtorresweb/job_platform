import { NextRequest, NextResponse } from "next/server";
import { NotificationType } from "@prisma/client";
import { auth } from "@/infrastructure/auth/auth";
import { prisma } from "@/infrastructure/database/prisma";
import { handlePrismaError } from "@/infrastructure/database/prisma";
import { reviewResponseSchema } from "@/shared/utils/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = reviewResponseSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const review = await prisma.review.findUnique({
      where: { id },
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

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Reseña no encontrada" },
        { status: 404 },
      );
    }

    if (review.professionalId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Solo el profesional puede responder la reseña" },
        { status: 403 },
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        response: validated.data.response,
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

    await prisma.notification.create({
      data: {
        userId: review.clientId,
        title: "Respuesta a tu reseña",
        message: `${session.user.name || "El profesional"} respondió a tu reseña de "${review.booking.service.title}"`,
        type: NotificationType.NEW_REVIEW,
        relatedId: review.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: "Respuesta guardada correctamente",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 },
    );
  }
}
