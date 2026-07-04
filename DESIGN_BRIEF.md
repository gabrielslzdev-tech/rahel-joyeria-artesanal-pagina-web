# DESIGN_BRIEF.md — Creaciones Rahel
# Brief para Claude Design — Plataforma premium de joyería artesanal

## Objetivo

Diseñar la interfaz de una tienda online de joyería artesanal que se sienta **premium,
cálida y humana** — no como plantilla de e-commerce genérica. El cliente debe sentir que
compra una pieza hecha a mano con historia, no un producto de fábrica.

## Identidad de marca

- Joyería artesanal hecha a mano en **Tecate, Baja California, México**.
- El origen y el artesano son parte del producto: la historia se cuenta en todo el sitio.
- Público principal: mujeres 20–50; secundario: parejas, regalos, público espiritual,
  turistas.
- Sensación buscada: elegancia cálida, cercanía, autenticidad, confianza. Premium sin ser
  frío ni de lujo inaccesible.

## Referencias de nivel (benchmark visual)

Mejuri, Monica Vinader, Missoma. Estudiar: aire entre elementos, fotografía protagonista,
tipografía serif elegante, paletas cálidas neutras, checkout minimalista.

## Paleta

- Base: **crema / marfil / arena** (fondos cálidos, nunca blanco puro frío).
- Acento: **dorado suave / latón mate** (detalles, líneas, iconografía — jamás dorado
  brillante chillón ni degradados metálicos).
- Contraste: **café oscuro / casi negro cálido** para texto.
- Un acento secundario sutil opcional (verde salvia o terracota apagado) para estados y
  etiquetas.

## Tipografía

- Display/títulos: serif elegante con carácter (estilo Fraunces, Cormorant o similar).
- Cuerpo/UI: sans limpia y muy legible (estilo Inter).
- Jerarquía clara; títulos con aire; nada condensado ni agresivo.

## Principios de layout

1. **La fotografía manda.** Layouts que dejan respirar imágenes grandes; la UI se
   subordina a la pieza.
2. **Espacio en blanco generoso.** El lujo se comunica con aire, no con adornos.
3. **Mobile-first.** La mayoría del tráfico será móvil (Instagram/WhatsApp → tienda).
4. Micro-interacciones sutiles (hover suave, transiciones cortas). Sin carruseles
   automáticos, sin animaciones llamativas, sin sombras duras.
5. Bilingüe ES/EN: el diseño debe soportar textos más largos en ambos idiomas.
6. Accesibilidad: contraste AA, tap targets cómodos, focus visible.

## Páginas y componentes a diseñar

1. **Home:** hero emocional (foto grande + historia en una frase), colecciones
   destacadas, más vendidos, bloque "Hecho a mano en Baja California" (proceso artesanal
   con video), testimonios, newsletter, footer completo.
2. **Catálogo / colección:** grid de productos con filtros elegantes (precio, material,
   piedra, color, personalizable), tarjeta de producto con foto principal + foto de
   escala al hover, etiqueta de "Pieza única" / "Bajo pedido".
3. **Ficha de producto (la página más importante):** galería grande (fotos, video,
   escala), selector de personalización (grabado, piedra, material) con precio que se
   actualiza, **tiempo de elaboración visible** ("Lista para enviar en X días"),
   señales de confianza (pago seguro, garantía, certificado de autenticidad), botón de
   WhatsApp por producto, reseñas.
4. **Carrito y checkout:** minimalista, pasos claros, resumen con tiempos de producción,
   badges de métodos de pago (tarjetas, MSI, OXXO, PayPal), aviso de no-devolución en
   personalizados, opción de factura (CFDI).
5. **Página de marca / proceso artesanal:** narrativa visual del taller y el artesano.
6. **Perfil del cliente:** pedidos con línea de tiempo del estado de producción de su
   pieza (esto es diferenciador: "tu pieza está en control de calidad"), direcciones,
   favoritos, puntos.
7. **Estados de sistema:** empty states, carga, error y confirmación de pedido con el
   mismo cuidado visual.

## Qué NO hacer

- Estética de plantilla Shopify genérica o de marketplace.
- Dorados brillantes, negros absolutos fríos, rojos de urgencia, contadores de escasez
  falsos.
- Saturar de badges, popups y banners; máximo un popup (newsletter) con retardo.
- Tipografías script/cursivas difíciles de leer.

## Entregables solicitados a Claude Design

1. Sistema visual: paleta final con tokens, tipografía, espaciado, botones, inputs,
   tarjetas, etiquetas.
2. Home completa (móvil y desktop).
3. Ficha de producto completa (móvil y desktop).
4. Catálogo con filtros (móvil).
5. Checkout (móvil).
6. Los tokens deben poder trasladarse a TailwindCSS (el frontend real es Next.js +
   Tailwind).
