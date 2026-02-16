import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { prisma } from "@/infrastructure/database/prisma";
import { portfolioItemSchema } from "@/shared/utils/validations";
import { handlePrismaError } from "@/infrastructure/database/prisma";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/infrastructure/auth/config";

export const runtime = "nodejs";

async function getSessionUserId(request: NextRequest) {
  // Try via headers first (browser requests with cookies)
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) return session.user.id;
  } catch (error) {
    console.warn("auth.api.getSession via headers failed", error);
  }

  // Fallback: try using cookies explicitly (works in some edge cases)
  try {
    const session = await auth.api.getSession({ cookies: request.cookies });
    if (session?.user?.id) return session.user.id;
  } catch (error) {
    console.warn("auth.api.getSession via cookies failed", error);
  }

  // NextAuth session fallback
  try {
    const nextSession = await getServerSession(authOptions);
    if (nextSession?.user?.id) return String(nextSession.user.id);
  } catch (error) {
    console.warn("next-auth getServerSession failed", error);
  }

  // NextAuth JWT fallback
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (token?.sub) return String(token.sub);
  } catch (error) {
    console.warn("next-auth getToken failed", error);
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const professional = await prisma.professional.findUnique({ where: { userId } });
    if (!professional) {
      return NextResponse.json({ success: true, items: [] });
    }

    const items = await prisma.professionalPortfolio.findMany({
      where: { professionalId: professional.id },
      orderBy: [
        { isCurrent: "desc" },
        { startDate: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Error fetching portfolio", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json({ success: false, message: prismaError.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const professional = await prisma.professional.findUnique({ where: { userId } });
    if (!professional) {
      return NextResponse.json({ success: false, message: "Debes completar tu perfil profesional primero" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = portfolioItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;

    const created = await prisma.professionalPortfolio.create({
      data: {
        professionalId: professional.id,
        title: data.title,
        type: data.type,
        description: data.description || null,
        organization: data.organization || null,
        link: data.link || null,
        attachmentUrl: data.attachmentUrl || null,
        tags: data.tags || [],
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCurrent: Boolean(data.isCurrent),
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Error creating portfolio", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json({ success: false, message: prismaError.message }, { status: 500 });
  }
}
