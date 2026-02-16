import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { sendMail } from "@/shared/utils/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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

    // Send welcome email (non-blocking failure)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const welcomeLink = `${baseUrl}`;
    const logoUrl = `${baseUrl}/favicon.svg`;

    const roleCopy = {
      PROFESSIONAL: {
        subject: "¡Bienvenido a Red Profesional!",
        intro: "Ya puedes publicar servicios y mostrar tu experiencia a nuevos clientes.",
        tips: [
          "Completa tu perfil con foto y especialidades.",
          "Publica al menos un servicio con precio y descripción clara.",
          "Sube certificaciones o trabajos destacados en tu portafolio.",
        ],
        cta: "Ir a mi cuenta",
      },
      CLIENT: {
        subject: "Bienvenido, encuentra profesionales de confianza",
        intro: "Explora categorías, compara perfiles y agenda servicios en minutos.",
        tips: [
          "Completa tu información de contacto para agilizar reservas.",
          "Usa los filtros por ciudad, categoría y rating.",
          "Habla con el profesional por mensajes antes de reservar si necesitas detalles.",
        ],
        cta: "Explorar profesionales",
      },
      ADMIN: {
        subject: "Acceso administrativo habilitado",
        intro: "Tu cuenta tiene permisos de administración para monitorear la plataforma.",
        tips: [
          "Revisa usuarios y reportes en el panel de administración.",
          "Monitorea métricas clave y estado de servicios.",
          "Configura notificaciones para eventos críticos.",
        ],
        cta: "Ir al panel",
      },
    } as const;

    const copy = roleCopy[role as keyof typeof roleCopy] ?? roleCopy.CLIENT;
    try {
      await sendMail(
        email,
        copy.subject,
        `
          <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background:#f4f6fb; padding:24px; color:#0b1220;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(36,93,222,0.08);">
              <tr>
                <td style="padding:24px 24px 12px 24px; text-align:center; background:linear-gradient(135deg, #245dde, #7ea0ff); color:#f9fbff;">
                  <img src="${logoUrl}" alt="Red Profesional" width="64" height="64" style="display:block; margin:0 auto 12px auto;" />
                  <div style="font-size:20px; font-weight:800; letter-spacing:0.3px;">Red Profesional</div>
                  <div style="font-size:13px; opacity:0.9; margin-top:4px;">Conecta, contrata y crece con confianza</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 28px 12px 28px;">
                  <h2 style="margin:0 0 12px 0; font-size:22px; color:#0b1220;">Hola ${name}, ¡bienvenido/a!</h2>
                  <p style="margin:0 0 12px 0; line-height:1.6; color:#323c4c;">${copy.intro}</p>
                  <p style="margin:0 0 12px 0; line-height:1.6; color:#323c4c;">Te recomendamos:</p>
                  <ul style="margin:0 0 16px 18px; padding:0; color:#323c4c; line-height:1.6;">
                    ${copy.tips.map((tip) => `<li>${tip}</li>`).join("")}
                  </ul>
                  <div style="text-align:center; margin:20px 0 24px 0;">
                    <a href="${welcomeLink}" style="display:inline-block; padding:12px 20px; background:#245dde; color:#f9fbff; text-decoration:none; border-radius:10px; font-weight:700; box-shadow:0 8px 20px rgba(36,93,222,0.2);">
                      ${copy.cta}
                    </a>
                  </div>
                  <p style="margin:0; line-height:1.6; color:#5b6472; font-size:13px;">
                    Si no creaste esta cuenta, ignora este mensaje.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 28px 24px 28px; background:#f8f9fe; color:#5b6472; font-size:12px; text-align:center;">
                  Red Profesional · Plataforma de servicios · Aguachica, Cesar
                </td>
              </tr>
            </table>
          </div>
        `,
      );
    } catch (err) {
      console.error("Error enviando correo de bienvenida", err);
    }

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
