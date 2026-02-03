import "next-auth";
import { type UserRole } from "./user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      professional?: {
        id: string;
        bio?: string;
        experience: number;
        rating: number;
        reviewCount: number;
        isVerified: boolean;
      } | null;
    };
  }
}
