import { requireRole } from "@/lib/auth";

export default async function AdminHomePage() {
  // Defensa en profundidad: además del middleware, verificamos el rol en
  // SERVIDOR (sección 17.4). Solo STAFF o ADMIN llegan aquí.
  const session = await requireRole("STAFF");

  // Placeholder. El dashboard (ventas, pedidos, inventario, producción, BI)
  // se construye en Fase 1.
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-2 text-neutral-600">
        Panel interno — pendiente (F1). Sesión: {session.user.email} ({session.user.role}).
      </p>
    </main>
  );
}
