import type { NextAuthConfig } from "next-auth";
import type { AppRole } from "./roles";

/**
 * Config edge-safe de NextAuth (Auth.js v5).
 *
 * NO incluye adapter ni providers con dependencias de Node (bcrypt/Prisma):
 * este objeto lo consume el middleware (edge), que solo lee el JWT. La config
 * completa (adapter + Credentials) vive en `index.ts` y extiende ésta.
 *
 * Sesión por JWT: el `role` viaja en el token, sin consultar la DB por request.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Persistimos id y role en el token al iniciar sesión.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "CUSTOMER";
      }
      return token;
    },
    // Exponemos id y role en la sesión del lado del servidor/cliente.
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? "";
        session.user.role = (token.role as AppRole | undefined) ?? "CUSTOMER";
      }
      return session;
    },
  },
  providers: [], // se agregan en index.ts (Credentials; OAuth en el futuro)
} satisfies NextAuthConfig;
