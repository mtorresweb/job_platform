import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { prisma } from "@/lib/prisma";
import { User } from "@/shared/types";

interface ExtendedSession {
  user: User & {
    id: string;
  };
}

export async function GET() {
  try {
    const session = (await getServerSession(
      authOptions,
    )) as ExtendedSession | null;

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        professional: {
          select: {
            id: true,
            bio: true,
            experience: true,
            specialties: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
            address: true,
            city: true,
            state: true,
            country: true,
            zipCode: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Omitir campos sensibles
    const { password: _, ...userWithoutPassword } = user; // eslint-disable-line @typescript-eslint/no-unused-vars

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del usuario" },
      { status: 500 },
    );
  }
}
