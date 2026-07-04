// Helpers del patrón outbox (tabla `domain_events`). Se implementan cuando el
// schema exista (0.2+). Los efectos secundarios (emails, puntos, producción,
// comisiones) NO se disparan inline: se escribe un evento y un worker/cron lo
// procesa de forma idempotente y reintentable (sección 3.2).
//
// Eventos: order.paid, order.shipped, production.status_changed, cart.abandoned
export {};
