import { Prisma, PrismaClient } from "@prisma/client";

// Configuration according to environment
const logLevel: ("query" | "info" | "warn" | "error")[] =
  process.env.NODE_ENV === "development"
    ? ["query", "info", "warn", "error"]
    : ["warn", "error"];

// Create optimized Prisma client
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: logLevel,
    errorFormat: "pretty",
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ??
          // Fail fast if DATABASE_URL is not set
          (() => {
            throw new Error("DATABASE_URL environment variable is not set");
          })(),
      },
    },
  });

  return client.$extends({
    query: {
      $allOperations({ args, query }) {
        const startTime = Date.now();
        return query(args)
          .catch(async (e) => {
            const retryableError =
              e.message.includes("Connection") ||
              e.message.includes("timeout") ||
              e.message.includes("ECONNREFUSED");

            if (retryableError) {
              console.log(
                "⚠️ Database error, attempting reconnection:",
                e.message,
              );
              await prisma.$disconnect();
              await new Promise((resolve) => setTimeout(resolve, 1000));
              await prisma.$connect();
              return query(args);
            }
            throw e;
          })
          .finally(() => {
            if (process.env.NODE_ENV === "development") {
              const duration = Date.now() - startTime;
              if (duration > 1000) {
                console.warn(`⚠️ Slow query detected (${duration}ms):`, args);
              }
            }
          });
      },
    },
  });
};

// Type for global Prisma instance
type PrismaClientType = ReturnType<typeof createPrismaClient>;
type GlobalPrismaType = { prisma: PrismaClientType | undefined };

// Global singleton for hot reload in development
const globalForPrisma = globalThis as unknown as GlobalPrismaType;

// Create or reuse singleton client
const client = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = client;
}

export const prisma = client;

// Database utility functions
async function reconnectDatabase(client: PrismaClientType, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      await client.$disconnect();
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 10000)),
      );
      await client.$connect();
      console.log("✅ Reconnected to database");
      return;
    } catch (error) {
      console.error(
        `❌ Reconnection attempt ${i + 1}/${attempts} failed:`,
        error,
      );
      if (i === attempts - 1) throw error;
    }
  }
}

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Connected to database");
    }
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    await reconnectDatabase(prisma);
  }
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Disconnected from database");
    }
  } catch (error) {
    console.error("❌ Error disconnecting from database:", error);
    throw error;
  }
};

export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", timestamp: new Date() };
  } catch (error) {
    console.error("❌ Database unavailable:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { status: "unhealthy", error: errorMessage, timestamp: new Date() };
  }
};

export const cleanupExpiredData = async () => {
  try {
    const now = new Date();
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
    );

    const [expiredUsers, expiredNotifications, oldLogs] = await Promise.all([
      prisma.user.deleteMany({
        where: { dataRetentionExpiry: { lt: now } },
      }),
      prisma.notification.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
      prisma.activityLog.deleteMany({
        where: { createdAt: { lt: oneYearAgo } },
      }),
    ]);

    const results = {
      users: expiredUsers.count,
      notifications: expiredNotifications.count,
      logs: oldLogs.count,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Cleanup completed:", results);
    }

    return { success: true, cleaned: results };
  } catch (error) {
    console.error("❌ Error in data cleanup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

type PrismaErrorType =
  | "UNIQUE_CONSTRAINT"
  | "NOT_FOUND"
  | "FOREIGN_KEY_CONSTRAINT"
  | "DATABASE_ERROR"
  | "VALIDATION_ERROR"
  | "CONNECTION_ERROR";

interface PrismaErrorResult {
  type: PrismaErrorType;
  message: string;
  field?: string[];
  originalError?: string;
  code?: string;
}

export const handlePrismaError = (error: unknown): PrismaErrorResult => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          type: "UNIQUE_CONSTRAINT",
          message: "Resource already exists",
          field: error.meta?.target as string[],
          code: error.code,
        };
      case "P2025":
        return {
          type: "NOT_FOUND",
          message: "Resource not found",
          code: error.code,
        };
      case "P2003":
        return {
          type: "FOREIGN_KEY_CONSTRAINT",
          message: "Invalid reference",
          field: error.meta?.field_name
            ? [error.meta.field_name as string]
            : undefined,
          code: error.code,
        };
      case "P2000":
        return {
          type: "VALIDATION_ERROR",
          message: "The provided value is invalid",
          field: error.meta?.target as string[],
          code: error.code,
        };
    }
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      type: "CONNECTION_ERROR",
      message: "Failed to connect to the database",
      originalError: error.message,
      code: error.errorCode,
    };
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      type: "VALIDATION_ERROR",
      message: "Invalid query or data",
      originalError: error.message,
    };
  }

  return {
    type: "DATABASE_ERROR",
    message: "Unexpected database error",
    originalError: error instanceof Error ? error.message : "Unknown error",
  };
};

export default prisma;
