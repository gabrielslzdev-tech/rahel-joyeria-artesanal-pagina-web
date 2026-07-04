import type { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/auth/roles";

// Extiende los tipos de NextAuth para incluir id y role en sesión, usuario y JWT.
declare module "next-auth" {
  interface User {
    role?: AppRole;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
  }
}
