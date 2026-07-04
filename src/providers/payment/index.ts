/**
 * Contrato PaymentProvider. Los módulos (payments) hablan SOLO contra esta
 * interfaz; cambiar de pasarela no debe tocar el resto del sistema (regla de
 * oro, sección 3.1). Implementaciones: mercadopago.ts, stripe.ts, paypal.ts.
 */

export type Money = { amount: number; currency: string };

export interface CreateCheckoutInput {
  orderId: string;
  amount: Money;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface CheckoutSession {
  providerRef: string;
  redirectUrl: string;
}

export interface VerifiedWebhookEvent {
  id: string; // event_id para idempotencia (sección 7)
  type: string;
  orderRef: string;
  raw: unknown;
}

export interface RefundInput {
  providerRef: string;
  amount?: Money; // parcial o total
  reason?: string;
}

export interface PaymentProvider {
  readonly name: "mercadopago" | "stripe" | "paypal";
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession>;
  /** Verifica firma del webhook. Lanza si es inválida (sección 7). */
  verifyWebhook(rawBody: string, signature: string): Promise<VerifiedWebhookEvent>;
  refund(input: RefundInput): Promise<{ refundRef: string }>;
}

/** Selector por proveedor. Implementaciones en F1. */
export function getPaymentProvider(_name: PaymentProvider["name"]): PaymentProvider {
  throw new Error("PaymentProvider no implementado todavía (F1).");
}
