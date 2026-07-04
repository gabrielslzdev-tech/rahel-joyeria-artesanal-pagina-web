import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { authConfig } from "./config";
import { loginSchema } from "./schemas";
import { verifyPassword } from "./password";
import { AuthorizationError } from "./errors";
import { hasRole, type AppRole } from "./roles";

/**
 * Config COMPLETA de NextAuth (Auth.js v5) — se ejecuta en Node.
 * Extiende la config edge-safe con el adapter de Prisma y el provider de
 * credenciales (email + contraseña). Arquitectura lista para sumar OAuth.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // El adapter usa el tipo de @prisma/client; nuestro cliente es el generado
  // por el generador nuevo (estructuralmente compatible) → cast tipado.
  adapter: PrismaAdapter(db as unknown as Parameters<typeof PrismaAdapter>[0]),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as AppRole,
        };
      },
    }),
  ],
});

// ---------------------------------------------------------------------------
// Helpers de autorización — usar en SERVIDOR en cada acción sensible (17.4).
// Fallan cerrado: lanzan AuthorizationError si no se cumple.
// ---------------------------------------------------------------------------

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new AuthorizationError("UNAUTHENTICATED");
  return session;
}

export async function requireRole(required: AppRole) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role) throw new AuthorizationError("UNAUTHENTICATED");
  if (!hasRole(role, required)) throw new AuthorizationError("FORBIDDEN");
  return session;
}

/** Usuario actual o null (sin lanzar). */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
