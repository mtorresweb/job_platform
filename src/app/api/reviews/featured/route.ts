import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { handlePrismaError } from '@/infrastructure/database/prisma';

// GET /api/reviews/featured - Get featured testimonials for marketing pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const minRating = parseFloat(searchParams.get('minRating') || '4.5');

    // Get high-rated reviews with diversity
    const featuredReviews = await prisma.review.findMany({
      where: {
        rating: { gte: minRating },
        comment: { not: null },
        isVerified: true,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },        booking: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            professional: {
              select: {
                id: true,
                name: true,
                professional: {
                  select: {
                    city: true,
                    state: true,
                  }
                }
              }
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit * 2, // Get more than needed for diversity
    });

    // Add diversity by selecting reviews from different categories and locations
    const diverseReviews = [];
    const usedCategories = new Set();
    const usedLocations = new Set();    for (const review of featuredReviews) {
      const category = review.booking.service.category.name;
      const location = review.booking.professional.professional?.city || 'Unknown';
      
      if (diverseReviews.length >= limit) break;
      
      // Prioritize different categories and locations
      if (!usedCategories.has(category) || !usedLocations.has(location) || diverseReviews.length < limit / 2) {
        diverseReviews.push(review);
        usedCategories.add(category);
        usedLocations.add(location);
      }
    }

    // Fill remaining slots if needed
    if (diverseReviews.length < limit) {
      for (const review of featuredReviews) {
        if (diverseReviews.length >= limit) break;
        if (!diverseReviews.find(r => r.id === review.id)) {
          diverseReviews.push(review);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews: diverseReviews.slice(0, limit),
        total: diverseReviews.length,
        hasMore: false,
      },
    });
  } catch (error) {
    console.error('Error fetching featured reviews:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
