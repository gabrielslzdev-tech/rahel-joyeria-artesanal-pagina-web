// Genera imágenes SVG de relleno para los productos ficticios de desarrollo.
// El cliente subirá las fotos reales al final; esto solo sirve para maquetar.
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "./public/placeholders";
mkdirSync(OUT, { recursive: true });

// Paleta sobria alineada con la marca (elegante/artesanal).
const items = [
  { slug: "pulsera-cuarzo", label: "Pulsera", bg: "#e8ded1", fg: "#8a6d4b" },
  { slug: "collar-plata", label: "Collar", bg: "#e3e6ea", fg: "#5b6b7b" },
  { slug: "aretes-cristal", label: "Aretes", bg: "#efe4ea", fg: "#8a5c74" },
  { slug: "anillo-plata", label: "Anillo", bg: "#e6e9e3", fg: "#5e6f56" },
  { slug: "tobillera-acero", label: "Tobillera", bg: "#e9e4dd", fg: "#7a6a55" },
  { slug: "tiara-novia", label: "Tiara", bg: "#f0eae0", fg: "#9a7d52" },
  { slug: "pulsera-personalizada", label: "Personalizada", bg: "#e5ded6", fg: "#7d6a58" },
  { slug: "collar-espiritual", label: "Espiritual", bg: "#e4e0ec", fg: "#6a5f86" },
];

function svg({ label, bg, fg }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="${bg}"/>
  <circle cx="400" cy="330" r="140" fill="none" stroke="${fg}" stroke-width="6" opacity="0.5"/>
  <circle cx="400" cy="330" r="70" fill="${fg}" opacity="0.18"/>
  <text x="400" y="560" font-family="Georgia, serif" font-size="52" fill="${fg}" text-anchor="middle">Creaciones Rahel</text>
  <text x="400" y="620" font-family="Georgia, serif" font-size="34" fill="${fg}" text-anchor="middle" opacity="0.8">${label}</text>
  <text x="400" y="700" font-family="Arial, sans-serif" font-size="22" fill="${fg}" text-anchor="middle" opacity="0.6">imagen de ejemplo</text>
</svg>`;
}

for (const it of items) {
  writeFileSync(`${OUT}/${it.slug}.svg`, svg(it));
}
writeFileSync(`${OUT}/scale.svg`, svg({ label: "Foto de escala", bg: "#ded6ca", fg: "#6f5b41" }));

console.log(`Generados ${items.length + 1} placeholders en ${OUT}`);
