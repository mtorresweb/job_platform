import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { auth } from "@/infrastructure/auth/auth";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { z } from "zod";

const createAdminSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const toggleUserSchema = z.object({
  userId: z.string().min(1),
  isActive: z.boolean(),
});

function isAdminRole(role?: string | null): boolean {
  return role === "ADMIN";
}

async function resolveSession(request: NextRequest) {
  const nextSession = await getServerSession(authOptions);
  if (nextSession?.user) {
    return { user: nextSession.user } as { user: { id: string } };
  }

  let session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    const authHeader = request.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (bearer) {
      const headers = new Headers();
      headers.set("Authorization", `Bearer ${bearer}`);
      session = await auth.api.getSession({ headers });
    }
  }

  return session;
}

export async function GET(request: NextRequest) {
  try {
    const session = await resolveSession(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!isAdminRole(currentUser?.role)) {
      return NextResponse.json(
        { success: false, message: "Solo administradores pueden listar usuarios" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 100);

    const where = query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listando usuarios (admin):", error);
    return NextResponse.json(
      { success: false, message: "Error interno al listar usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await resolveSession(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!isAdminRole(currentUser?.role)) {
      return NextResponse.json(
        { success: false, message: "Solo administradores pueden crear otros administradores" },
        { status: 403 }
      );
    }

    const rawBody = await request.json();
    const parsed = createAdminSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Datos inválidos", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Ya existe un usuario con este correo" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ADMIN",
        profileCompleted: true,
        isActive: true,
        isEmailVerified: true,
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
      },
    });

    await prisma.$executeRawUnsafe(
      `INSERT INTO accounts ("id", "userId", "type", "provider", "providerAccountId")
       VALUES ($1, $2, $3, $4, $5)`,
      randomUUID(),
      user.id,
      "credentials",
      "credentials",
      email
    );

    const { password: _pw, ...safeUser } = user;

    return NextResponse.json(
      { success: true, message: "Administrador creado", user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando administrador:", error);
    return NextResponse.json(
      { success: false, message: "Error interno al crear administrador" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await resolveSession(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!isAdminRole(currentUser?.role)) {
      return NextResponse.json(
        { success: false, message: "Solo administradores pueden modificar usuarios" },
        { status: 403 }
      );
    }

    const rawBody = await request.json();
    const parsed = toggleUserSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Datos inválidos", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, isActive } = parsed.data;

    if (userId === session.user.id && !isActive) {
      return NextResponse.json(
        { success: false, message: "No puedes desactivar tu propia cuenta" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return NextResponse.json({ success: true, message: "Usuario actualizado" });
  } catch (error) {
    console.error("Error actualizando usuario (admin):", error);
    return NextResponse.json(
      { success: false, message: "Error interno al actualizar usuario" },
      { status: 500 }
    );
  }
}
