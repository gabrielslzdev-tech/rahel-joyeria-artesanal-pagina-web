/**
 * Contrato InvoiceProvider — CFDI 4.0 (SAT) vía PAC (Facturama / SW Sapien).
 * Implementaciones: facturama.ts, swsapien.ts.
 */

export interface FiscalData {
  rfc: string;
  legalName: string; // razón social
  taxRegime: string; // régimen fiscal
  cfdiUse: string; // uso de CFDI
  postalCode: string; // C.P. fiscal
  email?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number; // sin IVA
  productCode: string; // clave SAT
  unitCode: string; // clave unidad SAT
}

export interface IssueInvoiceInput {
  orderId: string;
  fiscal: FiscalData;
  items: InvoiceItem[];
  currency: string;
}

export interface Invoice {
  uuid: string; // folio fiscal
  xmlUrl: string;
  pdfUrl: string;
  status: "issued" | "cancelled";
}

export interface InvoiceProvider {
  readonly name: "facturama" | "swsapien";
  issue(input: IssueInvoiceInput): Promise<Invoice>;
  get(uuid: string): Promise<Invoice>;
  cancel(uuid: string, reason: string): Promise<void>;
}

export function getInvoiceProvider(): InvoiceProvider {
  throw new Error("InvoiceProvider no implementado todavía (F1).");
}
