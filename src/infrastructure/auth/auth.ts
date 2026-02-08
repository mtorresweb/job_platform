import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import bcrypt from "bcryptjs";
import { prisma } from "../database/prisma";

const smtpFrom = process.env.SMTP_FROM;
if (!smtpFrom) {
  throw new Error("SMTP_FROM no configurado");
}

type UserRole = "CLIENT" | "PROFESSIONAL" | "ADMIN";

type SignUpData = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
};

type SignInData = {
  email: string;
  password: string;
};

type AuthResponse = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  profileCompleted: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: smtpFrom,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
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
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  callbacks: {
    async signUp({
      email,
      password,
      name,
      role,
    }: SignUpData): Promise<{ id: string }> {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new Error("Ya existe un usuario con este correo electrónico");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            role: role || "CLIENT",
            profileCompleted: false,
            isActive: true,
            isEmailVerified: false,
            acceptedTermsAt: new Date(),
            acceptedPrivacyAt: new Date(),
          },
        });

        // Create the credentials account using a raw SQL query
        await prisma.$executeRaw`
          INSERT INTO accounts ("userId", type, provider, "providerAccountId")
          VALUES (${user.id}, 'credentials', 'credentials', ${email})
        `;

        // If professional role, create professional profile
        if (role === "PROFESSIONAL") {
          await prisma.professional.create({
            data: {
              userId: user.id,
              specialties: [],
            },
          });
        }

        return { id: user.id };
      } catch (error) {
        console.error("Error in signUp callback:", error);
        throw error;
      }
    },
    async signIn({ email, password }: SignInData): Promise<AuthResponse> {
      try {
        // Find user
        console.log("Attempting signIn for:", { email });
        console.log(
          "Password received:",
          typeof password === "string" ? "string" : typeof password,
        );
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            profileCompleted: true,
            isActive: true,
            isEmailVerified: true,
          },
        });

        if (!user) {
          const error = new Error("Credenciales inválidas");
          (error as Error & { code?: string }).code = "INVALID_CREDENTIALS";
          throw error;
        }

        // Check if user is active
        if (!user.isActive) {
          const error = new Error("Tu cuenta está inactiva. Contacta a un administrador.");
          (error as Error & { code?: string }).code = "ACCOUNT_INACTIVE";
          throw error;
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          const error = new Error("Credenciales inválidas");
          (error as Error & { code?: string }).code = "INVALID_CREDENTIALS";
          throw error;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          role: user.role as UserRole,
          name: user.name,
          email: user.email,
          profileCompleted: user.profileCompleted,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
        };
      } catch (error) {
        console.error("Error in signIn callback:", error);
        throw error;
      }
    },
    async beforeSignUp(user: {
      password: string;
    }): Promise<{ password: string }> {
      user.password = String(user.password);
      user.password = await bcrypt.hash(user.password, 12);
      return user;
    },
  },
  rateLimiting: {
    enabled: true,
    max: 10, // Maximum 10 attempts per minute
  },
});

export default auth;
