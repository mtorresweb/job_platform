import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 },
      );
    }

    // Validate role is valid
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este correo electrónico" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating user with data:", { email, name, role });

    // Create user with account in a single operation
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        profileCompleted: false,
        isActive: true,
        isEmailVerified: false,
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
      },
    });

    // Create account separately to handle the casing issue
    await prisma.$executeRawUnsafe(
      `INSERT INTO accounts ("id", "userId", "type", "provider", "providerAccountId")
       VALUES ($1, $2, $3, $4, $5)`,
      randomUUID(),
      user.id,
      "credentials",
      "credentials",
      email,
    );

    return NextResponse.json({
      user,
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 },
    );
  }
}
