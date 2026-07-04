// Módulo: payments — orquestador de cobros. Habla SOLO con providers/payment
// (Mercado Pago, Stripe, PayPal) vía la interfaz PaymentProvider. Webhooks
// firmados e idempotentes; el pedido se confirma solo por webhook verificado,
// nunca por redirect. Reembolsos vía API del proveedor. (F1)
export {};
