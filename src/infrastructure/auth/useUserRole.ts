"use client";

import { useSession } from "next-auth/react";
import { User } from "@/shared/types";
import { useEffect, useState } from "react";

export function useUserRole() {
  const { data: session, status } = useSession();
  const [fallbackUser, setFallbackUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("user");
      if (stored) {
        setFallbackUser(JSON.parse(stored) as User);
      }
    } catch (err) {
      console.error("useUserRole: error reading local user", err);
    }
  }, []);

  const user = (session?.user as User | null) || fallbackUser;
  const effectiveStatus = session ? status : fallbackUser ? "authenticated" : status;

  return {
    user,
    status: effectiveStatus,
    isAuthenticated: !!(session || fallbackUser),
    isProfessional: user?.role === "PROFESSIONAL",
    isAdmin: user?.role === "ADMIN",
    isClient: user?.role === "CLIENT",
  };
}
