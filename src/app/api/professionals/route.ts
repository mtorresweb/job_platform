import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { handlePrismaError } from '@/infrastructure/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const isVerified = searchParams.get('isVerified') === 'true';
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (query) {
      where.OR = [
        { specialties: { has: query } },
        {
          services: {
            some: {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
              isActive: true,
            },
          },
        },
      ];
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    if (isVerified) {
      where.isVerified = true;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    if (category) {
      where.services = {
        some: {
          category: {
            slug: category,
          },
          isActive: true,
        },
      };    }

    // Build orderBy
    let orderBy: Record<string, unknown> = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { rating: sortOrder };
        break;
      case 'experience':
        orderBy = { experience: sortOrder };
        break;
      case 'reviews':
        orderBy = { reviewCount: sortOrder };
        break;
      case 'newest':
        orderBy = { createdAt: sortOrder };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          services: {
            where: { isActive: true },
            take: 3,
            include: {
              category: true,
            },
          },
          _count: {
            select: {
              services: {
                where: { isActive: true },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.professional.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        professionals,
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
    console.error('Error fetching professionals:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
