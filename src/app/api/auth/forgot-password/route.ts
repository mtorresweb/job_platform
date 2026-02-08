import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes, createHash } from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { prisma } from "@/infrastructure/database/prisma";
import { forgotPasswordSchema } from "@/shared/utils/validations";

const RESET_TOKEN_EXPIRY_MINUTES = 60;

async function sendResetEmail(email: string, resetLink: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP no configurado");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: "Recupera tu contraseña",
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Si fuiste tú, haz clic en el siguiente enlace:</p>
      <p><a href="${resetLink}">Restablecer contraseña</a></p>
      <p>Este enlace expira en ${RESET_TOKEN_EXPIRY_MINUTES} minutos.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: true, message: "Si el correo existe, enviamos instrucciones" },
      );
    }

    // Clean previous tokens
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.origin}`;
    const resetLink = `${baseUrl}/auth/reset-password?token=${rawToken}`;

    await sendResetEmail(email, resetLink);

    return NextResponse.json({
      success: true,
      message: "Si el correo existe, enviamos instrucciones",
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { success: false, message: "No pudimos procesar la solicitud" },
      { status: 500 },
    );
  }
}
