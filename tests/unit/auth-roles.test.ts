import { describe, expect, it } from "vitest";
import { hasRole, canAccessAdmin } from "@/lib/auth/roles";

describe("roles", () => {
  it("ADMIN cumple cualquier nivel", () => {
    expect(hasRole("ADMIN", "CUSTOMER")).toBe(true);
    expect(hasRole("ADMIN", "STAFF")).toBe(true);
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
  });

  it("STAFF no alcanza ADMIN", () => {
    expect(hasRole("STAFF", "STAFF")).toBe(true);
    expect(hasRole("STAFF", "ADMIN")).toBe(false);
  });

  it("CUSTOMER solo cumple CUSTOMER", () => {
    expect(hasRole("CUSTOMER", "CUSTOMER")).toBe(true);
    expect(hasRole("CUSTOMER", "STAFF")).toBe(false);
  });

  it("canAccessAdmin: STAFF y ADMIN sí; CUSTOMER y nulos no", () => {
    expect(canAccessAdmin("STAFF")).toBe(true);
    expect(canAccessAdmin("ADMIN")).toBe(true);
    expect(canAccessAdmin("CUSTOMER")).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
    expect(canAccessAdmin(undefined)).toBe(false);
  });
});
