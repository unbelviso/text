import * as opentype from "opentype.js";
import { BUILTIN_FONTS } from "./fonts";
import {
  applyCase,
  base64ToBuffer,
  escapeXml,
  hexToRgba,
  loadImageEl,
  measureLineWidth,
  renderLayerOnCtx,
} from "./canvasRender";
import { BgMode, FontDef, TextLayer } from "./types";

export type SvgMode = "editable" | "outline";

export interface CanvasSettings {
  canvasWidth: number;
  canvasHeight: number;
  bgMode: BgMode;
  bgColor: string;
  bgImage: string | null;
  /** Target print resolution. 72 = "screen" scale (1x pixels). */
  dpi: number;
  watermarkOn: boolean;
  watermarkText: string;
  watermarkOpacity: number;
}

const BASE_DPI = 72;

function findFont(allFonts: FontDef[], id: string): FontDef {
  return allFonts.find((f) => f.id === id) || BUILTIN_FONTS[0];
}

/** Renders the full canvas (background + layers + watermark) and returns a raw PNG Blob (no DPI metadata yet). */
export async function renderPngBlob(layers: TextLayer[], allFonts: FontDef[], settings: CanvasSettings): Promise<Blob> {
  const { canvasWidth, canvasHeight, bgMode, bgColor, bgImage, dpi, watermarkOn, watermarkText, watermarkOpacity } = settings;
  const scale = dpi / BASE_DPI;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(canvasWidth * scale);
  canvas.height = Math.ceil(canvasHeight * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  if (bgMode === "white") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (bgMode === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (bgMode === "custom") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (bgMode === "image" && bgImage) {
    try {
      const img = await loadImageEl(bgImage);
      const s = Math.max(canvasWidth / img.width, canvasHeight / img.height);
      const dw = img.width * s;
      const dh = img.height * s;
      ctx.drawImage(img, (canvasWidth - dw) / 2, (canvasHeight - dh) / 2, dw, dh);
    } catch {
      /* fall through with empty background */
    }
  }

  for (const layer of layers) {
    const font = findFont(allFonts, layer.fontId);
    const px = (layer.x / 100) * canvasWidth;
    const py = (layer.y / 100) * canvasHeight;
    renderLayerOnCtx(ctx, layer, font.cssFamily, px, py);
  }

  if (watermarkOn && watermarkText.trim()) {
    ctx.font = `${Math.max(12, canvasWidth * 0.025)}px sans-serif`;
    ctx.fillStyle = hexToRgba("#000000", watermarkOpacity);
    ctx.shadowColor = "transparent";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(watermarkText, canvasWidth - 16, canvasHeight - 12);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas.toBlob returned null"));
    }, "image/png");
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function fileNameFor(layers: TextLayer[], ext: string): string {
  const nameSource = layers[0]?.text || "text-image";
  return `${nameSource.slice(0, 20).trim().replace(/\s+/g, "-") || "text-image"}.${ext}`;
}

export async function exportPNG(layers: TextLayer[], allFonts: FontDef[], settings: CanvasSettings) {
  const { setPngDpi } = await import("./pngDpi");
  const rawBlob = await renderPngBlob(layers, allFonts, settings);
  const withDpi = await setPngDpi(rawBlob, settings.dpi);
  triggerDownload(withDpi, fileNameFor(layers, "png"));
}

/** Copies the rendered PNG directly to the clipboard (no file save needed). */
export async function copyPngToClipboard(layers: TextLayer[], allFonts: FontDef[], settings: CanvasSettings): Promise<void> {
  if (!("clipboard" in navigator) || typeof ClipboardItem === "undefined") {
    throw new Error("Clipboard image copy isn't supported in this browser");
  }
  const { setPngDpi } = await import("./pngDpi");
  const rawBlob = await renderPngBlob(layers, allFonts, settings);
  const withDpi = await setPngDpi(rawBlob, settings.dpi);
  await navigator.clipboard.write([new ClipboardItem({ "image/png": withDpi })]);
}

// ============================== SVG export ==============================

interface LineLayout {
  d: string; // path data (outline mode) — empty string in editable mode
  text: string;
  x: number; // absolute SVG x for this line's anchor (already align-aware)
  y: number; // absolute SVG baseline y for this line
  width: number;
}

/** Computes per-line layout (width/position) shared by both editable and outline SVG rendering. */
function layoutLines(
  mctx: CanvasRenderingContext2D,
  layer: TextLayer,
  cssFamily: string,
  px: number,
  py: number
): { lines: string[]; layouts: LineLayout[]; blockWidth: number } {
  const displayText = applyCase(layer.text, layer.textCase);
  const lines = displayText.split("\n");
  mctx.font = `${layer.italic ? "italic" : "normal"} ${layer.bold ? "bold" : "normal"} ${layer.fontSize}px ${cssFamily}`;
  const lineWidths = lines.map((l) => measureLineWidth(mctx, l, layer.letterSpacing));
  const blockWidth = Math.max(...lineWidths, 1);
  const lineHeight = layer.fontSize * layer.lineHeightMult;
  const totalHeight = lineHeight * lines.length;

  const layouts: LineLayout[] = lines.map((line, i) => {
    const lw = lineWidths[i];
    const anchorX = layer.align === "left" ? px - blockWidth / 2 : layer.align === "right" ? px + blockWidth / 2 - lw : px - lw / 2;
    const y = py - totalHeight / 2 + lineHeight * i + layer.fontSize * 0.8;
    return { d: "", text: line, x: anchorX, y, width: lw };
  });

  return { lines, layouts, blockWidth };
}

function buildEditableTextMarkup(layer: TextLayer, layouts: LineLayout[], fontFamilyForSvg: string, px: number, py: number, filterAttr: string, strokeAttr: string): string {
  const anchorTag = layer.align === "left" ? "start" : layer.align === "right" ? "end" : "start"; // x already computed per-line for left-edge anchoring below
  const styleAttr = ` font-family="${fontFamilyForSvg}" font-size="${layer.fontSize}" fill="${layer.fontColor}" font-weight="${layer.bold ? "bold" : "normal"}" font-style="${layer.italic ? "italic" : "normal"}" text-decoration="${layer.underline ? "underline" : "none"}" letter-spacing="${layer.letterSpacing}"`;
  const transformAttr = layer.rotation ? ` transform="rotate(${layer.rotation} ${px} ${py})"` : "";
  const tspans = layouts.map((l) => `<tspan x="${l.x}" y="${l.y}">${escapeXml(l.text)}</tspan>`).join("");
  return `<text text-anchor="start"${styleAttr}${strokeAttr}${filterAttr}${transformAttr}>${tspans}</text>`;
}

function buildOutlinePathD(font: opentype.Font, line: string, fontSize: number, startX: number, baselineY: number, spacing: number): string {
  let cursor = startX;
  let d = "";
  for (const ch of line) {
    const glyphPath = font.getPath(ch, cursor, baselineY, fontSize);
    d += glyphPath.toPathData(2) + " ";
    cursor += font.getAdvanceWidth(ch, fontSize) + spacing;
  }
  return d.trim();
}

export async function exportSVG(
  layers: TextLayer[],
  allFonts: FontDef[],
  settings: CanvasSettings,
  svgMode: SvgMode
): Promise<{ hasCurved: boolean; hasBuiltinFallback: boolean }> {
  const { canvasWidth, canvasHeight, bgMode, bgColor, bgImage, watermarkOn, watermarkText, watermarkOpacity } = settings;

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d")!;
  let defs = "";
  let content = "";
  let hasCurved = false;
  let hasBuiltinFallback = false;

  let bgMarkup = "";
  if (bgMode === "white") bgMarkup = `<rect width="${canvasWidth}" height="${canvasHeight}" fill="#FFFFFF"/>`;
  else if (bgMode === "black") bgMarkup = `<rect width="${canvasWidth}" height="${canvasHeight}" fill="#000000"/>`;
  else if (bgMode === "custom") bgMarkup = `<rect width="${canvasWidth}" height="${canvasHeight}" fill="${bgColor}"/>`;
  else if (bgMode === "image" && bgImage) {
    bgMarkup = `<image href="${bgImage}" x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" preserveAspectRatio="xMidYMid slice"/>`;
  }

  for (const [idx, layer] of layers.entries()) {
    if (layer.curve !== 0) hasCurved = true;
    const font = findFont(allFonts, layer.fontId);
    const isCustom = font.id.startsWith("custom-") && !!font.base64;
    const px = (layer.x / 100) * canvasWidth;
    const py = (layer.y / 100) * canvasHeight;

    let filterAttr = "";
    if (layer.shadowOn) {
      filterAttr = ` filter="url(#shadow-${idx})"`;
      defs += `<filter id="shadow-${idx}" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="${layer.shadowX}" dy="${layer.shadowY}" stdDeviation="${layer.shadowBlur / 2}" flood-color="${layer.shadowColor}" flood-opacity="${layer.shadowOpacity}"/></filter>`;
    }
    const strokeAttr = layer.outlineOn ? ` paint-order="stroke fill" stroke="${layer.outlineColor}" stroke-width="${layer.outlineWidth * 2}"` : "";

    // Curved layers always flatten to a straight line (canvas/PNG-only effect for now).
    if (layer.curve !== 0) {
      const displayText = applyCase(layer.text, layer.textCase).split("\n").join(" ");
      let fontFamilyForSvg = font.name;
      if (isCustom && font.base64) {
        const fam = `svgfont-${idx}`;
        defs += `<style>@font-face{font-family:'${fam}';src:url(data:font/ttf;base64,${font.base64}) format('truetype');}</style>`;
        fontFamilyForSvg = fam;
      } else {
        hasBuiltinFallback = svgMode === "outline" || hasBuiltinFallback;
      }
      const styleAttr = ` font-family="${fontFamilyForSvg}" font-size="${layer.fontSize}" fill="${layer.fontColor}" font-weight="${layer.bold ? "bold" : "normal"}" font-style="${layer.italic ? "italic" : "normal"}"`;
      const transformAttr = layer.rotation ? ` transform="rotate(${layer.rotation} ${px} ${py})"` : "";
      content += `<text x="${px}" y="${py}" text-anchor="middle"${styleAttr}${strokeAttr}${filterAttr}${transformAttr}>${escapeXml(displayText)}</text>`;
      continue;
    }

    const { layouts } = layoutLines(mctx, layer, font.cssFamily, px, py);

    if (svgMode === "outline" && isCustom) {
      // True vector outlines — no font dependency at all in the exported file.
      try {
        const fontObj = opentype.parse(base64ToBuffer(font.base64!));
        const groupTransform = layer.rotation ? ` transform="rotate(${layer.rotation} ${px} ${py})"` : "";
        let pathD = "";
        for (const l of layouts) {
          pathD += buildOutlinePathD(fontObj, l.text, layer.fontSize, l.x, l.y, layer.letterSpacing) + " ";
        }
        content += `<path d="${pathD.trim()}" fill="${layer.fontColor}"${strokeAttr}${filterAttr}${groupTransform}/>`;
      } catch {
        // If parsing fails for any reason, fall back to editable text for this layer.
        content += buildEditableTextMarkup(layer, layouts, font.name, px, py, filterAttr, strokeAttr);
        hasBuiltinFallback = true;
      }
    } else {
      let fontFamilyForSvg = font.name;
      if (isCustom) {
        const fam = `svgfont-${idx}`;
        defs += `<style>@font-face{font-family:'${fam}';src:url(data:font/ttf;base64,${font.base64}) format('truetype');}</style>`;
        fontFamilyForSvg = fam;
      } else if (svgMode === "outline") {
        hasBuiltinFallback = true;
      }
      content += buildEditableTextMarkup(layer, layouts, fontFamilyForSvg, px, py, filterAttr, strokeAttr);
    }
  }

  if (watermarkOn && watermarkText.trim()) {
    content += `<text x="${canvasWidth - 16}" y="${canvasHeight - 12}" text-anchor="end" font-family="sans-serif" font-size="${Math.max(12, canvasWidth * 0.025)}" fill="${hexToRgba("#000000", watermarkOpacity)}">${escapeXml(watermarkText)}</text>`;
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}"><defs>${defs}</defs>${bgMarkup}${content}</svg>`;
  triggerDownload(new Blob([svgString], { type: "image/svg+xml" }), fileNameFor(layers, "svg"));

  return { hasCurved, hasBuiltinFallback };
}
