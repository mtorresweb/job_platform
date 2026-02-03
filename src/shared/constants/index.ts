// ==========================================
// CONSTANTES DE LA APLICACIÓN
// ==========================================

export const APP_CONFIG = {
  name: "ServicesPro",
  description: "Plataforma de servicios profesionales",
  version: "1.0.0",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supportEmail: "soporte@servicespro.com",
  companyName: "ServicesPro Colombia SAS",
} as const;

// ==========================================
// CONFIGURACIÓN DE PAGINACIÓN
// ==========================================

export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 100,
  defaultPage: 1,
} as const;

// ==========================================
// CONFIGURACIÓN DE ARCHIVOS
// ==========================================

export const FILE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedFileTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  maxImagesPerService: 5,
} as const;

// ==========================================
// CATEGORÍAS DE SERVICIOS PREDEFINIDAS
// ==========================================

export const SERVICE_CATEGORIES = [
  {
    id: "tecnologia",
    name: "Tecnología",
    description: "Desarrollo web, móvil, consultoría IT",
    icon: "Laptop",
    slug: "tecnologia",
  },
  {
    id: "diseno",
    name: "Diseño",
    description: "Diseño gráfico, UX/UI, branding",
    icon: "Palette",
    slug: "diseno",
  },
  {
    id: "marketing",
    name: "Marketing Digital",
    description: "SEO, redes sociales, publicidad online",
    icon: "TrendingUp",
    slug: "marketing",
  },
  {
    id: "consultoria",
    name: "Consultoría",
    description: "Consultoría empresarial, legal, financiera",
    icon: "Users",
    slug: "consultoria",
  },
  {
    id: "educacion",
    name: "Educación",
    description: "Tutorías, cursos, capacitación",
    icon: "BookOpen",
    slug: "educacion",
  },
  {
    id: "salud",
    name: "Salud y Bienestar",
    description: "Terapias, nutrición, fitness",
    icon: "Heart",
    slug: "salud",
  },
  {
    id: "hogar",
    name: "Hogar y Mantenimiento",
    description: "Reparaciones, limpieza, jardinería",
    icon: "Home",
    slug: "hogar",
  },
  {
    id: "eventos",
    name: "Eventos",
    description: "Organización de eventos, catering, decoración",
    icon: "Calendar",
    slug: "eventos",
  },
] as const;

// ==========================================
// CONFIGURACIÓN DE RATING
// ==========================================

export const RATING_CONFIG = {
  min: 1,
  max: 5,
  defaultRating: 0,
  precision: 0.5, // Permite medias estrellas
} as const;

// ==========================================
// CONFIGURACIÓN DE HORARIOS
// ==========================================

export const TIME_CONFIG = {
  minDuration: 30, // 30 minutos mínimo
  maxDuration: 480, // 8 horas máximo
  timeSlots: [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
  ],
  daysOfWeek: [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
  ],
} as const;

// ==========================================
// MENSAJES DEL SISTEMA
// ==========================================

export const MESSAGES = {
  errors: {
    generic: "Ha ocurrido un error inesperado. Por favor, intenta nuevamente.",
    network: "Error de conexión. Verifica tu conexión a internet.",
    unauthorized: "No tienes permisos para realizar esta acción.",
    notFound: "El recurso solicitado no fue encontrado.",
    validation: "Los datos proporcionados no son válidos.",
    emailExists: "Este correo electrónico ya está registrado.",
    invalidCredentials: "Credenciales inválidas.",
    sessionExpired:
      "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
  },
  success: {
    registered:
      "Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.",
    loggedIn: "Has iniciado sesión correctamente.",
    loggedOut: "Has cerrado sesión correctamente.",
    profileUpdated: "Perfil actualizado exitosamente.",
    serviceCreated: "Servicio creado exitosamente.",
    serviceUpdated: "Servicio actualizado exitosamente.",
    bookingCreated: "Reserva creada exitosamente.",
    reviewSubmitted: "Reseña enviada exitosamente.",
    messagesSent: "Mensaje enviado exitosamente.",
  },
  validation: {
    required: "Este campo es obligatorio.",
    email: "Ingresa un correo electrónico válido.",
    minLength: "Debe tener al menos {min} caracteres.",
    maxLength: "Debe tener máximo {max} caracteres.",
    passwordMatch: "Las contraseñas no coinciden.",

    fileSize: "El archivo debe ser menor a {size}MB.",
    fileType: "Tipo de archivo no permitido.",
  },
} as const;

// ==========================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ==========================================

export const NOTIFICATION_CONFIG = {
  autoCloseDelay: 5000, // 5 segundos
  maxNotifications: 5,
  position: "bottom-right" as const,
} as const;

// ==========================================
// RUTAS DE LA APLICACIÓN
// ==========================================

export const ROUTES = {
  // Públicas
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  services: "/services",
  service: (id: string) => `/services/${id}`,
  professional: (id: string) => `/professionals/${id}`,

  // Autenticadas
  dashboard: "/dashboard",
  profile: "/dashboard/profile",
  myServices: "/dashboard/services",
  bookings: "/dashboard/bookings",
  messages: "/dashboard/messages",
  reviews: "/dashboard/reviews",

  // Admin
  admin: "/admin",
  adminUsers: "/admin/users",
  adminServices: "/admin/services",
  adminReports: "/admin/reports",

  // API
  api: {
    auth: {
      login: "/api/auth/login",
      register: "/api/auth/register",
      logout: "/api/auth/logout",
      refresh: "/api/auth/refresh",
      forgotPassword: "/api/auth/forgot-password",
      resetPassword: "/api/auth/reset-password",
    },
    users: "/api/users",
    services: "/api/services",
    bookings: "/api/bookings",
    reviews: "/api/reviews",
    messages: "/api/messages",
    notifications: "/api/notifications",
    categories: "/api/categories",
    upload: "/api/upload",
  },
} as const;

// ==========================================
// CONFIGURACIÓN DE COLOMBIA (LEY 1581/2012)
// ==========================================

export const GDPR_CONFIG = {
  cookieConsent: {
    necessary: true,
    analytics: false,
    marketing: false,
  },
  dataRetention: {
    userProfiles: 730, // 2 años en días
    inactiveAccounts: 1095, // 3 años en días
    logs: 365, // 1 año en días
    messages: 1095, // 3 años en días
  },
  privacyPolicy: {
    version: "1.0",
    lastUpdated: "2024-01-01",
    contactEmail: "privacidad@servicespro.com",
  },
} as const;

// ==========================================
// CONFIGURACIÓN DE SOCKET.IO
// ==========================================

export const SOCKET_EVENTS = {
  // Conexión
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Mensajes
  JOIN_CONVERSATION: "join_conversation",
  LEAVE_CONVERSATION: "leave_conversation",
  SEND_MESSAGE: "send_message",
  NEW_MESSAGE: "new_message",
  MESSAGE_READ: "message_read",

  // Notificaciones
  NEW_NOTIFICATION: "new_notification",
  NOTIFICATION_READ: "notification_read",

  // Estado del usuario
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
} as const;
