import { useSession } from "next-auth/react";
import { User } from "@/shared/types";

export function useUserRole() {
  const { data: session, status } = useSession();

  const user = session?.user as User | null;

  return {
    user,
    status,
    isAuthenticated: !!session,
    isProfessional: user?.role === "PROFESSIONAL",
    isAdmin: user?.role === "ADMIN",
    isClient: user?.role === "CLIENT",
  };
}
