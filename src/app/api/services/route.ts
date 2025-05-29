import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { serviceSchema, searchParamsSchema } from '@/shared/utils/validations';
import { handlePrismaError } from '@/infrastructure/database/prisma';

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
    }    const {
      query,
      category,
      priceMin,
      priceMax,
      rating,
      location,
      // availability, // Not used in current implementation
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = validatedParams.data;    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) (where.price as { gte?: number }).gte = priceMin;
      if (priceMax !== undefined) (where.price as { lte?: number }).lte = priceMax;
    }

    if (rating) {
      where.professional = {
        rating: { gte: rating },
      };
    }    if (location) {
      where.professional = {
        ...(where.professional as Record<string, unknown>),
        OR: [
          { city: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } },
          { address: { contains: location, mode: 'insensitive' } },
        ],
      };
    }// Build orderBy clause
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

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

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

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
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

    // Verify user is a professional
    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id },
    });

    if (!professional) {
      return NextResponse.json(
        { success: false, message: 'Solo los profesionales pueden crear servicios' },
        { status: 403 }
      );
    }

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
