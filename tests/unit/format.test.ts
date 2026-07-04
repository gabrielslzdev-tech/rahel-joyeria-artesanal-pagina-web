import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/utils/format";

describe("formatMoney", () => {
  it("formatea MXN por defecto en español", () => {
    // Usa NBSP entre símbolo y número según Intl es-MX.
    const result = formatMoney(1499.5);
    expect(result).toMatch(/1,499\.50/);
    expect(result).toContain("$");
  });

  it("formatea en inglés (en-US)", () => {
    const result = formatMoney(1499.5, { locale: "en" });
    expect(result).toMatch(/1,499\.50/);
  });

  it("respeta una moneda distinta (preparado para multimoneda)", () => {
    const result = formatMoney(20, { locale: "en", currency: "USD" });
    expect(result).toContain("$");
    expect(result).toMatch(/20\.00/);
  });
});
