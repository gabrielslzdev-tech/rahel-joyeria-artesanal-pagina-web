# CLAUDE.md — Creaciones Rahel (v2)
# Plataforma de Joyería Artesanal — Documento Maestro para Claude Code

> **Cómo usar:** guarda este archivo como `CLAUDE.md` en la raíz del repositorio.
> Claude Code lo lee en cada sesión. Se construye **un módulo a la vez** siguiendo el
> ORDEN DE CONSTRUCCIÓN al final. Todo el alcance está contemplado en la arquitectura;
> nada se elimina, solo se secuencia.

---

## 1. Contexto del negocio

Creaciones Rahel: joyería artesanal personalizada, hoy operando presencialmente en un
mercado de Tecate, B.C. Objetivo: vender en toda la República Mexicana, con expansión
futura a EE.UU. La plataforma es a la vez: tienda online, administración del negocio,
sistema de producción artesanal con trazabilidad, marketing/fidelización e inteligencia
de negocio.

- **Idiomas:** Español (default) e Inglés, desde el día uno.
- **Moneda:** MXN (modelo de datos preparado para multimoneda).
- **Envíos:** a toda la República desde el primer día.
- **Narrativa de marca:** el origen artesanal de Baja California/Tecate ES parte del
  producto. La historia del artesano y el proceso hecho a mano se muestran en todo el sitio.

---

## 2. Stack técnico (fijo)

- **Framework:** Next.js (App Router) + TypeScript + TailwindCSS
- **Backend:** Route Handlers / Server Actions de Next.js (Node.js + TS)
- **DB:** PostgreSQL + **Prisma**
- **Auth:** NextAuth (roles: `CUSTOMER`, `STAFF`, `ADMIN`)
- **Pagos:** Mercado Pago (tarjetas, OXXO, meses sin intereses) + Stripe (Apple/Google
  Pay incluidos) + PayPal
- **Envíos:** SkydropX o Envia.com (cotización, guías, rastreo)
- **Correos:** Resend
- **Medios:** Cloudflare R2 (imágenes/video) con CDN
- **Validación:** Zod en TODA entrada (formularios, API, webhooks)
- **Analítica:** GA4 + Meta Pixel
- **Monitoreo de errores:** Sentry
- **Hosting:** Vercel (preview + producción) + Postgres gestionado (Neon/Supabase)

---

## 3. Arquitectura (limpia y modular)

### 3.1 Estructura de carpetas

```
src/
  app/                      # rutas Next.js (App Router)
    (store)/                # tienda pública
    (account)/              # perfil del cliente
    admin/                  # panel interno (protegido por rol)
    api/                    # route handlers (webhooks, API)
  modules/                  # LÓGICA DE NEGOCIO — un módulo por dominio
    catalog/                # productos, variantes, categorías, medios
    customization/          # opciones de personalización y precios
    cart/
    checkout/
    orders/                 # estado comercial del pedido
    production/             # estado artesanal / trazabilidad
    inventory/              # productos terminados + materiales
    customers/
    loyalty/                # puntos y recompensas (F2)
    affiliates/             # (F2)
    payments/               # orquestador + proveedores
    shipping/
    billing/                # CFDI / SAT
    marketing/              # emails, segmentos, carrito abandonado
    content/                # CMS de marca, blog
    analytics/              # BI interno
  lib/                      # utilidades compartidas (i18n, auth, db, events)
  providers/                # INTEGRACIONES EXTERNAS detrás de interfaces
    payment/    → interface PaymentProvider   (mercadopago.ts, stripe.ts, paypal.ts)
    shipping/   → interface ShippingProvider  (skydropx.ts | envia.ts)
    invoicing/  → interface InvoiceProvider   (facturama.ts | swsapien.ts)
    email/      → interface EmailProvider     (resend.ts)
    storage/    → interface StorageProvider   (r2.ts)
prisma/
  schema.prisma
messages/                   # i18n: es.json, en.json (nada hardcodeado)
tests/
```

**Regla de oro:** `app/` no contiene lógica de negocio; solo llama a `modules/`.
Los `modules/` nunca llaman APIs externas directamente; solo a través de `providers/`.
Así cualquier proveedor (PAC, paquetería, pasarela) se cambia sin tocar el resto.

### 3.2 Eventos de dominio (patrón outbox)

Los efectos secundarios NO se disparan inline. Cada acción importante escribe un evento
en una tabla `domain_events` (outbox) y un worker/cron los procesa:

- `order.paid` → crear registro de producción, descontar inventario, email de
  confirmación, acumular puntos (F2), comisión de afiliado (F2)
- `order.shipped` → email con guía y rastreo
- `production.status_changed` → notificación interna
- `cart.abandoned` → email de recuperación (F2)

Beneficios: nada se pierde si falla un email, todo es auditable y reintentable.

### 3.3 Doble máquina de estados (separadas)

- **Pedido (comercial):** `PENDING_PAYMENT → PAID → IN_PRODUCTION → READY_TO_SHIP →
  SHIPPED → DELIVERED | CANCELLED | REFUND_REQUESTED → REFUNDED`
- **Producción (artesanal):** `PENDING → IN_PRODUCTION → PERSONALIZATION → QUALITY_CHECK
  → FINISHED → PACKED → SHIPPED → DELIVERED`

Transiciones validadas en código (no cambios libres de estado) y registradas en un
historial con fecha, usuario y nota → trazabilidad completa por pieza.

---

## 4. Modelo de negocio y datos clave

**Productos:** pulseras, collares, aretes, anillos, tobilleras, tiaras (novia / XV años),
primera comunión, bautizos.
**Materiales:** plata, acero inoxidable, piedras naturales, cristales, cuarzos, piedras
semipreciosas, bisutería fina, combinaciones.

**Tipo de producción** (enum en producto):
- `IN_STOCK` — envío inmediato.
- `MADE_TO_ORDER` — se fabrica al recibir la orden; muestra tiempo de fabricación.
- `ONE_OF_A_KIND` — pieza única. **Crítico:** al iniciar checkout se crea una **reserva
  de stock con expiración (ej. 20 min)** usando transacción con bloqueo
  (`SELECT ... FOR UPDATE`), para que dos personas no compren la misma pieza. Al venderse
  se retira sola del catálogo.

**Tiempos visibles (obligatorio):** cada producto muestra "Listo para enviar en X días" +
tiempo de paquetería, en ficha, carrito y checkout. Lo bajo pedido nunca debe parecer
inmediato.

**Personalización:** nombre grabado, iniciales, fechas, mensajes, selección de
piedra/cristal/cuarzo/material. Cada opción puede modificar precio y tiempo de
producción. **El precio SIEMPRE se recalcula en el servidor** — jamás se confía en el
precio que manda el cliente. Piezas personalizadas se marcan `nonReturnable = true` y
requieren checkbox de aceptación antes de pagar. *(F3: configurador visual.)*

**Categorías:** Bodas, Espiritual, Minimalista, Bohemia, Masculina, Infantil, Bautizos,
Primera comunión, XV años, Regalos, Colecciones especiales.
**Filtros:** precio, material, piedra, color, colección, disponibilidad, personalizable,
más vendidos, nuevos.

---

## 5. Medios y contenido de producto — PRIORIDAD ALTA

En joyería online, la imagen ES el producto:
- Galería múltiple por producto + **foto de escala obligatoria** (pieza puesta en
  muñeca/cuello real).
- Video por producto y video del **proceso artesanal** ("Detrás de la pieza").
- Foto 360° (soporte en el modelo desde el inicio; producir el contenido puede esperar).
- Certificado de autenticidad por pieza (PDF descargable, servido con URL firmada).
- Optimización automática: `next/image`, formatos modernos, lazy loading. Subidas al
  admin validadas (solo imagen/video, límite de tamaño, nombres regenerados).

---

## 6. Tienda

**Home:** diseño elegante y emocional (ver `DESIGN_BRIEF.md`), historia de marca y del
proceso artesanal, destacados, más vendidos, colecciones, testimonios, WhatsApp.

**Carrito:** agregar/modificar, cupones, guardar carrito (persistente por usuario y por
cookie para invitados).

**Checkout:** invitado o con cuenta, validación con Zod, resumen claro con tiempos de
producción + envío, checkbox de no-devolución para personalizados.

**Señales de confianza (transversales):** compra segura, reseñas verificadas, garantía
visible, badges de métodos de pago, certificados, política de devolución clara.

**WhatsApp como canal de venta:** botón flotante con mensaje precargado por producto
("Hola, me interesa [pieza]…"). Arquitectura preparada para catálogo de WhatsApp Business
y notificaciones de pedido vía API (fase posterior).

---

## 7. Pagos

- Mercado Pago (tarjetas, OXXO, **meses sin intereses**), Stripe (incluye Apple Pay y
  Google Pay), PayPal.
- **Nunca tocar datos de tarjeta:** solo checkout hospedado / elements de cada proveedor
  (cumplimiento PCI del lado del proveedor).
- **Webhooks con verificación de firma obligatoria** y manejo **idempotente** (guardar
  `event_id` procesados; un evento duplicado no debe duplicar un pedido ni puntos).
- El pedido se confirma SOLO por webhook verificado, nunca por redirect del navegador.
- Reembolsos desde el admin vía API del proveedor, ligados al flujo de devoluciones.

---

## 8. Envíos

- Cotización automática comparando Estafeta, DHL, FedEx y Correos vía SkydropX/Envia;
  se preselecciona la más económica (el cliente puede elegir otra).
- Generación de guías desde el admin, rastreo visible para el cliente, correos
  automáticos de seguimiento.
- Envío gratis configurable: monto mínimo y promociones.

---

## 9. Facturación CFDI 4.0 (SAT) — obligatorio legal

- Integrar un PAC vía API (Facturama, SW Sapien o similar) detrás de `InvoiceProvider`.
- En checkout: opción "Solicitar factura" → RFC, razón social, régimen fiscal, uso de
  CFDI, C.P. fiscal (validados con Zod).
- IVA manejado correctamente en precios y reportes.
- Admin: emitir, consultar, cancelar facturas; descargar XML + PDF; reporte exportable
  para el contador.
- ⚠️ Requiere trámites externos: RFC/situación fiscal en orden y contrato con el PAC.

---

## 10. Legal y devoluciones (PROFECO)

- Política de devoluciones publicada y aplicada (venta online en México).
- Personalizados = no retornables, con aceptación explícita.
- Flujo de solicitud de devolución/reembolso en el perfil del cliente + gestión en admin
  (ligado a estados `REFUND_REQUESTED/REFUNDED` y al proveedor de pago).
- Páginas legales bilingües: Términos, Aviso de privacidad (LFPDPPP), Cookies, Envíos y
  devoluciones. Banner de cookies con lo mínimo preseleccionado.

---

## 11. Tráfico y adquisición (la tienda sin tráfico vende cero)

- **SEO técnico:** sitemap, Schema.org (Product, Offer, Review, Breadcrumb), URLs limpias
  bilingües (`/es/…`, `/en/…` con hreflang), metas y Open Graph por producto, Core Web
  Vitals cuidados.
- **GA4 + Meta Pixel** con eventos de e-commerce completos (`view_item`, `add_to_cart`,
  `begin_checkout`, `purchase`).
- **Feed de productos** exportable para Meta/Google Shopping.
- **Captura de leads:** suscripción a newsletter con incentivo.
- **UTMs guardados por pedido** para medir ROI por campaña.

---

## 12. Clientes y fidelización

**Perfil:** historial, direcciones, favoritos, lista de deseos, puntos, recompensas.
**Métricas por cliente:** frecuencia, LTV, ticket promedio.

**(F2) Programa de puntos:** compras, referidos, cumpleaños, promociones → canje por
descuentos, regalos, envío gratis. Toda acumulación/canje pasa por el ledger de puntos
(tabla inmutable de movimientos, nunca un simple contador editable).

**(F2) Afiliados:** influencers/embajadores con código propio, comisión por venta,
dashboard, gestión de pagos de comisiones.

---

## 13. Marketing automatizado (Resend)

Transaccionales (F1): bienvenida, confirmación de pedido, enviado, entregado.
(F2): carrito abandonado, cumpleaños, promociones, recompra; segmentos: nuevos,
frecuentes, VIP, inactivos. Todos disparados por eventos del outbox.

---

## 14. Panel de administración

- **Roles y permisos (nuevo):** `ADMIN` (todo), `STAFF` (pedidos, producción, inventario;
  sin configuración ni finanzas). Middleware protege todo `/admin` por rol.
- **Audit log (nuevo):** toda acción sensible en admin (cambiar precio, cancelar pedido,
  emitir factura, reembolsar) queda registrada: quién, qué, cuándo.
- **Dashboard:** ventas día/semana/mes/año, utilidad, pedidos pendientes, top productos.
- **Inventario:** productos terminados (existencias en tiempo real, alertas de stock
  bajo) + materiales (plata, acero, piedras, cristales, cuarzos, insumos) con alertas de
  reposición.
- **Producción:** tablero por estados con historial completo por pieza.
- **Pedidos:** gestión completa de estados, guías, facturas, reembolsos.
- **BI:** producto más vendido y más rentable, colección más rentable, ticket promedio,
  cliente de mayor valor, tasa de recompra, conversión, ROI por campaña.

---

## 15. IA (Fase 3)

- Generador de contenido: descripciones, meta títulos/descripciones, etiquetas SEO
  (API de Anthropic).
- Recomendador: relacionados, complementarios, por comportamiento.
- Predicción: reabastecimiento y tendencias.

## 16. CMS de marca

Historia de Creaciones Rahel, proceso artesanal, blog, cuidado de piezas, significado de
piedras y cuarzos, certificados. Editable desde admin, bilingüe.

---

## 17. SEGURIDAD (checklist obligatorio)

1. **Validación:** Zod en toda entrada (forms, API, webhooks, admin). Nada llega crudo a
   la DB.
2. **Precios e inventario solo en servidor:** el cliente nunca dicta precios, totales,
   descuentos ni stock.
3. **Auth:** NextAuth con cookies seguras (httpOnly, sameSite), sesiones con expiración,
   rate limiting en login/registro/checkout (p. ej. Upstash Ratelimit).
4. **Autorización:** verificación de rol en servidor en CADA acción de admin (no solo
   ocultar botones).
5. **Pagos:** solo checkouts hospedados, webhooks firmados e idempotentes, jamás
   almacenar datos de tarjeta.
6. **XSS:** sanitizar todo texto libre del usuario (reseñas, mensajes de grabado) antes
   de renderizar; nunca `dangerouslySetInnerHTML` con contenido de usuario.
7. **SQLi:** solo Prisma (consultas parametrizadas); prohibido concatenar SQL.
8. **Subida de archivos:** validar tipo real y tamaño, regenerar nombre, servir desde R2;
   certificados con URLs firmadas con expiración.
9. **Secretos:** solo variables de entorno; `.env` en `.gitignore`; `.env.example`
   documentado; llaves distintas en preview y producción.
10. **Headers:** CSP, HSTS, X-Frame-Options, Referrer-Policy vía middleware.
11. **Privacidad:** datos fiscales y personales solo visibles a `ADMIN`; cumplimiento del
    aviso de privacidad; derecho de eliminación de cuenta.
12. **Dependencias:** `npm audit` en CI; lockfile commiteado.

---

## 18. CALIDAD Y REVISIÓN DE ERRORES

**Pruebas automatizadas (mínimo):**
- Unitarias en lógica de dinero: cálculo de precios con personalización, cupones,
  envío gratis, puntos (F2), comisiones (F2).
- Idempotencia de webhooks (mismo evento dos veces = un solo efecto).
- Reserva de stock de piezas únicas bajo concurrencia.
- Transiciones de las dos máquinas de estados (las inválidas deben fallar).
- E2E con Playwright del flujo crítico: catálogo → carrito → checkout → pago (sandbox)
  → confirmación.

**Checklist antes de cada deploy a producción:**
- [ ] Lint + typecheck + tests en verde (CI de GitHub Actions)
- [ ] Flujo de compra probado en sandbox de cada pasarela activa
- [ ] Revisión visual móvil (la mayoría del tráfico será móvil)
- [ ] i18n: sin llaves faltantes ES/EN
- [ ] Lighthouse ≥ 90 en performance/SEO en home y ficha de producto
- [ ] Sentry sin errores nuevos sin resolver

**Operación:**
- Sentry para errores en producción; alertas.
- Backups automáticos diarios de Postgres (el proveedor gestionado los da; verificar
  restauración una vez).
- Entornos: preview (Vercel, por PR) y producción; nunca probar en producción.
- Uptime monitor sencillo (p. ej. Better Stack / UptimeRobot).

---

## 19. Cambios v1 → v2 (qué agregué / ajusté y por qué)

**Agregado (no estaba y era necesario):**
- Roles y permisos en admin + audit log (sin esto, cualquier empleado podría cambiar
  precios o borrar pedidos sin rastro).
- Reserva de stock con bloqueo para piezas únicas (evita vender dos veces la misma pieza).
- Patrón outbox para eventos (emails/puntos/producción confiables y auditables).
- Interfaces de proveedor (`providers/`) para poder cambiar PAC/paquetería/pasarela.
- Secciones completas de Seguridad, Calidad/QA y Operación (Sentry, backups, staging).
- Recalculo de precios 100% en servidor + idempotencia de webhooks.

**Nada se eliminó.** Solo dos ajustes de secuencia:
- Foto 360°: el soporte queda en el modelo desde F1, pero producir ese contenido es caro;
  puede activarse cuando haya equipo para generarlo.
- PayPal puede entrar unas semanas después de Mercado Pago + Stripe (estos dos cubren
  ~95% del mercado mexicano, incluido OXXO y MSI) — pero queda en F1 si lo quieres desde
  el día uno.

---

## 20. ORDEN DE CONSTRUCCIÓN

Trabajamos **un bloque a la vez**. Antes de cada módulo: proponer plan + modelo de datos,
esperar visto bueno, implementar con pruebas, revisar.

**Paso 0 — Fundación**
1. Proyecto Next.js + TS + Tailwind, estructura de carpetas de la sección 3, i18n ES/EN,
   ESLint/Prettier, `.env.example`, CI básico (lint + test).
2. Prisma + Postgres: **esquema completo** contemplando todo el alcance (productos,
   variantes, personalización, tipos de producción, reservas de stock, pedidos con ambas
   máquinas de estados e historial, clientes, direcciones, inventario de productos y
   materiales, ledger de puntos, afiliados, datos fiscales/facturas, domain_events,
   audit_log, campos de moneda/región). **Revisar el esquema conmigo antes de migrar.**
3. Auth con roles + protección de `/admin`.

**Fase 1 — MVP vendible**
Catálogo y fichas (galería, escala, video, tiempos visibles) → carrito → checkout
(invitado/cuenta, personalización con recálculo en servidor) → pagos (Mercado Pago +
Stripe, webhooks idempotentes) → envíos (cotización + guía + rastreo) → CFDI → legal/
PROFECO + cookies → señales de confianza → SEO + GA4 + Pixel + feed de productos →
WhatsApp (botón por producto) → emails transaccionales → admin: dashboard básico,
pedidos, inventario, producción → bilingüe completo → checklist de calidad y deploy.

**Fase 2**
Puntos (ledger), cupones avanzados, afiliados, carrito abandonado + segmentación,
reseñas verificadas, PayPal (si no entró en F1), notificaciones WhatsApp API.

**Fase 3**
IA (contenido, recomendador, predicción), configurador visual, BI completo, analítica
predictiva.

**Contemplado, NO construir:** marketplace multi-artesano, franquicias, distribuidores,
mayoristas, apps móviles, operación EE.UU./USD.

---

## 21. Reglas de trabajo para Claude Code

- Un módulo a la vez; nunca generar la plataforma completa de golpe.
- Proponer plan + esquema y **pedir confirmación** antes de módulos grandes.
- Tests para todo lo que toque dinero, stock o estados.
- `app/` sin lógica de negocio; APIs externas solo vía `providers/`.
- Textos de usuario solo en `messages/` (ES/EN).
- Secretos solo en variables de entorno.
- Preguntar ante decisiones con implicaciones de costo, legales o fiscales.
