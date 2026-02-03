import { useSession } from "next-auth/react";
import { type UserRole } from "@/shared/types";

export function useUserRole() {
  const { data: session } = useSession();
  const user = session?.user;

  // Check if user exists and has a role
  if (!user) {
    return { user: null, role: null as UserRole | null, isProfessional: false };
  }

  const role = user.role as UserRole;
  const isProfessional = role === "PROFESSIONAL";

  return {
    user,
    role,
    isProfessional,
  };
}
