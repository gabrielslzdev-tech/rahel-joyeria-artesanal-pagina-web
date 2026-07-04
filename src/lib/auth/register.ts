import { db } from "@/lib/db";
import { hashPassword } from "./password";
import { registerSchema, type RegisterInput } from "./schemas";

export type RegisterResult =
  | { ok: true; userId: string }
  | { ok: false; error: "INVALID" | "EMAIL_TAKEN" };

/**
 * Registro de un cliente nuevo. Valida con Zod, hashea la contraseña y crea
 * User (role CUSTOMER) + su perfil Customer en una sola operación.
 * El precio/rol/estado se deciden en servidor; el cliente nunca dicta el rol.
 */
export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "EMAIL_TAKEN" };

  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CUSTOMER",
      customer: {
        create: { email, firstName: name },
      },
    },
  });

  return { ok: true, userId: user.id };
}
