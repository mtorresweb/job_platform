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
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const skip = (page - 1) * limit;

    // Build where clause (only filters, query will be applied in-memory for partial matches)
    const where: Record<string, unknown> = {};

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
      };
    }

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

    // Fetch more rows when there's a query to allow in-memory partial matching on specialties
    const take = query ? limit * 5 : limit;

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
            take: 5,
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
        skip: query ? 0 : skip,
        take,
      }),
      prisma.professional.count({ where }),
    ]);

    // In-memory filter for partial matches (specialties, services, bio)
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? professionals.filter((p) => {
          const specialtiesMatch = (p.specialties || []).some((s) => s.toLowerCase().includes(normalizedQuery));
          const servicesMatch = (p.services || []).some(
            (s) =>
              s.title.toLowerCase().includes(normalizedQuery) ||
              (s as any).description?.toLowerCase?.().includes(normalizedQuery)
          );
          const bioMatch = p.bio?.toLowerCase().includes(normalizedQuery);
          return specialtiesMatch || servicesMatch || bioMatch;
        })
      : professionals;

    // Apply pagination after filtering
    const start = skip;
    const end = skip + limit;
    const paginated = filtered.slice(start, end);
    const totalFiltered = filtered.length;

    return NextResponse.json({
      success: true,
      data: {
        professionals: paginated,
        total: totalFiltered,
        hasMore: end < totalFiltered,
        pagination: {
          page,
          limit,
          total: totalFiltered,
          totalPages: Math.ceil(totalFiltered / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error searching professionals:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
