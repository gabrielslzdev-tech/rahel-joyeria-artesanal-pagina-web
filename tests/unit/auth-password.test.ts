import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("el hash no es la contraseña en claro y verifica correcto", async () => {
    const hash = await hashPassword("supersecreta");
    expect(hash).not.toBe("supersecreta");
    expect(await verifyPassword("supersecreta", hash)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("supersecreta");
    expect(await verifyPassword("incorrecta", hash)).toBe(false);
  });
});
