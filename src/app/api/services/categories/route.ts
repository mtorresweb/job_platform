import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { handlePrismaError } from '@/infrastructure/database/prisma';

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            services: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { success: false, message: prismaError.message },
      { status: 500 }
    );
  }
}
