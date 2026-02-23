import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/config';
import { auth } from '@/infrastructure/auth/auth';
import { serviceSchema, searchParamsSchema } from '@/shared/utils/validations';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import Fuse from 'fuse.js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    const validatedParams = searchParamsSchema.safeParse(params);
    if (!validatedParams.success) {
      return NextResponse.json(
        { success: false, errors: validatedParams.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      query,
      category,
      priceMin,
      priceMax,
      rating,
      location,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = validatedParams.data;

    const where: Record<string, unknown> = { isActive: true };

    if (category) where.category = { slug: category };

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) (where.price as { gte?: number }).gte = priceMin;
      if (priceMax !== undefined) (where.price as { lte?: number }).lte = priceMax;
    }

    if (rating) {
      where.professional = {
        ...(where.professional as Record<string, unknown>),
        rating: { gte: rating },
      };
    }

    if (location) {
      where.professional = {
        ...(where.professional as Record<string, unknown>),
        OR: [
          { city: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } },
          { address: { contains: location, mode: 'insensitive' } },
        ],
      };
    }

    let orderBy: Record<string, unknown> = {};
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'rating':
        orderBy = { professional: { rating: sortOrder } };
        break;
      case 'newest':
        orderBy = { createdAt: sortOrder };
        break;
      case 'popular':
        orderBy = { bookingCount: sortOrder };
        break;
      default:
        orderBy = { professional: { rating: 'desc' } };
    }

    const skip = (page - 1) * limit;
    let services: any[] = [];
    let total = 0;

    if (query) {
      const candidates = await prisma.service.findMany({
        where: { ...where, OR: undefined },
        include: {
          category: true,
          professional: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
          },
        },
        orderBy,
        take: Math.max(limit * 4, 80),
      });

      const fuse = new Fuse(candidates, {
        includeScore: true,
        shouldSort: true,
        threshold: 0.45,
        distance: 100,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'description', weight: 0.25 },
          { name: 'tags', weight: 0.1 },
          { name: 'category.name', weight: 0.1 },
          { name: 'professional.user.name', weight: 0.05 },
        ],
      });

      const results = fuse.search(query).filter((r) => (r.score ?? 1) <= 0.65);
      const ranked = results.length ? results : candidates.map((item) => ({ item, score: 1 }));

      total = ranked.length;
      services = ranked
        .sort((a, b) => {
          const scoreA = a.score ?? 1;
          const scoreB = b.score ?? 1;
          if (scoreA !== scoreB) return scoreA - scoreB;
          const ratingA = (a.item as any)?.professional?.rating ?? 0;
          const ratingB = (b.item as any)?.professional?.rating ?? 0;
          return ratingB - ratingA;
        })
        .slice(skip, skip + limit)
        .map((r) => r.item as (typeof candidates)[number]);
    } else {
      const [found, count] = await Promise.all([
        prisma.service.findMany({
          where,
          include: {
            category: true,
            professional: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.service.count({ where }),
      ]);
      services = found;
      total = count;
    }

    return NextResponse.json({
      success: true,
      data: {
        services,
        total,
        hasMore: skip + limit < total,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}

async function getAuthenticatedUserId(headers: Headers): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  try {
    const betterSession = await auth.api.getSession({ headers });
    if (betterSession?.user?.id) return betterSession.user.id;
  } catch (error) {
    console.error('Error obteniendo sesión better-auth:', error);
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request.headers);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = serviceSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true },
    });

    if (!user || user.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { success: false, message: 'Solo los profesionales pueden crear servicios' },
        { status: 403 }
      );
    }

    const professional =
      user.professional ||
      (await prisma.professional.create({
        data: {
          userId: user.id,
          specialties: [],
        },
      }));

    const service = await prisma.service.create({
      data: {
        ...validatedData.data,
        professionalId: professional.id,
      },
      include: {
        category: true,
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: service,
      message: 'Servicio creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating service:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
