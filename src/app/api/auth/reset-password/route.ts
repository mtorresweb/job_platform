import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/infrastructure/database/prisma";
import { resetPasswordWithTokenSchema } from "@/shared/utils/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordWithTokenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: { user: true },
    });

    if (!resetRecord || !resetRecord.user.isActive) {
      return NextResponse.json(
        { success: false, message: "Token inválido o expirado" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword, isEmailVerified: true },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetRecord.userId, id: { not: resetRecord.id } },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Contraseña actualizada" });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { success: false, message: "No pudimos restablecer la contraseña" },
      { status: 500 },
    );
  }
}
