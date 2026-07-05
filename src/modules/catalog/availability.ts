import type { Availability } from "./types";

/**
 * Devuelve la clave i18n y los valores para la etiqueta de disponibilidad/tiempo.
 * Los tiempos SIEMPRE deben ser visibles (CLAUDE.md §4): lo bajo pedido nunca
 * debe parecer inmediato.
 *
 * Se combina con el namespace "catalog.availability" en messages/.
 */
export function availabilityLabel(a: Availability): {
  key:
    | "inStock"
    | "soldOut"
    | "madeToOrder"
    | "oneOfAKind"
    | "oneOfAKindSold";
  days: number;
} {
  if (a.productionType === "ONE_OF_A_KIND") {
    return { key: a.soldOut ? "oneOfAKindSold" : "oneOfAKind", days: 0 };
  }
  if (a.productionType === "MADE_TO_ORDER") {
    return { key: "madeToOrder", days: a.productionDays };
  }
  // IN_STOCK
  return { key: a.soldOut ? "soldOut" : "inStock", days: a.productionDays };
}
