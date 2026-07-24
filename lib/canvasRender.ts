import { TextLayer } from "./types";

export function hexToRgba(hex: string, opacity: number): string {
  const h = (hex || "#000000").replace("#", "");
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16) || 0;
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16) || 0;
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function applyCase(str: string, mode: TextLayer["textCase"]): string {
  if (mode === "upper") return str.toUpperCase();
  if (mode === "lower") return str.toLowerCase();
  return str;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function measureLineWidth(ctx: CanvasRenderingContext2D, line: string, spacing: number): number {
  if (!line) return ctx.measureText(" ").width;
  let w = 0;
  for (const ch of line) w += ctx.measureText(ch).width + spacing;
  return w - spacing;
}

/** Draws one line char-by-char so letter-spacing behaves consistently across browsers. */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  spacing: number,
  alignMode: TextLayer["align"],
  lineWidth: number,
  mode: "fill" | "stroke"
) {
  let startX = x;
  if (alignMode === "center") startX = x - lineWidth / 2;
  else if (alignMode === "right") startX = x - lineWidth;
  let cursor = startX;
  for (const ch of line) {
    if (mode === "stroke") ctx.strokeText(ch, cursor, y);
    else ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + spacing;
  }
}

/** Draws text along a circular arc, centered at the current (translated) canvas origin. */
export function drawArcLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  layer: TextLayer,
  cssFamily: string,
  fontWeight: string,
  fontStyle: string,
  mode: "fill" | "stroke"
) {
  const chars = Array.from(text);
  if (!chars.length) return;
  const spacing = layer.letterSpacing;
  ctx.font = `${fontStyle} ${fontWeight} ${layer.fontSize}px ${cssFamily}`;
  const widths = chars.map((c) => ctx.measureText(c).width);
  const advances = widths.map((w) => w + spacing);
  const totalWidth = advances.reduce((a, b) => a + b, 0) - spacing;
  let cum = 0;
  const centers = widths.map((w, i) => {
    const c = cum + w / 2;
    cum += advances[i];
    return c;
  });
  const radius = 12000 / Math.max(1, Math.abs(layer.curve));
  const sign = layer.curve > 0 ? 1 : -1;
  const baselineY0 = -(layer.fontSize * layer.lineHeightMult) / 2 + layer.fontSize * 0.8;

  centers.forEach((c, i) => {
    const theta = (c - totalWidth / 2) / radius;
    const x = radius * Math.sin(theta);
    const y =
      sign === 1
        ? baselineY0 + radius * (1 - Math.cos(theta))
        : baselineY0 - radius * (1 - Math.cos(theta));
    const rot = sign === 1 ? theta : -theta;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (mode === "stroke") ctx.strokeText(chars[i], -widths[i] / 2, 0);
    else ctx.fillText(chars[i], -widths[i] / 2, 0);
    ctx.restore();
  });
}

/**
 * Draws one full layer (straight or curved, incl. outline/shadow/underline)
 * onto a canvas context, anchored at pixel position (px, py).
 */
export function renderLayerOnCtx(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  cssFamily: string,
  px: number,
  py: number
) {
  const displayText = applyCase(layer.text, layer.textCase);
  const lines = displayText.split("\n");
  const fontWeight = layer.bold ? "bold" : "normal";
  const fontStyle = layer.italic ? "italic" : "normal";
  ctx.font = `${fontStyle} ${fontWeight} ${layer.fontSize}px ${cssFamily}`;
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate((layer.rotation * Math.PI) / 180);

  const applyShadow = () => {
    if (layer.shadowOn) {
      ctx.shadowColor = hexToRgba(layer.shadowColor, layer.shadowOpacity);
      ctx.shadowOffsetX = layer.shadowX;
      ctx.shadowOffsetY = layer.shadowY;
      ctx.shadowBlur = layer.shadowBlur;
    } else {
      ctx.shadowColor = "transparent";
    }
  };

  if (layer.curve !== 0) {
    const joined = lines.join(" ");
    applyShadow();
    if (layer.outlineOn) {
      ctx.strokeStyle = layer.outlineColor;
      ctx.lineWidth = layer.outlineWidth * 2;
      drawArcLine(ctx, joined, layer, cssFamily, fontWeight, fontStyle, "stroke");
    }
    if (layer.outlineOn) ctx.shadowColor = "transparent";
    ctx.fillStyle = layer.fontColor;
    drawArcLine(ctx, joined, layer, cssFamily, fontWeight, fontStyle, "fill");
  } else {
    const lineHeight = layer.fontSize * layer.lineHeightMult;
    const lineWidths = lines.map((l) => measureLineWidth(ctx, l, layer.letterSpacing));
    const blockWidth = Math.max(...lineWidths, 1);
    const totalHeight = lineHeight * lines.length;
    const anchorX = layer.align === "left" ? -blockWidth / 2 : layer.align === "right" ? blockWidth / 2 : 0;

    lines.forEach((line, i) => {
      const y = -totalHeight / 2 + lineHeight * i + layer.fontSize * 0.8;
      const lw = lineWidths[i];
      applyShadow();
      if (layer.outlineOn) {
        ctx.strokeStyle = layer.outlineColor;
        ctx.lineWidth = layer.outlineWidth * 2;
        drawLine(ctx, line, anchorX, y, layer.letterSpacing, layer.align, lw, "stroke");
      }
      if (layer.outlineOn) ctx.shadowColor = "transparent";
      ctx.fillStyle = layer.fontColor;
      drawLine(ctx, line, anchorX, y, layer.letterSpacing, layer.align, lw, "fill");

      if (layer.underline) {
        let startX = anchorX;
        if (layer.align === "center") startX = anchorX - lw / 2;
        else if (layer.align === "right") startX = anchorX - lw;
        ctx.strokeStyle = layer.fontColor;
        ctx.lineWidth = Math.max(1, layer.fontSize * 0.05);
        ctx.shadowColor = "transparent";
        ctx.beginPath();
        ctx.moveTo(startX, y + layer.fontSize * 0.12);
        ctx.lineTo(startX + lw, y + layer.fontSize * 0.12);
        ctx.stroke();
      }
    });
  }

  ctx.restore();
}

export function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function escapeXml(str: string): string {
  return String(str).replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string)
  );
}

let layerIdCounter = 1;
export function makeLayer(overrides: Partial<TextLayer> = {}): TextLayer {
  layerIdCounter += 1;
  return {
    id: `layer-${Date.now()}-${layerIdCounter}`,
    text: "Baby Dinosaur",
    fontId: "fredoka",
    fontSize: 72,
    fontColor: "#1A1A1A",
    x: 50,
    y: 50,
    rotation: 0,
    curve: 0,
    align: "center",
    letterSpacing: 0,
    lineHeightMult: 1.2,
    bold: false,
    italic: false,
    underline: false,
    textCase: "none",
    outlineOn: false,
    outlineWidth: 4,
    outlineColor: "#000000",
    shadowOn: false,
    shadowX: 4,
    shadowY: 4,
    shadowBlur: 6,
    shadowOpacity: 0.5,
    shadowColor: "#000000",
    ...overrides,
  };
}
