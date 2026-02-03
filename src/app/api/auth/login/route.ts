import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "El correo y la contraseña son requeridos" },
        { status: 400 },
      );
    }

    console.log("Attempting login for:", { email });
    console.log(
      "Password received:",
      typeof password === "string" ? "string" : typeof password,
    );

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        profileCompleted: true,
      },
    });

    if (!user) {
      console.log("User not found:", { email });
      return NextResponse.json(
        { error: "No existe un usuario con este correo electrónico" },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      console.log("Inactive user:", { email });
      return NextResponse.json(
        { error: "Esta cuenta ha sido desactivada" },
        { status: 401 },
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("Invalid password for user:", { email });
      return NextResponse.json(
        { error: "La contraseña es incorrecta" },
        { status: 401 },
      );
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Remove sensitive data before sending response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user;

    // Generate session token
    const session = {
      accessToken: Buffer.from(`${safeUser.id}-${Date.now()}`).toString(
        "base64",
      ),
      user: safeUser,
    };

    // Return success response with session data
    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un error durante el inicio de sesión" },
      { status: 500 },
    );
  }
}
