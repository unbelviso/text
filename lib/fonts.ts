import { CanvasPreset, FontDef, StyleTemplate } from "./types";

export const BUILTIN_FONTS: FontDef[] = [
  { id: "fredoka", name: "Fredoka", category: "Cute", googleParam: "Fredoka:wght@600", cssFamily: "'Fredoka'" },
  { id: "luckiest-guy", name: "Luckiest Guy", category: "Bold", googleParam: "Luckiest+Guy", cssFamily: "'Luckiest Guy'" },
  { id: "bangers", name: "Bangers", category: "Retro", googleParam: "Bangers", cssFamily: "'Bangers'" },
  { id: "press-start-2p", name: "Press Start 2P", category: "Pixel", googleParam: "Press+Start+2P", cssFamily: "'Press Start 2P'" },
  { id: "pixelify-sans", name: "Pixelify Sans", category: "Pixel", googleParam: "Pixelify+Sans:wght@500", cssFamily: "'Pixelify Sans'" },
  { id: "tiny5", name: "Tiny5", category: "Pixel", googleParam: "Tiny5", cssFamily: "'Tiny5'" },
  { id: "rubik", name: "Rubik", category: "Cute", googleParam: "Rubik:wght@600", cssFamily: "'Rubik'" },
];

export const CATEGORIES: FontDef["category"][] = [
  "All",
  "Cute",
  "Pixel",
  "Bold",
  "Retro",
  "Handwriting",
  "My Fonts",
];

export const ACCENT = "#FF5470";

export const CANVAS_PRESETS: CanvasPreset[] = [
  { name: "Square", w: 1000, h: 1000 },
  { name: "Etsy Listing", w: 2000, h: 2000 },
  { name: "Instagram Post", w: 1080, h: 1080 },
  { name: "Sticker", w: 800, h: 800 },
  { name: "Banner", w: 1600, h: 600 },
];

export const TEMPLATES: StyleTemplate[] = [
  { id: "bubble", name: "Bubble", fontId: "fredoka", fontColor: "#FFFFFF", outlineOn: true, outlineWidth: 6, outlineColor: ACCENT },
  { id: "neon", name: "Neon", fontId: "bangers", fontColor: "#39FF88", shadowOn: true, shadowX: 0, shadowY: 0, shadowBlur: 20, shadowOpacity: 0.9, shadowColor: "#39FF88" },
  { id: "stamp", name: "Stamp", fontId: "luckiest-guy", fontColor: "#1A1A1A", outlineOn: true, outlineWidth: 3, outlineColor: "#1A1A1A", shadowOn: true, shadowX: 3, shadowY: 3, shadowBlur: 0, shadowOpacity: 1, shadowColor: ACCENT },
  { id: "pixel", name: "Pixel Pop", fontId: "press-start-2p", fontColor: "#1A1A1A", shadowOn: true, shadowX: 3, shadowY: 3, shadowBlur: 0, shadowOpacity: 1, shadowColor: "#FFD400" },
  { id: "clean", name: "Clean Shadow", fontId: "rubik", fontColor: "#1A1A1A", shadowOn: true, shadowX: 0, shadowY: 4, shadowBlur: 12, shadowOpacity: 0.25, shadowColor: "#000000" },
  { id: "retro", name: "Retro Pop", fontId: "bangers", fontColor: "#FFEA00", outlineOn: true, outlineWidth: 5, outlineColor: "#1A1A1A", shadowOn: true, shadowX: 5, shadowY: 5, shadowBlur: 0, shadowOpacity: 1, shadowColor: ACCENT },
];

/** Builds the Google Fonts CSS2 stylesheet URL for all built-in fonts. */
export function googleFontsHref(): string {
  const params = BUILTIN_FONTS.map((f) => `family=${f.googleParam}`).join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
