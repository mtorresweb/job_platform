import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { UserRole, BookingStatus, MessageType, NotificationType } from '@/shared/types';

export async function POST() {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Seeding is not allowed in production' },
        { status: 403 }
      );
    }

    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.service.deleteMany();
    await prisma.professional.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.serviceCategory.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️ Cleared existing data');

    // Create service categories
    const categories = await Promise.all([
      prisma.serviceCategory.create({
        data: {
          name: 'Web Development',
          description: 'Website and web application development services',
          icon: '💻',
          slug: 'web-development',
        },
      }),
      prisma.serviceCategory.create({
        data: {
          name: 'Graphic Design',
          description: 'Visual design and branding services',
          icon: '🎨',
          slug: 'graphic-design',
        },
      }),
      prisma.serviceCategory.create({
        data: {
          name: 'Digital Marketing',
          description: 'Online marketing and advertising services',
          icon: '📱',
          slug: 'digital-marketing',
        },
      }),
      prisma.serviceCategory.create({
        data: {
          name: 'Writing & Translation',
          description: 'Content writing and translation services',
          icon: '✍️',
          slug: 'writing-translation',
        },
      }),
      prisma.serviceCategory.create({
        data: {
          name: 'Video & Animation',
          description: 'Video production and animation services',
          icon: '🎬',
          slug: 'video-animation',
        },
      }),
    ]);

    console.log('📂 Created service categories');

    // Create users (clients and professionals)
    const users = await Promise.all([
      // Clients
      prisma.user.create({
        data: {
          email: 'john.client@example.com',
          name: 'John Smith',
          password: 'hashedpassword123', // In real app, this would be properly hashed
          role: UserRole.CLIENT,
          isEmailVerified: true,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
      }),
      prisma.user.create({
        data: {
          email: 'sarah.client@example.com',
          name: 'Sarah Johnson',
          password: 'hashedpassword123',
          role: UserRole.CLIENT,
          isEmailVerified: true,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b056d92e?w=150&h=150&fit=crop&crop=face',
        },
      }),
      // Professionals
      prisma.user.create({
        data: {
          email: 'alex.dev@example.com',
          name: 'Alex Rodriguez',
          password: 'hashedpassword123',
          role: UserRole.PROFESSIONAL,
          isEmailVerified: true,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        },
      }),
      prisma.user.create({
        data: {
          email: 'maria.designer@example.com',
          name: 'Maria Garcia',
          password: 'hashedpassword123',
          role: UserRole.PROFESSIONAL,
          isEmailVerified: true,
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        },
      }),
      prisma.user.create({
        data: {
          email: 'david.marketer@example.com',
          name: 'David Chen',
          password: 'hashedpassword123',
          role: UserRole.PROFESSIONAL,
          isEmailVerified: true,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        },
      }),
      prisma.user.create({
        data: {
          email: 'emily.writer@example.com',
          name: 'Emily Davis',
          password: 'hashedpassword123',
          role: UserRole.PROFESSIONAL,
          isEmailVerified: true,
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        },
      }),
    ]);

    const [johnClient, sarahClient, alexDev, mariaDesigner, davidMarketer, emilyWriter] = users;

    console.log('👥 Created users');    // Create professional profiles
    const professionals = await Promise.all([
      prisma.professional.create({
        data: {
          userId: alexDev.id,
          bio: 'Full-stack developer with 8+ years of experience building scalable web applications using React, Node.js, and modern technologies.',
          experience: 8,
          rating: 4.9,
          reviewCount: 47,
          isVerified: true,
          specialties: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
          address: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',          country: 'USA',
          zipCode: '94105',
        },
      }),
      prisma.professional.create({
        data: {
          userId: mariaDesigner.id,
          bio: 'Creative graphic designer specializing in brand identity, UI/UX design, and digital marketing materials.',
          experience: 6,
          rating: 4.8,
          reviewCount: 32,
          isVerified: true,
          specialties: ['UI/UX Design', 'Brand Identity', 'Adobe Creative Suite', 'Figma'],
          address: '456 Design Avenue',
          city: 'Los Angeles',
          state: 'CA',          country: 'USA',
          zipCode: '90210',
        },
      }),
      prisma.professional.create({
        data: {
          userId: davidMarketer.id,
          bio: 'Digital marketing expert helping businesses grow through strategic SEO, social media, and paid advertising campaigns.',
          experience: 5,
          rating: 4.7,
          reviewCount: 28,
          isVerified: true,
          specialties: ['SEO', 'Google Ads', 'Social Media Marketing', 'Content Strategy'],
          address: '789 Marketing Lane',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
      }),
      prisma.professional.create({        data: {
          userId: emilyWriter.id,
          bio: 'Professional content writer and translator with expertise in technical writing, blog content, and multilingual translations.',
          experience: 4,
          rating: 4.9,
          reviewCount: 22,
          isVerified: false,
          specialties: ['Technical Writing', 'Blog Content', 'English-Spanish Translation', 'SEO Writing'],
          address: '321 Writer Way',
          city: 'Austin',
          state: 'TX',
          country: 'USA',
          zipCode: '73301',
        },
      }),
    ]);

    console.log('💼 Created professional profiles');

    // Create availability for professionals
    for (const professional of professionals) {
      // Create standard working hours (Mon-Fri, 9-5)
      for (let day = 1; day <= 5; day++) {
        await prisma.availability.create({
          data: {
            professionalId: professional.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: true,
          },
        });
      }
    }

    console.log('📅 Created availability schedules');

    // Create services
    const services = await Promise.all([
      // Alex's services
      prisma.service.create({
        data: {
          title: 'Full-Stack Web Application Development',
          description: 'Complete web application development from frontend to backend, including database design and deployment.',
          categoryId: categories[0].id, // Web Development
          duration: 2880, // 48 hours (2-3 weeks)
          price: 2500000, // $2,500,000 COP
          professionalId: professionals[0].id,
          images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop'],
          tags: ['React', 'Node.js', 'Database', 'API'],
          isActive: true,        },
      }),
      prisma.service.create({
        data: {
          title: 'React Component Library',
          description: 'Custom reusable React components for your design system.',
          categoryId: categories[0].id,
          duration: 480, // 8 hours
          price: 800000, // $800,000 COP
          professionalId: professionals[0].id,
          images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop'],
          tags: ['React', 'Components', 'Design System'],
          isActive: true,        },
      }),

      // Maria's services
      prisma.service.create({
        data: {
          title: 'Complete Brand Identity Design',
          description: 'Logo design, color palette, typography, and brand guidelines for your business.',
          categoryId: categories[1].id, // Graphic Design
          duration: 720, // 12 hours
          price: 1200000, // $1,200,000 COP
          professionalId: professionals[1].id,
          images: ['https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&h=300&fit=crop'],
          tags: ['Logo', 'Branding', 'Design'],
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          title: 'UI/UX Design for Mobile App',
          description: 'User interface and experience design for iOS and Android applications.',
          categoryId: categories[1].id,
          duration: 960, // 16 hours
          price: 1600000, // $1,600,000 COP
          professionalId: professionals[1].id,
          images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop'],
          tags: ['UI/UX', 'Mobile', 'App Design'],
          isActive: true,        },
      }),

      // David's services
      prisma.service.create({
        data: {
          title: 'SEO Optimization & Strategy',
          description: 'Complete SEO audit and optimization to improve your search engine rankings.',
          categoryId: categories[2].id, // Digital Marketing
          duration: 480, // 8 hours
          price: 800000, // $800,000 COP
          professionalId: professionals[2].id,
          images: ['https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&h=300&fit=crop'],
          tags: ['SEO', 'Analytics', 'Optimization'],
          isActive: true,
        },
      }),
      // Emily's services
      prisma.service.create({
        data: {
          title: 'Technical Documentation Writing',
          description: 'Clear and comprehensive technical documentation for software products.',
          categoryId: categories[3].id, // Writing & Translation
          duration: 360, // 6 hours
          price: 600000, // $600,000 COP
          professionalId: professionals[3].id,
          images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&h=300&fit=crop'],
          tags: ['Technical Writing', 'Documentation'],
          isActive: true,
        },
      }),
    ]);

    console.log('🛍️ Created services');

    // Create some bookings
    const bookings = await Promise.all([      prisma.booking.create({
        data: {
          clientId: johnClient.id,
          professionalId: professionals[0].userId,
          serviceId: services[0].id,
          status: BookingStatus.COMPLETED,
          scheduledAt: new Date('2024-05-15T10:00:00Z'),
          duration: services[0].duration,
          totalPrice: services[0].price,
          notes: 'Looking for a modern e-commerce platform',
        },
      }),      prisma.booking.create({
        data: {
          clientId: sarahClient.id,
          professionalId: professionals[1].userId,
          serviceId: services[2].id,
          status: BookingStatus.COMPLETED,
          scheduledAt: new Date('2024-05-20T14:00:00Z'),
          duration: services[2].duration,
          totalPrice: services[2].price,
          notes: 'Need branding for new startup',
        },
      }),      prisma.booking.create({
        data: {
          clientId: johnClient.id,
          professionalId: professionals[2].userId,
          serviceId: services[4].id,
          status: BookingStatus.CONFIRMED,
          scheduledAt: new Date('2025-06-05T09:00:00Z'),
          duration: services[4].duration,
          totalPrice: services[4].price,
          notes: 'Website needs better search visibility',
        },
      }),
    ]);

    console.log('📋 Created bookings');

    // Create reviews for completed bookings
    await Promise.all([
      prisma.review.create({
        data: {
          bookingId: bookings[0].id,
          clientId: johnClient.id,
          professionalId: professionals[0].userId,
          rating: 5,
          comment: 'Excellent work! Alex delivered exactly what I needed. The web application is fast, secure, and user-friendly. Highly recommended!',
        },
      }),
      prisma.review.create({
        data: {
          bookingId: bookings[1].id,
          clientId: sarahClient.id,
          professionalId: professionals[1].userId,
          rating: 5,
          comment: 'Maria created an amazing brand identity for our startup. The design perfectly captures our vision and stands out in the market.',
        },
      }),
    ]);

    console.log('⭐ Created reviews');

    // Create some conversations and messages
    const conversation = await prisma.conversation.create({
      data: {
        clientId: johnClient.id,
        professionalId: professionals[0].userId,
        unreadCount: 0,
      },
    });

    await Promise.all([
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: johnClient.id,
          content: 'Hi Alex, I\'m interested in your web development services. Can we discuss my project?',
          messageType: MessageType.TEXT,
          isRead: true,
        },
      }),
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: professionals[0].userId,
          content: 'Hello John! I\'d be happy to help with your project. What kind of web application are you looking to build?',
          messageType: MessageType.TEXT,
          isRead: true,
        },
      }),
    ]);

    console.log('💬 Created conversations and messages');

    // Create notifications
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: johnClient.id,
          title: 'Booking Confirmed',
          message: 'Your booking with Alex Rodriguez has been confirmed for June 5th, 2025.',
          type: NotificationType.BOOKING_CONFIRMED,
          isRead: false,
          relatedId: bookings[2].id,
        },
      }),
      prisma.notification.create({
        data: {
          userId: professionals[0].userId,
          title: 'New Review',
          message: 'John Smith left you a 5-star review!',
          type: NotificationType.NEW_REVIEW,
          isRead: false,
          relatedId: bookings[0].id,
        },
      }),
    ]);

    console.log('🔔 Created notifications');

    console.log('✅ Database seeding completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: users.length,
        professionals: professionals.length,
        services: services.length,
        categories: categories.length,        bookings: bookings.length,
      },
    });

  } catch (error: unknown) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to seed database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check seed status
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const professionalCount = await prisma.professional.count();
    const serviceCount = await prisma.service.count();
    const categoryCount = await prisma.serviceCategory.count();

    return NextResponse.json({
      success: true,
      data: {
        isEmpty: userCount === 0,
        counts: {
          users: userCount,
          professionals: professionalCount,
          services: serviceCount,
          categories: categoryCount,        },
      },
    });

  } catch (error: unknown) {
    console.error('❌ Error checking database status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check database status' },
      { status: 500 }
    );
  }
}
