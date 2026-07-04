"use server";

import { registerFormSchema } from "@/lib/auth/schemas";
import { registerUser } from "@/lib/auth/register";

export type RegisterState = {
  status: "idle" | "success" | "error";
  error?: "INVALID" | "EMAIL_TAKEN" | "GENERIC";
};

/**
 * Server Action de registro. Valida con Zod en servidor (incluida la
 * confirmación) y delega en registerUser (hash + creación de User/Customer).
 */
export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { status: "error", error: "INVALID" };

  try {
    const res = await registerUser(parsed.data);
    if (!res.ok) {
      return { status: "error", error: res.error === "EMAIL_TAKEN" ? "EMAIL_TAKEN" : "INVALID" };
    }
    return { status: "success" };
  } catch {
    return { status: "error", error: "GENERIC" };
  }
}
