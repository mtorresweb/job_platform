import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { handlePrismaError } from '@/infrastructure/database/prisma';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '6m';

    // Calculate date range
    const months = parseInt(timeRange.replace('m', '')) || 6;
    const endDate = new Date();
    const startDate = subMonths(endDate, months);

    const [
      totalProfessionals,
      totalClients,
      totalServices,
      completedBookings,
      platformRevenue,
      averageRating,
      averageResponseTime,
      monthlyGrowth
    ] = await Promise.all([
      // Total professionals
      prisma.professional.count(),
      
      // Total clients (users who are not professionals)
      prisma.user.count({
        where: {
          professional: null
        }
      }),
      
      // Total active services
      prisma.service.count({
        where: { isActive: true }
      }),
      
      // Total completed bookings
      prisma.booking.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Platform revenue (0 for free platform)
      Promise.resolve(0),
      
      // Average rating across all reviews
      prisma.review.aggregate({
        _avg: { rating: true }
      }),
      
      // Average response time (mock for now - would need to track message response times)
      Promise.resolve(2.3),
      
      // Monthly growth data
      generatePlatformMonthlyData(startDate, endDate)
    ]);

    // Calculate growth percentages (comparing last 2 months)
    const lastMonth = subMonths(endDate, 1);
    const twoMonthsAgo = subMonths(endDate, 2);

    const [
      professionalGrowth,
      clientGrowth,
      bookingGrowth
    ] = await Promise.all([
      calculateGrowthRate('professional', lastMonth, twoMonthsAgo),
      calculateGrowthRate('client', lastMonth, twoMonthsAgo),
      calculateGrowthRate('booking', lastMonth, twoMonthsAgo)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        metrics: [
          { 
            metric: "Total Profesionales", 
            value: totalProfessionals.toLocaleString(), 
            change: `+${professionalGrowth}%`, 
            trend: professionalGrowth > 0 ? "up" : professionalGrowth < 0 ? "down" : "neutral" 
          },
          { 
            metric: "Total Clientes", 
            value: totalClients.toLocaleString(), 
            change: `+${clientGrowth}%`, 
            trend: clientGrowth > 0 ? "up" : clientGrowth < 0 ? "down" : "neutral" 
          },
          { 
            metric: "Servicios Completados", 
            value: completedBookings.toLocaleString(), 
            change: `+${bookingGrowth}%`, 
            trend: bookingGrowth > 0 ? "up" : bookingGrowth < 0 ? "down" : "neutral" 
          },
          { 
            metric: "Ingresos Plataforma", 
            value: "$0", 
            change: "0%", 
            trend: "neutral" 
          },
          { 
            metric: "Calificación Promedio", 
            value: (averageRating._avg.rating || 0).toFixed(1), 
            change: "+0.1", 
            trend: "up" 
          },
          { 
            metric: "Tiempo Respuesta", 
            value: `${averageResponseTime}h`, 
            change: "-15%", 
            trend: "up" 
          },
        ],
        monthlyGrowth,
        overview: {
          totalProfessionals,
          totalClients,
          totalServices,
          completedBookings,
          platformRevenue,
          averageRating: Math.round((averageRating._avg.rating || 0) * 10) / 10,
          averageResponseTime
        }
      }
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}

// Helper function to generate platform monthly growth data
async function generatePlatformMonthlyData(startDate: Date, endDate: Date) {
  const months = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthStart = startOfMonth(current);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    const [newProfessionals, newClients, newBookings] = await Promise.all([
      prisma.professional.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      }),
      
      prisma.user.count({
        where: {
          professional: null,
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      }),
      
      prisma.booking.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      })
    ]);
    
    months.push({
      month: format(current, 'MMM'),
      professionals: newProfessionals,
      clients: newClients,
      bookings: newBookings,
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

// Helper function to calculate growth rate
async function calculateGrowthRate(
  type: 'professional' | 'client' | 'booking', 
  currentMonthStart: Date, 
  previousMonthStart: Date
): Promise<number> {
  const currentMonthEnd = new Date(currentMonthStart);
  currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
  
  const previousMonthEnd = new Date(previousMonthStart);
  previousMonthEnd.setMonth(previousMonthEnd.getMonth() + 1);

  let currentCount = 0;
  let previousCount = 0;

  switch (type) {
    case 'professional':
      [currentCount, previousCount] = await Promise.all([
        prisma.professional.count({
          where: {
            createdAt: {
              gte: currentMonthStart,
              lt: currentMonthEnd
            }
          }
        }),
        prisma.professional.count({
          where: {
            createdAt: {
              gte: previousMonthStart,
              lt: previousMonthEnd
            }
          }
        })
      ]);
      break;
      
    case 'client':
      [currentCount, previousCount] = await Promise.all([
        prisma.user.count({
          where: {
            professional: null,
            createdAt: {
              gte: currentMonthStart,
              lt: currentMonthEnd
            }
          }
        }),
        prisma.user.count({
          where: {
            professional: null,
            createdAt: {
              gte: previousMonthStart,
              lt: previousMonthEnd
            }
          }
        })
      ]);
      break;
      
    case 'booking':
      [currentCount, previousCount] = await Promise.all([
        prisma.booking.count({
          where: {
            createdAt: {
              gte: currentMonthStart,
              lt: currentMonthEnd
            }
          }
        }),
        prisma.booking.count({
          where: {
            createdAt: {
              gte: previousMonthStart,
              lt: previousMonthEnd
            }
          }
        })
      ]);
      break;
  }

  if (previousCount === 0) return currentCount > 0 ? 100 : 0;
  return Math.round(((currentCount - previousCount) / previousCount) * 100);
}
