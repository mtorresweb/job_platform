import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { prisma } from "@/infrastructure/database/prisma";
import { updatePortfolioItemSchema } from "@/shared/utils/validations";
import { handlePrismaError } from "@/infrastructure/database/prisma";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/infrastructure/auth/config";

export const runtime = "nodejs";

async function getSessionUserId(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) return session.user.id;
  } catch (error) {
    console.warn("auth.api.getSession via headers failed", error);
  }

  try {
    const session = await auth.api.getSession({ cookies: request.cookies });
    if (session?.user?.id) return session.user.id;
  } catch (error) {
    console.warn("auth.api.getSession via cookies failed", error);
  }

  try {
    const nextSession = await getServerSession(authOptions);
    if (nextSession?.user?.id) return String(nextSession.user.id);
  } catch (error) {
    console.warn("next-auth getServerSession failed", error);
  }

  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (token?.sub) return String(token.sub);
  } catch (error) {
    console.warn("next-auth getToken failed", error);
  }

  return null;
}

async function ensureOwnership(userId: string, portfolioId: string) {
  const item = await prisma.professionalPortfolio.findUnique({
    where: { id: portfolioId },
    include: { professional: { select: { userId: true } } },
  });
  if (!item) return { ok: false, status: 404, message: "Elemento no encontrado" };
  if (item.professional.userId !== userId) return { ok: false, status: 403, message: "No autorizado" };
  return { ok: true, item };
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const ownership = await ensureOwnership(userId, id);
    if (!ownership.ok) {
      return NextResponse.json({ success: false, message: ownership.message }, { status: ownership.status });
    }

    const body = await request.json();
    const parsed = updatePortfolioItemSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;
    const updated = await prisma.professionalPortfolio.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        description: data.description ?? null,
        organization: data.organization ?? null,
        link: data.link ?? null,
        attachmentUrl: data.attachmentUrl ?? null,
        tags: data.tags ?? [],
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCurrent: data.isCurrent ?? false,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating portfolio", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json({ success: false, message: prismaError.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const ownership = await ensureOwnership(userId, id);
    if (!ownership.ok) {
      return NextResponse.json({ success: false, message: ownership.message }, { status: ownership.status });
    }

    await prisma.professionalPortfolio.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting portfolio", error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json({ success: false, message: prismaError.message }, { status: 500 });
  }
}
