import { BUILTIN_FONTS } from "./fonts";
import { applyCase, escapeXml, hexToRgba, loadImageEl, measureLineWidth, renderLayerOnCtx } from "./canvasRender";
import { BgMode, FontDef, TextLayer } from "./types";

export interface CanvasSettings {
  canvasWidth: number;
  canvasHeight: number;
  bgMode: BgMode;
  bgColor: string;
  bgImage: string | null;
  exportScale: number;
  watermarkOn: boolean;
  watermarkText: string;
  watermarkOpacity: number;
}

function findFont(allFonts: FontDef[], id: string): FontDef {
  return allFonts.find((f) => f.id === id) || BUILTIN_FONTS[0];
}

export async function exportPNG(layers: TextLayer[], allFonts: FontDef[], settings: CanvasSettings) {
  const { canvasWidth, canvasHeight, bgMode, bgColor, bgImage, exportScale, watermarkOn, watermarkText, watermarkOpacity } =
    settings;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(canvasWidth * exportScale);
  canvas.height = Math.ceil(canvasHeight * exportScale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(exportScale, exportScale);

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

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  const nameSource = layers[0]?.text || "text-image";
  link.download = `${nameSource.slice(0, 20).trim().replace(/\s+/g, "-") || "text-image"}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportSVG(
  layers: TextLayer[],
  allFonts: FontDef[],
  settings: CanvasSettings
): Promise<{ hasCurved: boolean }> {
  const { canvasWidth, canvasHeight, bgMode, bgColor, bgImage, watermarkOn, watermarkText, watermarkOpacity } = settings;

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d")!;
  let defs = "";
  let content = "";
  let hasCurved = false;

  let bgMarkup = "";
  if (bgMode === "white") bgMarkup = `<rect width="${canvasWidth}" height="${canvasHeight}" fill="#FFFFFF"/>`;
  else if (bgMode === "black") bgMarkup = `<rect width="${canvasWidth}" height="${canvasHeight}" fill="#000000"/>`;
  else if (bgMode === "custom") bgMarkup = `<rect width="${canvasWidth}" height="${canvasHeight}" fill="${bgColor}"/>`;
  else if (bgMode === "image" && bgImage) {
    bgMarkup = `<image href="${bgImage}" x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" preserveAspectRatio="xMidYMid slice"/>`;
  }

  layers.forEach((layer, idx) => {
    if (layer.curve !== 0) hasCurved = true;
    const font = findFont(allFonts, layer.fontId);
    const isCustom = font.id.startsWith("custom-");
    let fontFamilyForSvg = font.name;
    if (isCustom && font.base64) {
      const fam = `svgfont-${idx}`;
      defs += `<style>@font-face{font-family:'${fam}';src:url(data:font/ttf;base64,${font.base64}) format('truetype');}</style>`;
      fontFamilyForSvg = fam;
    }

    const displayText = applyCase(layer.text, layer.textCase);
    const lines = displayText.split("\n");
    mctx.font = `${layer.italic ? "italic" : "normal"} ${layer.bold ? "bold" : "normal"} ${layer.fontSize}px ${font.cssFamily}`;
    const lineWidths = lines.map((l) => measureLineWidth(mctx, l, layer.letterSpacing));
    const blockWidth = Math.max(...lineWidths, 1);
    const lineHeight = layer.fontSize * layer.lineHeightMult;
    const totalHeight = lineHeight * lines.length;

    const px = (layer.x / 100) * canvasWidth;
    const py = (layer.y / 100) * canvasHeight;

    const anchor = layer.align === "left" ? "start" : layer.align === "right" ? "end" : "middle";
    const anchorX = layer.align === "left" ? px - blockWidth / 2 : layer.align === "right" ? px + blockWidth / 2 : px;

    let filterAttr = "";
    if (layer.shadowOn) {
      filterAttr = ` filter="url(#shadow-${idx})"`;
      defs += `<filter id="shadow-${idx}" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="${layer.shadowX}" dy="${layer.shadowY}" stdDeviation="${layer.shadowBlur / 2}" flood-color="${layer.shadowColor}" flood-opacity="${layer.shadowOpacity}"/></filter>`;
    }
    const strokeAttr = layer.outlineOn
      ? ` paint-order="stroke fill" stroke="${layer.outlineColor}" stroke-width="${layer.outlineWidth * 2}"`
      : "";
    const styleAttr = ` font-family="${fontFamilyForSvg}" font-size="${layer.fontSize}" fill="${layer.fontColor}" font-weight="${layer.bold ? "bold" : "normal"}" font-style="${layer.italic ? "italic" : "normal"}" text-decoration="${layer.underline ? "underline" : "none"}" letter-spacing="${layer.letterSpacing}"`;
    const transformAttr = layer.rotation ? ` transform="rotate(${layer.rotation} ${px} ${py})"` : "";

    if (layer.curve !== 0) {
      const joined = lines.join(" ");
      content += `<text x="${px}" y="${py}" text-anchor="middle"${styleAttr}${strokeAttr}${filterAttr}${transformAttr}>${escapeXml(joined)}</text>`;
    } else {
      const topY = py - totalHeight / 2 + layer.fontSize * 0.8;
      const tspans = lines
        .map((line, i) => `<tspan x="${anchorX}" y="${topY + lineHeight * i}">${escapeXml(line)}</tspan>`)
        .join("");
      content += `<text text-anchor="${anchor}"${styleAttr}${strokeAttr}${filterAttr}${transformAttr}>${tspans}</text>`;
    }
  });

  if (watermarkOn && watermarkText.trim()) {
    content += `<text x="${canvasWidth - 16}" y="${canvasHeight - 12}" text-anchor="end" font-family="sans-serif" font-size="${Math.max(12, canvasWidth * 0.025)}" fill="${hexToRgba("#000000", watermarkOpacity)}">${escapeXml(watermarkText)}</text>`;
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}"><defs>${defs}</defs>${bgMarkup}${content}</svg>`;

  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const nameSource = layers[0]?.text || "text-image";
  link.download = `${nameSource.slice(0, 20).trim().replace(/\s+/g, "-") || "text-image"}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);

  return { hasCurved };
}
