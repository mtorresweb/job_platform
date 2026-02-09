**Guia de entrega y operacion del proyecto**

- Proposito: documento para el cliente con vision general, seguridad, configuracion, despliegue y cumplimiento.

 **Stack y arquitectura**
 - Next.js 15 (App Router, React 19, TypeScript) con estilado Tailwind CSS 4.
 - API routes en app/api para autenticacion, bookings, mensajes, notificaciones, servicios y administracion.
 - Hosting y CDN: Vercel (HTTPS automatico, aislamiento por deployment/preview, secrets cifrados en entorno, edge network global, cabeceras de seguridad configurables).
 - Base de datos: NeonDB (PostgreSQL administrado en la nube con TLS y pooling nativo) gestionada con Prisma; modelos en prisma/schema.prisma.
 - Estado y datos cliente: React Query; formularios con React Hook Form + Zod.
 - Tiempo real: Socket.io para mensajeria y notificaciones en vivo.
 - Correo: Nodemailer/Resend para verificacion, recordatorios y soporte.

**Modelado de datos clave (resumen)**
- Usuarios: roles CLIENT, PROFESSIONAL, ADMIN; campos de privacidad (aceptacion de terminos, retencion) y bandera profileCompleted.
- Profesionales: especialidades, ubicacion y contador de vistas.
- Servicios y categorias: precios, duracion, imagenes, etiquetas y estadisticas de vistas/reservas.
- Bookings: estados PENDING/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED, tiempos de auditoria y relacion servicio/cliente/profesional.
- Reviews: rating 1-5, comentario y respuesta del profesional.
- Mensajeria: conversaciones y mensajes (texto, imagen, archivo, system) con control de lectura.
- Notificaciones: tipos (booking, mensaje, review, sistema, recordatorio) con metadata JSON y expiracion.
- Seguridad y soporte: PasswordResetToken, ActivityLog, ContactSubmission, SystemConfig.

**Scripts principales (package.json)**
- Desarrollo: npm run dev (Turbopack).
- Build: npm run build (ejecuta prisma generate + next build).
- Produccion: npm start tras build.
- Lint: npm run lint.
- Base de datos: npm run db:generate, npm run db:push, npm run db:seed, npm run db:studio.

 **Configuracion de entorno requerida (ejemplo .env)**
 - DATABASE_URL: cadena Postgres de NeonDB con sslmode=require y pool (p. ej. "postgresql://USER:PASSWORD@HOST/db?sslmode=require").
 - NEXTAUTH_URL y NEXTAUTH_SECRET: URL publica y secreto de sesiones.
 - AUTH_PROVIDER y claves (OAuth) si se usan terceros.
 - EMAIL_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS o RESEND_API_KEY segun proveedor de correo.
 - SOCKET_URL/NEXT_PUBLIC_SOCKET_URL si el front consume sockets externos.
 - FILE_STORAGE_* si se usa almacenamiento de archivos (ajustar a la infraestructura elegida).

 **Operacion y despliegue**
 - Pre-requisitos: Node 20+, PostgreSQL accesible, .env completado.
 - Migraciones: npx prisma migrate deploy en despliegue (Vercel admite comando en deploy hook); npx prisma generate tras cambios de schema.
 - Seed opcional: npm run db:seed ejecuta [prisma/seed.js](prisma/seed.js); este script elimina datos y crea usuarios demo (password "password123"), profesionales, categorias y bookings. No ejecutar en produccion.
 - Build: npm run build; luego npm start detrás de un proxy HTTPS (Nginx/Cloudflare) con HTTP/2 y compresion.
 - Monitoreo: habilitar logs de aplicacion y DB; usar ActivityLog para auditoria y revisar errores de Next.js en runtime.
 - Backups: snapshots diarios de PostgreSQL (Neon permite backups y branching), retencion minima 30 dias; probar restauraciones periodicamente.

**Navegacion y modulos principales (app/)**
- Paginas publicas: inicio, about, how-it-works, services, professionals, benefits, faq, legal (privacy, terms, cookies).
- Auth: register, login, forgot-password, reset-password.
- Usuarios autenticados: dashboard, bookings, notifications, messages, profile, settings.
- Profesionales: pages de servicios y detalle [services/[id]] y [professionals/[id]].
- Admin/analytics: rutas en admin y analytics para panel interno.
- API: directorios en app/api para auth, bookings, services, messages, notifications, search, contact, seed, upload, etc.

 **Seguridad y buenas practicas**
 - Passwords hash con bcrypt; forzar TLS en toda comunicacion ($HTTPS$) y cookies httpOnly/secure.
 - Vercel: TLS gestionado y automatico, aislamiento por deployment/preview, secrets cifrados en variables de entorno, cabeceras de seguridad configurables (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) y red perimetral global.
 - NeonDB: conexiones TLS, pooling para limitar conexiones, usuarios/roles separados por entorno, rotacion periodica de credenciales.
 - Revisar CORS y rate limiting en app/api para frenar abuso.
 - Roles: validar CLIENT/PROFESSIONAL/ADMIN en cada endpoint sensible y en UI.
 - Datos personales: campos de consentimiento y retencion en usuarios; respetar derechos de acceso, rectificacion y borrado.
 - Auditoria: ActivityLog para rastrear acciones; revisar alertas de acceso inusual.
 - Archivos adjuntos: validar tipo MIME/tamano y almacenar en proveedor seguro con URLs firmadas.
 - Emails: firmar enlaces de reset y expirar tokens (PasswordResetToken) de forma corta.

**Cumplimiento legal**
- Ley 1581/2012 (Colombia) y GDPR: informar proposito, base legal, y obtener consentimiento explicito para email/marketing.
- Contrato de encargo/DPA con proveedores (hosting, correo, almacenamiento).
- Derechos del usuario: canal para solicitudes de acceso/rectificacion/elim, y bitacora de atencion.
- Cookies: banner y politica clara; usar modo estricto para sesiones y limitar trackers.
- Retencion: definir periodos y limpiar datos inactivos usando dataRetentionExpiry del usuario.

