import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { handlePrismaError } from '@/infrastructure/database/prisma';

// GET /api/reviews/platform-stats - Get platform statistics for testimonials page
export async function GET() {
  try {
    // Get review statistics
    const [
      totalReviews,
      averageRatingResult,
      verifiedReviews,
      totalUsers,
      totalProfessionals,
      totalBookings,
      completedBookings
    ] = await Promise.all([
      prisma.review.count(),
      prisma.review.aggregate({
        _avg: { rating: true },
      }),
      prisma.review.count({
        where: { isVerified: true },
      }),
      prisma.user.count(),
      prisma.professional.count(),
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: 'COMPLETED' },
      }),
    ]);

    // Calculate platform metrics
    const averageRating = averageRatingResult._avg.rating || 0;
    const activeUsers = totalUsers;
    const satisfactionRate = totalReviews > 0 ? Math.round((verifiedReviews / totalReviews) * 100) : 98;
    
    // Estimate savings (assuming 15% commission saved per completed booking)
    const avgBookingValue = 100000; // Average booking value in COP
    const commissionRate = 0.15; // 15% commission
    const totalSavings = Math.round(completedBookings * avgBookingValue * commissionRate);    return NextResponse.json({
      success: true,
      data: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        verifiedReviews,
        totalSavings,
        activeUsers,
        satisfactionRate,
        completedBookings,
        totalProfessionals,
        totalBookings,
      },
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
