import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import Fuse from 'fuse.js';

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

    // Fetch more rows when there's a query to allow fuzzy matching
    const take = query ? Math.max(limit * 4, 80) : limit;

    const [professionals] = await Promise.all([
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
    ]);

    let filtered = professionals;
    if (query) {
      const fuse = new Fuse(professionals, {
        includeScore: true,
        shouldSort: true,
        threshold: 0.45,
        distance: 100,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: 'user.name', weight: 0.5 },
          { name: 'bio', weight: 0.25 },
          { name: 'specialties', weight: 0.15 },
          { name: 'services.title', weight: 0.1 },
        ],
      });

      const results = fuse.search(query).filter((r) => (r.score ?? 1) <= 0.65);
      const ranked = results.length ? results : professionals.map((item) => ({ item, score: 1 }));
      filtered = ranked
        .sort((a, b) => {
          const scoreA = a.score ?? 1;
          const scoreB = b.score ?? 1;
          if (scoreA !== scoreB) return scoreA - scoreB;
          return ((b.item as any)?.rating ?? 0) - ((a.item as any)?.rating ?? 0);
        })
        .map((r) => r.item as (typeof professionals)[number]);
    }

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
