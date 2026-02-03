import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { auth } from '@/infrastructure/auth/auth';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '6m';
    const userId = session.user.id;

    // Determine if user is a professional
    const professionalProfile = await prisma.professional.findUnique({
      where: { userId },
    });

    const isProfessional = !!professionalProfile;

    // Calculate date range
    const months = parseInt(timeRange.replace('m', '')) || 6;
    const endDate = new Date();
    const startDate = subMonths(endDate, months);

    if (isProfessional) {
      // Analytics for professionals
      const [
        totalBookings,
        totalRevenue,
        monthlyData,
        servicePerformance,
        averageRating,
        clientStats,
        lastMonthData
      ] = await Promise.all([
        // Total bookings
        prisma.booking.count({
          where: { professionalId: userId }
        }),
        
        // Total revenue from completed bookings
        prisma.booking.aggregate({
          where: { 
            professionalId: userId,
            status: 'COMPLETED'
          },
          _sum: { totalPrice: true }
        }),
        
        // Monthly earnings and bookings data
        generateMonthlyData(userId, startDate, endDate, 'professional'),
        
        // Service performance
        getServicePerformance(userId),
        
        // Average rating
        prisma.review.aggregate({
          where: { professionalId: userId },
          _avg: { rating: true }
        }),
        
        // Client statistics
        getClientStats(userId),

        // Last month data for growth calculation
        getLastMonthData(userId, 'professional')
      ]);

      const currentTotalEarnings = totalRevenue._sum.totalPrice || 0;
      const currentAvgRating = Math.round((averageRating._avg.rating || 0) * 10) / 10;
      
      // Calculate growth rates
      const earningsGrowth = calculateGrowthRate(currentTotalEarnings, lastMonthData.earnings || 0);
      const bookingsGrowth = calculateGrowthRate(totalBookings, lastMonthData.bookings || 0);
      const clientsGrowth = calculateGrowthRate(clientStats.totalClients, lastMonthData.clients || 0);
      const ratingGrowth = calculateGrowthRate(currentAvgRating, lastMonthData.rating || 0);

      return NextResponse.json({
        success: true,
        data: {
          totalEarnings: currentTotalEarnings,
          earningsGrowth,
          totalBookings,
          bookingsGrowth,
          uniqueClients: clientStats.totalClients,
          clientsGrowth,
          avgRating: currentAvgRating,
          ratingGrowth,
          monthlyData,
          servicePerformance,
          clientStats,
          isProfessional: true
        }
      });
    } else {
      // Analytics for clients
      const [
        totalBookings,
        totalSpent,
        monthlyData,
        favoriteServices,
        lastMonthData
      ] = await Promise.all([
        // Total bookings as client
        prisma.booking.count({
          where: { clientId: userId }
        }),
        
        // Total spent on completed bookings
        prisma.booking.aggregate({
          where: { 
            clientId: userId,
            status: 'COMPLETED'
          },
          _sum: { totalPrice: true }
        }),
        
        // Monthly spending data
        generateMonthlyData(userId, startDate, endDate, 'client'),
        
        // Favorite services
        getFavoriteServices(userId),
        
        // Last month data for growth calculation
        getLastMonthData(userId, 'client')
      ]);

      const totalSpentAmount = totalSpent._sum.totalPrice || 0;
      
      // Calculate growth rates
      const bookingsGrowth = calculateGrowthRate(totalBookings, lastMonthData.bookings || 0);
      const spentGrowth = calculateGrowthRate(totalSpentAmount, lastMonthData.spent || 0);
      const favoritesGrowth = calculateGrowthRate(favoriteServices.length, lastMonthData.favorites || 0);

      return NextResponse.json({
        success: true,
        data: {
          totalBookings,
          bookingsGrowth,
          totalSpent: totalSpentAmount,
          spentGrowth,
          favoriteProfessionals: favoriteServices.length,
          favoritesGrowth,
          monthlyData,
          favoriteServices,
          isProfessional: false
        }
      });
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}

// Helper function to generate monthly data
async function generateMonthlyData(
  userId: string, 
  startDate: Date, 
  endDate: Date, 
  userType: 'professional' | 'client'
) {
  const months = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);
    
    const whereClause = userType === 'professional' 
      ? { professionalId: userId }
      : { clientId: userId };
    
    const [bookingsCount, revenue] = await Promise.all([
      prisma.booking.count({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }),
      
      prisma.booking.aggregate({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { totalPrice: true }
      })
    ]);
    
    months.push({
      month: format(current, 'MMM'),
      earnings: revenue._sum.totalPrice || 0,
      bookings: bookingsCount,
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

// Helper function to get service performance for professionals
async function getServicePerformance(professionalId: string) {
  const services = await prisma.service.findMany({
    where: { 
      professionalId,
      isActive: true 
    },
    include: {
      bookings: {
        where: { status: 'COMPLETED' },
        include: {
          review: true
        }
      },
      category: true
    }
  });

  return services.map(service => {
    const completedBookings = service.bookings.length;
    const totalRevenue = service.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const reviews = service.bookings.filter(b => b.review).map(b => b.review!);
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      name: service.title,
      bookings: completedBookings,
      revenue: totalRevenue,
      avgRating: Math.round(avgRating * 10) / 10,
      category: service.category.name
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

// Helper function to get client statistics for professionals
async function getClientStats(professionalId: string) {
  const bookings = await prisma.booking.findMany({
    where: { 
      professionalId,
      status: 'COMPLETED'
    },
    include: {
      client: true
    }
  });

  // Count unique clients
  const uniqueClients = new Set(bookings.map(b => b.clientId));
  
  // Calculate repeat clients
  const clientBookingCounts = bookings.reduce((acc, booking) => {
    acc[booking.clientId] = (acc[booking.clientId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const repeatClients = Object.values(clientBookingCounts).filter(count => count > 1).length;
  
  return {
    totalClients: uniqueClients.size,
    repeatClients,
    repeatRate: uniqueClients.size > 0 ? Math.round((repeatClients / uniqueClients.size) * 100) : 0
  };
}

// Helper function to get favorite services for clients
async function getFavoriteServices(clientId: string) {
  const bookings = await prisma.booking.findMany({
    where: { 
      clientId,
      status: 'COMPLETED'
    },
    include: {
      service: {
        include: {
          category: true
        }
      }
    }
  });

  // Group by service category
  const categoryUsage = bookings.reduce((acc, booking) => {
    const categoryName = booking.service.category.name;
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryUsage)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Helper function to get last month data for growth calculation
async function getLastMonthData(userId: string, userType: 'professional' | 'client') {
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  
  const whereClause = userType === 'professional' 
    ? { professionalId: userId }
    : { clientId: userId };

  if (userType === 'professional') {
    const [bookings, revenue, rating, clientsCount] = await Promise.all([
      prisma.booking.count({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      }),
      
      prisma.booking.aggregate({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        _sum: { totalPrice: true }
      }),

      prisma.review.aggregate({
        where: { 
          professionalId: userId,
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        _avg: { rating: true }
      }),

      // Count unique clients last month
      prisma.booking.findMany({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        select: { clientId: true }
      }).then(bookings => new Set(bookings.map(b => b.clientId)).size)
    ]);

    return {
      bookings,
      earnings: revenue._sum.totalPrice || 0,
      rating: Math.round((rating._avg.rating || 0) * 10) / 10,
      clients: clientsCount
    };
  } else {
    const [bookings, spent, favorites] = await Promise.all([
      prisma.booking.count({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      }),
      
      prisma.booking.aggregate({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        _sum: { totalPrice: true }
      }),

      // Count favorite services last month (simplified)
      prisma.booking.findMany({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        include: {
          service: {
            include: { category: true }
          }
        }
      }).then(bookings => {
        const categories = new Set(bookings.map(b => b.service.category.name));
        return categories.size;
      })
    ]);

    return {
      bookings,
      spent: spent._sum.totalPrice || 0,
      favorites
    };
  }
}

// Helper function to calculate growth rate
function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}
