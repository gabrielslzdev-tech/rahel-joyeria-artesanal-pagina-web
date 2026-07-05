import { describe, expect, it } from "vitest";
import { availabilityLabel } from "@/modules/catalog/availability";
import type { Availability } from "@/modules/catalog/types";

const base: Availability = {
  productionType: "IN_STOCK",
  productionDays: 0,
  inStock: true,
  soldOut: false,
};

describe("availabilityLabel", () => {
  it("IN_STOCK con stock → envío inmediato", () => {
    expect(availabilityLabel({ ...base }).key).toBe("inStock");
  });

  it("IN_STOCK sin stock → agotado", () => {
    expect(availabilityLabel({ ...base, inStock: false, soldOut: true }).key).toBe("soldOut");
  });

  it("MADE_TO_ORDER → tiempo de fabricación visible", () => {
    const r = availabilityLabel({
      ...base,
      productionType: "MADE_TO_ORDER",
      productionDays: 7,
      inStock: false,
    });
    expect(r.key).toBe("madeToOrder");
    expect(r.days).toBe(7);
  });

  it("ONE_OF_A_KIND disponible vs vendida", () => {
    expect(availabilityLabel({ ...base, productionType: "ONE_OF_A_KIND" }).key).toBe("oneOfAKind");
    expect(
      availabilityLabel({
        ...base,
        productionType: "ONE_OF_A_KIND",
        inStock: false,
        soldOut: true,
      }).key,
    ).toBe("oneOfAKindSold");
  });
});
