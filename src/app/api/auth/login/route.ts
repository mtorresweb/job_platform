import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import bcrypt from "bcryptjs";
import { sendMail } from "@/shared/utils/email";

export const runtime = "nodejs";

function extractClientInfo(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    (request as any).ip ||
    "Desconocida";
  const userAgent = request.headers.get("user-agent") || "No especificado";
  const geo = (request as any).geo as
    | {
        city?: string;
        region?: string;
        country?: string;
      }
    | undefined;

  const locationParts = [geo?.city, geo?.region, geo?.country].filter(Boolean);
  const location = locationParts.length ? locationParts.join(", ") : "No disponible";

  return {
    ip,
    userAgent,
    location,
    timestamp: new Date().toLocaleString("es-ES", { timeZone: "UTC" }),
  };
}

function detectPlatform(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "iOS";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "macOS";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("linux")) return "Linux";
  return "Web";
}

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

    // Log platform usage
    const clientInfo = extractClientInfo(request);
    const platform = detectPlatform(clientInfo.userAgent || "");
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "login",
        resource: "auth",
        details: {
          platform,
          userAgent: clientInfo.userAgent,
          ip: clientInfo.ip,
          location: clientInfo.location,
          timestamp: clientInfo.timestamp,
        },
      },
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    try {
      await sendMail(
        email,
        "Nuevo inicio de sesión en ServiciosPro",
        `
          <h2>Hola ${safeUser.name || ""}, detectamos un nuevo inicio de sesión.</h2>
          <p><strong>Fecha/Hora (UTC):</strong> ${clientInfo.timestamp}</p>
          <p><strong>IP:</strong> ${clientInfo.ip}</p>
          <p><strong>Ubicación aproximada:</strong> ${clientInfo.location}</p>
          <p><strong>Dispositivo:</strong> ${clientInfo.userAgent}</p>
          <p>Revisa tu cuenta aquí:</p>
          <p>
            <a href="${baseUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
              Ir a ServiciosPro
            </a>
          </p>
          <p>Si no fuiste tú, te recomendamos cambiar tu contraseña de inmediato.</p>
        `,
      );
    } catch (err) {
      console.error("Error enviando correo de login", {
        error: err,
        email,
        baseUrl,
      });
    }

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
