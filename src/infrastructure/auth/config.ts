import { type DefaultSession, type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User, UserRole } from "@/shared/types";

// Extend the token type
declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role?: UserRole;
    professional?: DbAuthUser["professional"];
  }
}

// Extend the session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      professional?: DbAuthUser["professional"];
    } & DefaultSession["user"];
  }
}

interface DbAuthUser extends Omit<User, "professional"> {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profileCompleted: boolean;
  professional?: {
    id: string;
    bio?: string;
    experience: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    specialties: string[];
    address?: string;
    city?: string;
    state?: string;
    country: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
  } | null;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "ejemplo@email.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            professional: true,
          },
        });

        if (!user) {
          return null;
        }

        if (!user.isActive) {
          throw new Error("Tu cuenta está inactiva. Contacta a un administrador.");
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!passwordsMatch) {
          return null;
        }

        // Remove sensitive data and map to session format
        const { password: _, ...safeUser } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
        return safeUser;
      },
    }),
  ],
  callbacks: {
      async session({ session, token }) {
        if (!token?.sub || !session.user) return session;

        // Refresh user activity on every session fetch
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, role: true, isActive: true, professional: true },
        });

        if (!dbUser || !dbUser.isActive) {
          return null;
        }

        return {
          ...session,
          user: {
            ...session.user,
            id: dbUser.id,
            role: dbUser.role,
            professional: dbUser.professional
              ? {
                  ...dbUser.professional,
                  specialties: dbUser.professional.specialties ?? [],
                  country: dbUser.professional.country ?? "Colombia",
                }
              : null,
          },
        };
      },
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as DbAuthUser;
        token.sub = authUser.id;
        token.role = authUser.role;
        if (authUser.professional) {
          token.professional = {
            ...authUser.professional,
            bio: authUser.professional.bio ?? "",
            specialties: authUser.professional.specialties ?? [],
            country: authUser.professional.country ?? "Colombia",
            experience: authUser.professional.experience ?? 0,
            rating: authUser.professional.rating ?? 0,
            reviewCount: authUser.professional.reviewCount ?? 0,
            isVerified: authUser.professional.isVerified ?? false,
          };
        }
        token.isActive = authUser.isActive;
      } else if (token?.sub) {
        // Keep token in sync for subsequent calls
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isActive: true, role: true },
        });
        if (dbUser) {
          token.isActive = dbUser.isActive;
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
} as NextAuthOptions;

export const authConfig = authOptions;
