/**
 * Contrato ShippingProvider (SkydropX / Envia.com). Cotiza comparando
 * Estafeta/DHL/FedEx/Correos, genera guías y rastrea. Implementaciones:
 * skydropx.ts, envia.ts.
 */

export interface Address {
  name: string;
  street: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // "MX"
  phone?: string;
}

export interface Parcel {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface QuoteInput {
  from: Address;
  to: Address;
  parcel: Parcel;
}

export interface ShippingRate {
  carrier: string; // "estafeta" | "dhl" | "fedex" | "correos"
  service: string;
  amount: number;
  currency: string;
  estimatedDays: number;
  rateId: string;
}

export interface LabelInput {
  rateId: string;
  from: Address;
  to: Address;
  parcel: Parcel;
}

export interface Label {
  trackingNumber: string;
  labelUrl: string;
  carrier: string;
}

export interface TrackingStatus {
  status: string;
  history: { status: string; date: string; location?: string }[];
}

export interface ShippingProvider {
  readonly name: "skydropx" | "envia";
  quote(input: QuoteInput): Promise<ShippingRate[]>;
  createLabel(input: LabelInput): Promise<Label>;
  track(trackingNumber: string): Promise<TrackingStatus>;
}

export function getShippingProvider(): ShippingProvider {
  throw new Error("ShippingProvider no implementado todavía (F1).");
}
