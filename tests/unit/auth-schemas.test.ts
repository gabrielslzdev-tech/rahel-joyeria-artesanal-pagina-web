import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, registerFormSchema } from "@/lib/auth/schemas";

describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
  it("rechaza email inválido", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("acepta datos válidos", () => {
    const r = registerSchema.safeParse({
      name: "Ana",
      email: "ana@rahel.mx",
      password: "supersecreta",
    });
    expect(r.success).toBe(true);
  });

  it("rechaza contraseña corta (<8)", () => {
    const r = registerSchema.safeParse({ name: "Ana", email: "a@b.com", password: "123" });
    expect(r.success).toBe(false);
  });

  it("rechaza contraseña >72 (límite bcrypt)", () => {
    const r = registerSchema.safeParse({
      name: "Ana",
      email: "a@b.com",
      password: "x".repeat(73),
    });
    expect(r.success).toBe(false);
  });
});

describe("registerFormSchema", () => {
  it("rechaza cuando las contraseñas no coinciden", () => {
    const r = registerFormSchema.safeParse({
      name: "Ana",
      email: "a@b.com",
      password: "supersecreta",
      confirmPassword: "otra",
    });
    expect(r.success).toBe(false);
  });

  it("acepta cuando coinciden", () => {
    const r = registerFormSchema.safeParse({
      name: "Ana",
      email: "a@b.com",
      password: "supersecreta",
      confirmPassword: "supersecreta",
    });
    expect(r.success).toBe(true);
  });
});
