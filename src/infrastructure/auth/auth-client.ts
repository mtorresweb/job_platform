"use client";

import { User, UserRole } from "@/shared/types";
import { createAuthClient } from "better-auth/client";

// Type definitions
export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface SignInInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Create the auth client instance
const authClientInstance = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  options: {
    signUp: {
      extraFields: ["name", "role"],
    },
  },
  onLogin: async (session: { accessToken: string; user: User }) => {
    if (typeof window === "undefined") return;

    const hasLocalStorage =
      typeof window.localStorage === "object" &&
      typeof window.localStorage.setItem === "function";

    if (session?.accessToken && hasLocalStorage) {
      window.localStorage.setItem("auth-token", session.accessToken);
      window.localStorage.setItem("user", JSON.stringify(session.user));
    }
  },
  onLogout: async () => {
    if (typeof window !== "undefined") {
      const hasLocalStorage =
        typeof window.localStorage === "object" &&
        typeof window.localStorage.removeItem === "function";

      if (hasLocalStorage) {
        window.localStorage.removeItem("auth-token");
        window.localStorage.removeItem("user");
      }

      window.location.href = "/";
    }
  },
});

// Export auth methods
export const { useSession, signIn, signUp, signOut } = authClientInstance;

// Re-export the useUserRole hook
export { useUserRole } from "./useUserRole";
