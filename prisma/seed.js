import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (be careful in production!)
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.user.deleteMany();

  // Create service categories
  const categories = await Promise.all([
    prisma.serviceCategory.create({
      data: {
        name: 'Hogar',
        description: 'Servicios para el hogar y reparaciones domésticas',
        icon: 'home',
        slug: 'hogar',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Tecnología',
        description: 'Desarrollo web, aplicaciones y servicios IT',
        icon: 'laptop',
        slug: 'tecnologia',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Fotografía',
        description: 'Fotografía profesional para eventos y retratos',
        icon: 'camera',
        slug: 'fotografia',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Automotriz',
        description: 'Reparación y mantenimiento de vehículos',
        icon: 'car',
        slug: 'automotriz',
      },
    }),
  ]);

  console.log('✅ Created service categories');

  // Create users (clients, professionals, admin)
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('Melocaramelo123#', 10);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'serviciospro910@gmail.com',
      name: 'Administrador',
      password: adminPassword,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  // Create client users
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ana.garcia@email.com',
        name: 'Ana García',
        password: hashedPassword,
        role: UserRole.CLIENT,
        isEmailVerified: true,
        avatar: '/avatars/ana.jpg',
      },
    }),
    prisma.user.create({
      data: {
        email: 'roberto.silva@email.com',
        name: 'Roberto Silva',
        password: hashedPassword,
        role: UserRole.CLIENT,
        isEmailVerified: true,
        avatar: '/avatars/roberto.jpg',
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria.lopez@email.com',
        name: 'María López',
        password: hashedPassword,
        role: UserRole.CLIENT,
        isEmailVerified: true,
        avatar: '/avatars/maria.jpg',
      },
    }),
  ]);

  console.log('✅ Created client users');

  // Create professional users
  const professionalUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'carlos.mendez@email.com',
        name: 'Carlos Méndez',
        password: hashedPassword,
        role: UserRole.PROFESSIONAL,
        isEmailVerified: true,
        avatar: '/avatars/carlos.jpg',
      },
    }),
    prisma.user.create({
      data: {
        email: 'laura.jimenez@email.com',
        name: 'Laura Jiménez',
        password: hashedPassword,
        role: UserRole.PROFESSIONAL,
        isEmailVerified: true,
        avatar: '/avatars/laura.jpg',
      },
    }),
    prisma.user.create({
      data: {
        email: 'miguel.torres@email.com',
        name: 'Miguel Torres',
        password: hashedPassword,
        role: UserRole.PROFESSIONAL,
        isEmailVerified: true,
        avatar: '/avatars/miguel.jpg',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jorge.ramirez@email.com',
        name: 'Jorge Ramírez',
        password: hashedPassword,
        role: UserRole.PROFESSIONAL,
        isEmailVerified: true,
        avatar: '/avatars/jorge.jpg',
      },
    }),
  ]);

  console.log('✅ Created professional users');

  // Create professional profiles
  const professionals = await Promise.all([
    prisma.professional.create({
      data: {
        userId: professionalUsers[0].id,
        bio: 'Técnico especializado en reparación de electrodomésticos con más de 10 años de experiencia. Servicio a domicilio con garantía.',
        experience: 10,
        rating: 4.8,
        reviewCount: 124,        isVerified: true,
        specialties: ['Electrodomésticos', 'Reparación', 'Mantenimiento'],
        address: 'Calle 85 #15-20',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
      },
    }),
    prisma.professional.create({
      data: {
        userId: professionalUsers[1].id,
        bio: 'Fotógrafa profesional especializada en eventos, bodas y retratos. Equipo profesional de última generación.',
        experience: 7,
        rating: 4.9,
        reviewCount: 78,        isVerified: true,
        specialties: ['Fotografía de eventos', 'Bodas', 'Retratos'],
        address: 'Carrera 11 #93-45',
        city: 'Barranquilla',
        state: 'Atlántico',
        country: 'Colombia',
      },
    }),
    prisma.professional.create({
      data: {
        userId: professionalUsers[2].id,
        bio: 'Plomero certificado con experiencia en instalaciones residenciales y comerciales. Servicio 24/7 para emergencias.',
        experience: 8,
        rating: 4.7,
        reviewCount: 156,        isVerified: true,
        specialties: ['Plomería', 'Instalaciones', 'Emergencias'],
        address: 'Avenida 6N #23-50',
        city: 'Cali',
        state: 'Valle del Cauca',
        country: 'Colombia',
      },
    }),
    prisma.professional.create({
      data: {
        userId: professionalUsers[3].id,
        bio: 'Mecánico automotriz con certificaciones internacionales. Especialista en diagnóstico computarizado y reparaciones.',
        experience: 12,
        rating: 4.8,
        reviewCount: 134,
        isVerified: true,        specialties: ['Mecánica automotriz', 'Diagnóstico', 'Mantenimiento'],
        address: 'Carrera 70 #52-15',
        city: 'Medellín',
        state: 'Antioquia',
        country: 'Colombia',
      },
    }),
  ]);

  console.log('✅ Created professional profiles');

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        title: 'Reparación de Electrodomésticos',
        description: 'Reparación profesional de lavadoras, neveras, estufas y más. Servicio a domicilio con garantía de 6 meses.',
        categoryId: categories[0].id, // Hogar
        professionalId: professionals[0].id,
        priceType: 'PER_JOB',
        price: 50000,
        duration: 120,
        tags: ['Reparación', 'A domicilio', 'Garantía', 'Electrodomésticos'],
        images: ['/services/electrodomesticos1.jpg', '/services/electrodomesticos2.jpg'],
      },
    }),
    prisma.service.create({
      data: {
        title: 'Desarrollo Web Profesional',
        description: 'Creación de sitios web modernos y aplicaciones web usando React, Next.js y Node.js. Diseño responsive y optimizado.',
        categoryId: categories[1].id, // Tecnología
        professionalId: professionals[0].id,
        priceType: 'PER_JOB',
        price: 800000,
        duration: 480,
        tags: ['React', 'Next.js', 'Responsive', 'Web Development'],
        images: ['/services/web-dev1.jpg', '/services/web-dev2.jpg'],
      },
    }),
    prisma.service.create({
      data: {
        title: 'Fotografía de Eventos',
        description: 'Fotografía profesional para bodas, cumpleaños, eventos corporativos y sociales. Edición incluida.',
        categoryId: categories[2].id, // Fotografía
        professionalId: professionals[1].id,
        priceType: 'PER_HOUR',
        price: 200000,
        duration: 240,
        tags: ['Bodas', 'Eventos', 'Corporativo', 'Edición'],
        images: ['/services/fotografia1.jpg', '/services/fotografia2.jpg'],
      },
    }),
    prisma.service.create({
      data: {
        title: 'Plomería Residencial',
        description: 'Instalación y reparación de tuberías, grifos, sanitarios. Servicio 24/7 para emergencias.',
        categoryId: categories[0].id, // Hogar
        professionalId: professionals[2].id,
        priceType: 'PER_JOB',
        price: 40000,
        duration: 90,
        tags: ['24/7', 'Emergencias', 'Garantía', 'Instalación'],
        images: ['/services/plomeria1.jpg', '/services/plomeria2.jpg'],
      },
    }),
    prisma.service.create({
      data: {
        title: 'Mecánica Automotriz',
        description: 'Reparación y mantenimiento de vehículos. Diagnóstico computarizado incluido. Repuestos originales.',
        categoryId: categories[3].id, // Automotriz
        professionalId: professionals[3].id,
        priceType: 'PER_HOUR',
        price: 80000,
        duration: 180,
        tags: ['Diagnóstico', 'Mantenimiento', 'Garantía', 'Repuestos'],
        images: ['/services/mecanica1.jpg', '/services/mecanica2.jpg'],
      },
    }),
  ]);

  console.log('✅ Created services');

  // Create some bookings
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        clientId: clients[0].id,
        professionalId: professionals[0].id,
        serviceId: services[0].id,
        status: BookingStatus.CONFIRMED,
        scheduledAt: new Date('2025-06-02T14:00:00'),
        duration: 120,
        totalPrice: 50000,
        notes: 'Reparación de lavadora que no está centrifugando correctamente.',
      },
    }),
    prisma.booking.create({
      data: {
        clientId: clients[1].id,
        professionalId: professionals[1].id,
        serviceId: services[2].id,
        status: BookingStatus.PENDING,
        scheduledAt: new Date('2025-06-05T10:00:00'),
        duration: 240,
        totalPrice: 200000,
        notes: 'Fotografía para evento de cumpleaños, aproximadamente 50 personas.',
      },
    }),
    prisma.booking.create({
      data: {
        clientId: clients[2].id,
        professionalId: professionals[2].id,
        serviceId: services[3].id,
        status: BookingStatus.COMPLETED,
        scheduledAt: new Date('2025-05-30T09:00:00'),
        duration: 90,
        totalPrice: 40000,
        notes: 'Reparación de grifo de cocina.',
        completedAt: new Date('2025-05-30T10:30:00'),
      },
    }),
  ]);

  console.log('✅ Created bookings');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Summary:
- ${categories.length} service categories
- 1 admin user
- ${clients.length} client users  
- ${professionalUsers.length} professional users
- ${professionals.length} professional profiles
- ${services.length} services
- ${bookings.length} bookings
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
