import type { Locale } from "@/lib/i18n/routing";

/**
 * Formatea un importe para mostrar. El modelo de datos está preparado para
 * multimoneda; por defecto MXN (sección 1).
 *
 * IMPORTANTE: esto es SOLO presentación. Los cálculos de dinero (precios,
 * personalización, cupones, envío, puntos) se hacen y validan en el SERVIDOR
 * con enteros/decimales exactos — nunca con floats de presentación
 * (secciones 4, 17.2).
 */
export function formatMoney(
  amount: number,
  { locale = "es", currency = "MXN" }: { locale?: Locale; currency?: string } = {},
): string {
  const intlLocale = locale === "es" ? "es-MX" : "en-US";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
  }).format(amount);
}
