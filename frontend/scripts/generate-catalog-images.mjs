// Generates placeholder SVG images for the curated listing-image catalog.
// Run: node scripts/generate-catalog-images.mjs
// Output: public/catalog/<slug>.svg (tiny text files, no storage cost).
// Keep the ITEMS list in sync with the backend seed migration
// (agrigax_backend_fast/migrations/20260719120001_seed_catalog_images.js).

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ITEMS = [
  { slug: "maize", name: "Maize", emoji: "🌽" },
  { slug: "beans", name: "Beans (Maharage)", emoji: "🫘" },
  { slug: "rice", name: "Rice (Mchele)", emoji: "🍚" },
  { slug: "tomatoes", name: "Tomatoes (Nyanya)", emoji: "🍅" },
  { slug: "onions", name: "Onions (Vitunguu)", emoji: "🧅" },
  { slug: "potatoes", name: "Potatoes (Viazi)", emoji: "🥔" },
  { slug: "bananas", name: "Bananas (Ndizi)", emoji: "🍌" },
  { slug: "cassava", name: "Cassava (Mihogo)", emoji: "🍠" },
  { slug: "sunflower", name: "Sunflower (Alizeti)", emoji: "🌻" },
  { slug: "coffee", name: "Coffee (Kahawa)", emoji: "☕" },
  { slug: "cashew", name: "Cashew (Korosho)", emoji: "🥜" },
  { slug: "avocado", name: "Avocado (Parachichi)", emoji: "🥑" },
  { slug: "watermelon", name: "Watermelon (Tikiti)", emoji: "🍉" },
  { slug: "chicken", name: "Chicken (Kuku)", emoji: "🐔" },
  { slug: "goat", name: "Goat (Mbuzi)", emoji: "🐐" },
  { slug: "cattle", name: "Cattle (Ng'ombe)", emoji: "🐄" },
  { slug: "fish", name: "Fish (Samaki)", emoji: "🐟" },
  { slug: "eggs", name: "Eggs (Mayai)", emoji: "🥚" },
  { slug: "milk", name: "Milk (Maziwa)", emoji: "🥛" },
  { slug: "tractor", name: "Tractor (Trekta)", emoji: "🚜" },
  { slug: "water-pump", name: "Water Pump (Pampu)", emoji: "💧" },
  { slug: "fertilizer", name: "Fertilizer (Mbolea)", emoji: "🌱" },
  { slug: "seeds", name: "Seeds (Mbegu)", emoji: "🌾" },
  { slug: "sprayer", name: "Pesticide Sprayer", emoji: "🧴" },
  { slug: "agronomist", name: "Agronomist Advice", emoji: "👨‍🌾" },
  { slug: "crop-doctor", name: "Crop Doctor", emoji: "🩺" },
  { slug: "farm-labor", name: "Farm Labor (Kibarua)", emoji: "💪" },
  { slug: "irrigation", name: "Irrigation Service", emoji: "🚿" },
];

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "catalog");
mkdirSync(outDir, { recursive: true });

const svgFor = (item, index) => {
  const hue = (95 + index * 12) % 360;
  const escaped = item.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&#39;");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 45%, 88%)"/>
      <stop offset="100%" stop-color="hsl(${hue}, 50%, 68%)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <circle cx="330" cy="40" r="90" fill="hsl(${hue}, 55%, 78%)" opacity="0.5"/>
  <circle cx="50" cy="270" r="70" fill="hsl(${hue}, 55%, 60%)" opacity="0.35"/>
  <text x="200" y="140" font-size="72" text-anchor="middle" dominant-baseline="middle">${item.emoji}</text>
  <text x="200" y="215" font-family="Arial, sans-serif" font-size="22" font-weight="bold"
        fill="hsl(${hue}, 60%, 22%)" text-anchor="middle">${escaped}</text>
  <text x="200" y="245" font-family="Arial, sans-serif" font-size="12" letter-spacing="3"
        fill="hsl(${hue}, 45%, 35%)" text-anchor="middle">AGRIGAX</text>
</svg>
`;
};

ITEMS.forEach((item, index) => {
  writeFileSync(join(outDir, `${item.slug}.svg`), svgFor(item, index));
});

console.log(`Generated ${ITEMS.length} images in public/catalog/`);
