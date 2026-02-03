import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { User } from "@/shared/types";

interface ExtendedSession {
  user: User & {
    id: string;
  };
}

// Esquema base para validación
const baseProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  avatar: z.string().optional(),
});

// Esquema extendido para profesionales (campos opcionales para evitar fallos al guardar)
const professionalProfileSchema = baseProfileSchema.extend({
  bio: z
    .string()
    .min(10, "La biografía debe tener al menos 10 caracteres")
    .optional(),
  experience: z.coerce.number().min(0).default(0),
  specialties: z.array(z.string()).max(10).optional().default([]),
});

export async function PATCH(request: Request) {
  try {
    const session = (await getServerSession(
      authOptions,
    )) as ExtendedSession | null;

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.id;

    // Obtener el usuario actual para verificar su rol
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    let validatedData;

    if (currentUser.role === "PROFESSIONAL") {
      validatedData = professionalProfileSchema.parse(data);
    } else {
      validatedData = baseProfileSchema.parse(data);
    }

    // Handle professional and base user data separately
    if (currentUser.role === "PROFESSIONAL") {
      const { bio, experience, specialties, country, ...baseData } =
        validatedData as z.infer<typeof professionalProfileSchema>;

      const professionalData: Record<string, unknown> = {};
      if (bio !== undefined) professionalData.bio = bio;
      professionalData.experience = experience ?? 0;
      professionalData.specialties = specialties ?? [];

      // Mirror location data if present
      if (baseData.address !== undefined) professionalData.address = baseData.address;
      if (baseData.city !== undefined) professionalData.city = baseData.city;
      if (baseData.state !== undefined) professionalData.state = baseData.state;
      if (baseData.zipCode !== undefined) professionalData.zipCode = baseData.zipCode;
      if (country !== undefined) professionalData.country = country;

      const updatedBaseUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...baseData,
          profileCompleted: true,
        },
      });

      const updatedProfessional = currentUser.professional
        ? await prisma.professional.update({
            where: { id: currentUser.professional.id },
            data: professionalData,
          })
        : await prisma.professional.create({
            data: {
              userId,
              ...professionalData,
            },
          });

      return NextResponse.json({
        ...updatedBaseUser,
        professional: updatedProfessional,
      });
    } else {
      // Handle regular user update
      const userData = validatedData as z.infer<typeof professionalProfileSchema>;
      const { country: _omitCountry, bio: _omitBio, experience: _omitExp, specialties: _omitSpecs, ...userPayload } = userData;
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...userPayload,
          profileCompleted: true,
        },
      });

      // Registrar la actividad
      await prisma.activityLog.create({
        data: {
          userId,
          action: "UPDATE_PROFILE",
          resource: "USER",
          resourceId: userId,
          details: {
            changes: validatedData,
          },
        },
      });

      return NextResponse.json(updatedUser);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error al actualizar el perfil:", error);
    return NextResponse.json(
      { error: "Error al actualizar el perfil" },
      { status: 500 },
    );
  }
}
