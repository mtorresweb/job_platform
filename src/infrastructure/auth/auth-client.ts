"use client";

import { createAuthClient } from "better-auth/react";
import { User, UserRole } from "@/shared/types";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Hooks personalizados para auth
export const { useSession, signIn, signUp, signOut } = authClient;

// Type for better-auth user with our additional fields
interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role?: string;
}

// Hook personalizado para obtener el usuario actual
export function useCurrentUser(): User | null {
  const { data: session } = useSession();

  if (!session?.user) return null;

  // Map better-auth user to our User type
  const betterAuthUser = session.user as BetterAuthUser;
  return {
    id: betterAuthUser.id,
    email: betterAuthUser.email,
    name: betterAuthUser.name,
    role: (betterAuthUser.role as UserRole) || UserRole.CLIENT,
    isEmailVerified: betterAuthUser.emailVerified,
    createdAt: betterAuthUser.createdAt,
    updatedAt: betterAuthUser.updatedAt,
    avatar: betterAuthUser.image || undefined,
  } as User;
}

// Hook para verificar roles
export function useUserRole() {
  const user = useCurrentUser();

  return {
    user,
    isClient: user?.role === UserRole.CLIENT,
    isProfessional: user?.role === UserRole.PROFESSIONAL,
    isAdmin: user?.role === UserRole.ADMIN,
    isAuthenticated: !!user,
  };
}
