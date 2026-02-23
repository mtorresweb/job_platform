import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import { Prisma } from '@prisma/client';
import Fuse from 'fuse.js';

// Simple normalized Damerau-Levenshtein distance for fuzzy scoring
function damerauLevenshtein(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const dist: number[][] = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0));
  for (let i = 0; i <= lenA; i++) dist[i][0] = i;
  for (let j = 0; j <= lenB; j++) dist[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dist[i][j] = Math.min(
        dist[i - 1][j] + 1, // deletion
        dist[i][j - 1] + 1, // insertion
        dist[i - 1][j - 1] + cost // substitution
      );

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dist[i][j] = Math.min(dist[i][j], dist[i - 2][j - 2] + cost); // transposition
      }
    }
  }

  return dist[lenA][lenB];
}

function normalizedSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const na = a.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const nb = b.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const distance = damerauLevenshtein(na, nb);
  const longest = Math.max(na.length, nb.length);
  return longest === 0 ? 0 : 1 - distance / longest;
}

function bestTextSimilarity(query: string, texts: Array<string | null | undefined>): number {
  const cleanQuery = query.trim();
  if (!cleanQuery) return 0;
  return texts
    .filter(Boolean)
    .map((text) => normalizedSimilarity(cleanQuery, String(text)))
    .reduce((max, curr) => (curr > max ? curr : max), 0);
}

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
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build search conditions
    const serviceWhere: Record<string, unknown> = {
      isActive: true,
    };

    const professionalWhere: Record<string, unknown> = {};

    const searchTokens = query
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (query) {
      serviceWhere.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
        // Token-based partial matches to widen candidate pool for fuzzy scoring
        ...searchTokens.map((token) => ({ title: { contains: token, mode: 'insensitive' } })),
        ...searchTokens.map((token) => ({ description: { contains: token, mode: 'insensitive' } })),
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

    let servicesTotal = 0;
    let services: any[] = [];

    if (query) {
      // Broader candidate pool ignoring text filters to allow typos
      const serviceCandidates = await prisma.service.findMany({
        where: { ...serviceWhere, OR: undefined }, // drop text contains for fuzzy
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
        take: Math.max(limit * 8, 160), // fetch extra for fuzzy re-rank
      });

      const fuseServices = new Fuse(serviceCandidates, {
        includeScore: true,
        shouldSort: true,
        threshold: 0.6, // more permisivo para typos
        ignoreLocation: true,
        distance: 200,
        minMatchCharLength: 2,
        keys: [
          { name: 'title', weight: 0.45 },
          { name: 'description', weight: 0.25 },
          { name: 'tags', weight: 0.1 },
          { name: 'category.name', weight: 0.1 },
          { name: 'professional.user.name', weight: 0.1 },
        ],
      });

      const fuseResults = fuseServices.search(query);
      const ranked = fuseResults.length
        ? fuseResults
        : serviceCandidates.map((item) => ({ item, score: 1 }));

      servicesTotal = ranked.length;
      services = ranked
        .sort((a, b) => {
          const scoreA = a.score ?? 1;
          const scoreB = b.score ?? 1;
          if (scoreA !== scoreB) return scoreA - scoreB; // Fuse: menor score = mejor match
          const ratingA = (a.item as any)?.professional?.rating ?? 0;
          const ratingB = (b.item as any)?.professional?.rating ?? 0;
          return ratingB - ratingA;
        })
        .slice(skip, skip + limit)
        .map((r) => r.item as typeof serviceCandidates[number]);
    } else {
      // Standard path without fuzzy rerank
      [services, servicesTotal] = await Promise.all([
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
      ]);
    }

    // Search professionals (broader pool + fuzzy)
    let professionals: unknown[] = [];
    let professionalsTotal = 0;

    if (query) {
      const professionalSearchWhere: Prisma.ProfessionalWhereInput = {
        ...professionalWhere,
        OR: [
          { bio: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { specialties: { has: query } },
          { user: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } },
          ...searchTokens.map((token) => ({ bio: { contains: token, mode: Prisma.QueryMode.insensitive } })),
          ...searchTokens.map((token) => ({ user: { name: { contains: token, mode: Prisma.QueryMode.insensitive } } })),
        ],
      };

      const professionalCandidates = await prisma.professional.findMany({
        where: { ...professionalSearchWhere, OR: undefined },
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
        take: Math.max(limit * 8, 120),
      });

      const fuseProfessionals = new Fuse(professionalCandidates, {
        includeScore: true,
        shouldSort: true,
        threshold: 0.6,
        ignoreLocation: true,
        distance: 200,
        minMatchCharLength: 2,
        keys: [
          { name: 'user.name', weight: 0.5 },
          { name: 'bio', weight: 0.25 },
          { name: 'specialties', weight: 0.25 },
        ],
      });

      const proResults = fuseProfessionals.search(query);
      const rankedPros = proResults.length
        ? proResults
        : professionalCandidates.map((item) => ({ item, score: 1 }));

      professionalsTotal = rankedPros.length;
      professionals = rankedPros
        .sort((a, b) => {
          const scoreA = a.score ?? 1;
          const scoreB = b.score ?? 1;
          if (scoreA !== scoreB) return scoreA - scoreB;
          return ((b.item as any)?.rating ?? 0) - ((a.item as any)?.rating ?? 0);
        })
        .slice(0, Math.min(limit, 12))
        .map((r) => r.item as typeof professionalCandidates[number]);
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

    // Get fuzzy suggestions (top scored service titles)
    let suggestions: string[] = [];
    if (query && query.length >= 2) {
      const suggestionCandidates = await prisma.service.findMany({
        where: { isActive: true },
        select: { title: true },
        take: 300,
      });

      const fuseSuggestions = new Fuse(
        suggestionCandidates.map((s) => s.title),
        {
          includeScore: true,
          threshold: 0.48,
          ignoreLocation: true,
          minMatchCharLength: 2,
        }
      );

      suggestions = fuseSuggestions
        .search(query)
        .slice(0, 10)
        .map((r) => r.item);
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
