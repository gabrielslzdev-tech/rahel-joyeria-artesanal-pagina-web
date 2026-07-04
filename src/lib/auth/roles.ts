// Lógica de roles — PURA y edge-safe (sin dependencias de Node/Prisma), para
// poder usarse en el middleware. Mantener en sync con el enum UserRole del
// schema.prisma (CUSTOMER | STAFF | ADMIN).

export type AppRole = "CUSTOMER" | "STAFF" | "ADMIN";

// Jerarquía: ADMIN ⊇ STAFF ⊇ CUSTOMER.
const RANK: Record<AppRole, number> = {
  CUSTOMER: 0,
  STAFF: 1,
  ADMIN: 2,
};

/** ¿`role` cumple al menos el nivel `required`? */
export function hasRole(role: AppRole, required: AppRole): boolean {
  return RANK[role] >= RANK[required];
}

/** Acceso al panel `/admin`: STAFF o ADMIN (sección 14). */
export function canAccessAdmin(role: AppRole | null | undefined): boolean {
  return role != null && hasRole(role, "STAFF");
}
