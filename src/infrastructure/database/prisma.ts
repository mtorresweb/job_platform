// ==========================================
// CONFIGURACIÓN DE PRISMA CLIENT
// ==========================================
// Cliente de base de datos singleton para evitar múltiples conexiones

import { PrismaClient } from "@prisma/client";

// Configuración de logs según el entorno
const logLevel: ("query" | "info" | "warn" | "error")[] =
  process.env.NODE_ENV === "development"
    ? ["query", "info", "warn", "error"]
    : ["warn", "error"];

// Crear cliente de Prisma con configuración optimizada
const createPrismaClient = () => {
  return new PrismaClient({
    log: logLevel,
    errorFormat: "pretty",
  });
};

// Singleton pattern para desarrollo (Hot Reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// En desarrollo, guardar el cliente en global para evitar reinstanciación
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ==========================================
// FUNCIONES UTILITARIAS PARA BASE DE DATOS
// ==========================================

/**
 * Función para conectar a la base de datos
 */
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Conectado a la base de datos");
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);
    throw error;
  }
};

/**
 * Función para desconectar de la base de datos
 */
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Desconectado de la base de datos");
  } catch (error) {
    console.error("❌ Error desconectando de la base de datos:", error);
    throw error;
  }
};

/**
 * Función para verificar la salud de la base de datos
 */
export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", timestamp: new Date() };
  } catch (error) {
    console.error("❌ Base de datos no disponible:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { status: "unhealthy", error: errorMessage, timestamp: new Date() };
  }
};

/**
 * Función para limpiar datos expirados (GDPR/Ley 1581)
 */
export const cleanupExpiredData = async () => {
  try {
    const now = new Date();

    // Limpiar usuarios que han excedido el tiempo de retención
    const expiredUsers = await prisma.user.deleteMany({
      where: {
        dataRetentionExpiry: {
          lt: now,
        },
      },
    });

    // Limpiar notificaciones expiradas
    const expiredNotifications = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Limpiar logs antiguos (más de 1 año)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const oldLogs = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: oneYearAgo,
        },
      },
    });

    console.log(`✅ Limpieza completada:`, {
      expiredUsers: expiredUsers.count,
      expiredNotifications: expiredNotifications.count,
      oldLogs: oldLogs.count,
    });

    return {
      success: true,
      cleaned: {
        users: expiredUsers.count,
        notifications: expiredNotifications.count,
        logs: oldLogs.count,
      },
    };
  } catch (error) {
    console.error("❌ Error en limpieza de datos:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
};

// ==========================================
// MANEJO DE ERRORES DE PRISMA
// ==========================================

export const handlePrismaError = (error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };

    if (prismaError.code === "P2002") {
      // Violación de restricción única
      return {
        type: "UNIQUE_CONSTRAINT",
        message: "El recurso ya existe",
        field: prismaError.meta?.target,
      };
    }
    if (prismaError.code === "P2025") {
      // Registro no encontrado
      return {
        type: "NOT_FOUND",
        message: "Recurso no encontrado",
      };
    }

    if (prismaError.code === "P2003") {
      // Violación de clave foránea
      return {
        type: "FOREIGN_KEY_CONSTRAINT",
        message: "Referencia inválida",
      };
    }
  }

  // Error genérico
  return {
    type: "DATABASE_ERROR",
    message: "Error en la base de datos",
    originalError: error instanceof Error ? error.message : "Unknown error",
  };
};

export default prisma;
