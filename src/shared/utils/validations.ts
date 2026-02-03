// ==========================================
// ESQUEMAS DE VALIDACIÓN CON ZOD
// ==========================================
// Validaciones para formularios y APIs siguiendo mejores prácticas

import { z } from "zod";
import {
  UserRole,
  BookingStatus,
  MessageType,
  NotificationType,
} from "../types";
import { TIME_CONFIG, FILE_CONFIG } from "../constants";

// ==========================================
// ESQUEMAS BASE
// ==========================================

// Validación de email
const emailSchema = z
  .string()
  .min(1, "El email es obligatorio")
  .email("Formato de email inválido")
  .max(100, "El email es demasiado largo");

// Validación de contraseña
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(100, "La contraseña es demasiado larga")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/\d/, "Debe contener al menos un número")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Debe contener al menos un carácter especial",
  );

// Validación de nombre
const nameSchema = z
  .string()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(50, "El nombre es demasiado largo")
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    "El nombre solo puede contener letras y espacios",
  );

// Validación de teléfono colombiano
const phoneSchema = z
  .string()
  .regex(/^(\+57|57)?[1-9]\d{9}$/, "Formato de teléfono inválido")
  .optional();

// ==========================================
// ESQUEMAS DE AUTENTICACIÓN
// ==========================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es obligatoria"),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.nativeEnum(UserRole),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debe aceptar los términos y condiciones",
    }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: "Debe aceptar la política de privacidad",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requerido"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Contraseña actual requerida"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// ==========================================
// ESQUEMAS DE USUARIO Y PERFIL
// ==========================================

export const updateProfileSchema = z.object({
  name: nameSchema,
  avatar: z
    .string()
    .trim()
    .url("URL de avatar inválida")
    .or(z.literal(""))
    .optional(),
  phone: phoneSchema,
  address: z.string().max(200, "Dirección demasiado larga").optional(),
  city: z.string().max(50, "Ciudad demasiado larga").optional(),
  state: z.string().max(50, "Estado demasiado largo").optional(),
  zipCode: z.string().max(10, "Código postal inválido").optional(),
  country: z.string().max(56, "Nombre de país demasiado largo").optional(),
});

export const professionalProfileSchema = updateProfileSchema.extend({
  bio: z
    .string()
    .min(10, "La biografía debe tener al menos 10 caracteres")
    .optional(),
  experience: z
    .coerce.number()
    .min(0, "La experiencia no puede ser negativa")
    .max(50, "Experiencia máxima: 50 años")
    .optional()
    .default(0),
  specialties: z
    .array(z.string())
    .max(10, "Máximo 10 especialidades")
    .optional()
    .default([]),
});

// ==========================================

export const resetPasswordWithTokenSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  password: passwordSchema,
});
// ESQUEMAS DE SERVICIOS
// ==========================================

export const serviceCategorySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(200, "La descripción es demasiado larga"),
  icon: z.string().min(1, "Icono requerido"),
  slug: z
    .string()
    .min(2, "El slug debe tener al menos 2 caracteres")
    .max(50, "El slug es demasiado largo")
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede contener letras minúsculas, números y guiones",
    ),
});

export const serviceSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título es demasiado largo"),
  description: z
    .string()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(1000, "La descripción es demasiado larga"),
  categoryId: z.string().cuid("ID de categoría inválido"),
  price: z
    .number({ invalid_type_error: "El precio es requerido" })
    .min(0, "El precio no puede ser negativo"),
  duration: z
    .number()
    .min(
      TIME_CONFIG.minDuration,
      `Duración mínima: ${TIME_CONFIG.minDuration} minutos`,
    )
    .max(
      TIME_CONFIG.maxDuration,
      `Duración máxima: ${TIME_CONFIG.maxDuration} minutos`,
    ),
  tags: z
    .array(z.string())
    .max(10, "Máximo 10 etiquetas")
    .optional()
    .default([]),
  images: z
    .array(z.string().url("URL de imagen inválida"))
    .max(
      FILE_CONFIG.maxImagesPerService,
      `Máximo ${FILE_CONFIG.maxImagesPerService} imágenes`,
    )
    .optional()
    .default([]),
});

export const updateServiceSchema = serviceSchema.partial().extend({
  id: z.string().cuid("ID de servicio inválido"),
});

// ==========================================
// ESQUEMAS DE DISPONIBILIDAD
// ==========================================

export const availabilitySchema = z
  .object({
    dayOfWeek: z
      .number()
      .min(0, "Día de semana inválido")
      .max(6, "Día de semana inválido"),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Formato de hora inválido (HH:mm)",
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Formato de hora inválido (HH:mm)",
      ),
    isAvailable: z.boolean().default(true),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "La hora de inicio debe ser anterior a la hora de fin",
    path: ["endTime"],
  });

export const bulkAvailabilitySchema = z.array(availabilitySchema);

// ==========================================
// ESQUEMAS DE RESERVAS
// ==========================================

export const bookingSchema = z.object({
  serviceId: z.string().cuid("ID de servicio inválido"),
  // Coerce para aceptar string ISO desde el cliente
  scheduledAt: z.coerce.date().refine((date) => date > new Date(), {
    message: "La fecha debe ser futura",
  }),
  notes: z.string().max(500, "Las notas son demasiado largas").optional(),
});

export const updateBookingStatusSchema = z
  .object({
    status: z.nativeEnum(BookingStatus).optional(),
    cancellationReason: z
      .string()
      .max(200, "Razón de cancelación demasiado larga")
      .optional(),
    // Permite reagendar
    scheduledAt: z
      .coerce.date()
      .refine((date) => date > new Date(), {
        message: "La nueva fecha debe ser futura",
      })
      .optional(),
    // Mensaje opcional para acompañar la acción
    message: z.string().max(500, "El mensaje es demasiado largo").optional(),
  })
  .refine((data) => data.status || data.scheduledAt, {
    message: "Debes enviar un estado o una nueva fecha",
    path: ["status"],
  });

// ==========================================
// ESQUEMAS DE RESEÑAS
// ==========================================

export const reviewSchema = z.object({
  bookingId: z.string().cuid("ID de reserva inválido"),
  rating: z
    .number()
    .min(1, "La calificación mínima es 1")
    .max(5, "La calificación máxima es 5"),
  comment: z
    .string()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(500, "El comentario es demasiado largo")
    .optional(),
});

export const reviewResponseSchema = z.object({
  response: z
    .string()
    .min(10, "La respuesta debe tener al menos 10 caracteres")
    .max(300, "La respuesta es demasiado larga"),
});

// ==========================================
// ESQUEMAS DE MENSAJERÍA
// ==========================================

export const messageSchema = z.object({
  conversationId: z.string().cuid("ID de conversación inválido"),
  content: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(1000, "El mensaje es demasiado largo"),
  messageType: z.nativeEnum(MessageType).default(MessageType.TEXT),
});

export const createConversationSchema = z.object({
  professionalId: z.string().cuid("ID de profesional inválido"),
  initialMessage: z
    .string()
    .min(1, "El mensaje inicial es requerido")
    .max(500, "El mensaje inicial es demasiado largo"),
});

// ==========================================
// ESQUEMAS DE NOTIFICACIONES
// ==========================================

export const notificationSchema = z.object({
  userId: z.string().cuid("ID de usuario inválido"),
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(100, "El título es demasiado largo"),
  message: z
    .string()
    .min(1, "El mensaje es requerido")
    .max(300, "El mensaje es demasiado largo"),
  type: z.nativeEnum(NotificationType),
  relatedId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// ==========================================
// ESQUEMAS DE BÚSQUEDA Y FILTROS
// ==========================================

export const searchParamsSchema = z.object({
  query: z.string().max(100, "Búsqueda demasiado larga").optional(),
  category: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),  priceMax: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  location: z.string().max(100).optional(),
  availability: z.coerce.boolean().optional(),
  sortBy: z.enum(["price", "rating", "newest", "popular"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(12),
});

// ==========================================
// ESQUEMAS DE ARCHIVOS
// ==========================================

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= FILE_CONFIG.maxFileSize, {
      message: `El archivo debe ser menor a ${
        FILE_CONFIG.maxFileSize / 1024 / 1024
      }MB`,
    })
    .refine(
      (file) =>
        (FILE_CONFIG.allowedImageTypes as readonly string[]).includes(
          file.type,
        ),
      {
        message: "Tipo de archivo no permitido",
      },
    ),
  folder: z.string().optional().default("uploads"),
});

// ==========================================
// ESQUEMAS DE PAGINACIÓN
// ==========================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ==========================================
// ESQUEMAS DE CONFIGURACIÓN DEL SISTEMA
// ==========================================

export const systemConfigSchema = z.object({
  key: z
    .string()
    .min(1, "La clave es requerida")
    .max(50, "La clave es demasiado larga"),
  value: z.string().min(1, "El valor es requerido"),
  type: z.enum(["string", "number", "boolean", "json"]).default("string"),
  isPublic: z.boolean().default(false),
});

// ==========================================
// TIPOS INFERIDOS DE LOS ESQUEMAS
// ==========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ProfessionalProfileInput = z.infer<
  typeof professionalProfileSchema
>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type SearchParamsInput = z.infer<typeof searchParamsSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
