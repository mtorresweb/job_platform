import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const isVerified = searchParams.get('isVerified') === 'true';
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');    const skip = (page - 1) * limit;

    // Build search conditions
    const serviceWhere: Record<string, unknown> = {
      isActive: true,
    };

    const professionalWhere: Record<string, unknown> = {};

    if (query) {
      serviceWhere.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ];
    }

    if (categoryId) {
      serviceWhere.categoryId = categoryId;
    }    if (minPrice !== undefined || maxPrice !== undefined) {
      serviceWhere.price = {};
      if (minPrice !== undefined) (serviceWhere.price as { gte?: number }).gte = minPrice;
      if (maxPrice !== undefined) (serviceWhere.price as { lte?: number }).lte = maxPrice;
    }

    if (minRating !== undefined) {
      professionalWhere.rating = { gte: minRating };
    }

    if (isVerified) {
      professionalWhere.isVerified = true;
    }

    if (city) {
      professionalWhere.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      professionalWhere.state = { contains: state, mode: 'insensitive' };
    }

    if (Object.keys(professionalWhere).length > 0) {
      serviceWhere.professional = professionalWhere;
    }    // Build orderBy
    let orderBy: Record<string, unknown> = {};
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'rating':
        orderBy = { professional: { rating: sortOrder } };
        break;
      case 'distance':
        // Would need coordinates for proper distance sorting
        orderBy = { createdAt: 'desc' };
        break;
      case 'popularity':
        orderBy = { bookingCount: sortOrder };
        break;
      case 'newest':
        orderBy = { createdAt: sortOrder };
        break;      default:
        // Relevance - combination of rating and booking count
        orderBy = [
          { professional: { rating: 'desc' } },
          { bookingCount: 'desc' },
        ] as unknown as Record<string, unknown>;
    }

    // Search services
    const [services, servicesTotal] = await Promise.all([
      prisma.service.findMany({
        where: serviceWhere,
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
      prisma.service.count({ where: serviceWhere }),
    ]);    // Search professionals (for query matches)
    let professionals: unknown[] = [];
    let professionalsTotal = 0;    if (query) {
      const professionalSearchWhere: Prisma.ProfessionalWhereInput = {
        ...professionalWhere,
        OR: [
          { bio: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { specialties: { has: query } },
          { user: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } },
        ],
      };

      [professionals, professionalsTotal] = await Promise.all([
        prisma.professional.findMany({
          where: professionalSearchWhere,
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
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
              },
            },
          },
          orderBy: { rating: 'desc' },
          take: Math.min(limit, 6), // Limit professionals in global search
        }),
        prisma.professional.count({ where: professionalSearchWhere }),
      ]);
    }

    // Get categories for faceted search
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            services: {
              where: serviceWhere,
            },
          },
        },
      },
    });

    // Calculate facets
    const facets = {
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.services,
      })),
      priceRanges: [
        { min: 0, max: 50000, count: 0 },
        { min: 50000, max: 100000, count: 0 },
        { min: 100000, max: 200000, count: 0 },
        { min: 200000, max: null, count: 0 },
      ],
      ratings: [
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
      ],
    };

    // Get search suggestions if query is short
    let suggestions: string[] = [];
    if (query && query.length >= 2 && query.length <= 3) {
      const suggestionServices = await prisma.service.findMany({
        where: {
          isActive: true,
          title: { contains: query, mode: 'insensitive' },
        },
        select: { title: true },
        take: 5,
      });

      suggestions = suggestionServices.map(s => s.title);
    }

    return NextResponse.json({
      success: true,
      data: {
        services,
        professionals,
        categories: categories.filter(cat => cat._count.services > 0),
        total: servicesTotal + professionalsTotal,
        facets,
        suggestions,
      },
    });
  } catch (error) {
    console.error('Error in global search:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
