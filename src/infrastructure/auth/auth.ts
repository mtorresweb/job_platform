import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import bcrypt from "bcryptjs";
import { prisma } from "../database/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // 1 día
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "CLIENT",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      profileCompleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
    },
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signUp(user: any) {
      // Hash de la contraseña antes de guardar
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }

      return user;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn(user: any) {
      // Verificar si el usuario está activo
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (dbUser && !dbUser.isActive) {
        throw new Error("Cuenta desactivada. Contacta al administrador.");
      }

      return true;
    },
  },
  rateLimit: {
    window: 60, // 1 minuto
    max: 10, // Máximo 10 intentos por minuto
  },
  trustedOrigins: [process.env.NEXTAUTH_URL!, "http://localhost:3000"],
});
