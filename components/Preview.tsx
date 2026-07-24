"use client";

import { Star } from "lucide-react";
import { ACCENT } from "@/lib/fonts";
import { applyCase, hexToRgba } from "@/lib/canvasRender";
import { Card, Label } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function Preview(props: TextStampState) {
  const {
    layers,
    activeLayer,
    activeLayerId,
    setActiveLayerId,
    setDraggingLayerId,
    allFonts,
    fontsReady,
    canvasWidth,
    canvasHeight,
    bgMode,
    bgColor,
    bgImage,
    compareMode,
    setCompareMode,
    previewZoom,
    setPreviewZoom,
    filteredFonts,
    favoriteIds,
    selectFont,
    curvedLayers,
    previewRef,
    overlayCanvasRef,
    onOverlayPointerDown,
  } = props;

  const activeFont = allFonts.find((f) => f.id === activeLayer.fontId) || allFonts[0];
  const previewBg = bgMode === "white" ? "#FFFFFF" : bgMode === "black" ? "#000000" : bgMode === "custom" ? bgColor : undefined;

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between">
        <Label>Preview</Label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Zoom</span>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={previewZoom}
              onChange={(e) => setPreviewZoom(Number(e.target.value))}
              className="w-20"
              style={{ accentColor: ACCENT }}
            />
          </div>
          <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
            {[
              { id: false, label: "Normal" },
              { id: true, label: "Compare" },
            ].map((opt) => (
              <button
                key={String(opt.id)}
                onClick={() => setCompareMode(opt.id)}
                className="text-xs px-2.5 py-1 rounded-md transition"
                style={compareMode === opt.id ? { backgroundColor: "white", color: ACCENT, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" } : { color: "#737373" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {compareMode ? (
        <div className="mt-2 rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-y-auto" style={{ maxHeight: 460 }}>
          {filteredFonts.length === 0 && <p className="text-sm text-neutral-400 py-10 text-center">No fonts match your filter</p>}
          {filteredFonts.map((f) => (
            <div
              key={`compare-${f.id}`}
              onClick={() => selectFont(f.id)}
              className="px-4 py-3 cursor-pointer transition"
              style={f.id === activeLayer.fontId ? { backgroundColor: "#FFF1F3" } : {}}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-400">{f.name}</span>
                {favoriteIds.includes(f.id) && <Star size={11} fill={ACCENT} style={{ color: ACCENT }} />}
              </div>
              <p className="whitespace-pre-wrap break-words" style={{ fontFamily: fontsReady ? f.cssFamily : "inherit", fontSize: 32, color: activeLayer.fontColor, lineHeight: 1.2 }}>
                {applyCase(activeLayer.text, activeLayer.textCase) || "Type something…"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 flex justify-center">
          <div
            ref={previewRef}
            onPointerDown={onOverlayPointerDown}
            className="relative rounded-xl border border-neutral-200 overflow-hidden bg-checkerboard"
            style={{
              width: "100%",
              maxWidth: 560,
              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
              ["containerType" as any]: "inline-size",
              transform: `scale(${previewZoom})`,
              transformOrigin: "top center",
              backgroundColor: previewBg,
              backgroundImage: bgMode === "image" && bgImage ? `url(${bgImage})` : bgMode !== "transparent" ? "none" : undefined,
              backgroundSize: bgMode === "image" ? "cover" : undefined,
              backgroundPosition: bgMode === "image" ? "center" : undefined,
            }}
          >
            {layers
              .filter((l) => l.curve === 0)
              .map((layer) => {
                const font = allFonts.find((f) => f.id === layer.fontId) || allFonts[0];
                const fsCqw = (layer.fontSize / canvasWidth) * 100;
                return (
                  <div
                    key={layer.id}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setActiveLayerId(layer.id);
                      setDraggingLayerId(layer.id);
                    }}
                    className="absolute cursor-move select-none whitespace-pre-wrap"
                    style={{
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                      fontFamily: fontsReady ? font.cssFamily : "inherit",
                      fontSize: `${fsCqw}cqw`,
                      color: layer.fontColor,
                      fontWeight: layer.bold ? 700 : 400,
                      fontStyle: layer.italic ? "italic" : "normal",
                      textDecoration: layer.underline ? "underline" : "none",
                      textAlign: layer.align,
                      lineHeight: layer.lineHeightMult,
                      letterSpacing: `${(layer.letterSpacing / canvasWidth) * 100}cqw`,
                      WebkitTextStroke: layer.outlineOn ? (`${(layer.outlineWidth / canvasWidth) * 100}cqw ${layer.outlineColor}` as any) : undefined,
                      paintOrder: layer.outlineOn ? "stroke fill" : undefined,
                      textShadow: layer.shadowOn
                        ? `${(layer.shadowX / canvasWidth) * 100}cqw ${(layer.shadowY / canvasWidth) * 100}cqw ${(layer.shadowBlur / canvasWidth) * 100}cqw ${hexToRgba(layer.shadowColor, layer.shadowOpacity)}`
                        : undefined,
                      outline: layer.id === activeLayerId ? `1px dashed ${ACCENT}` : "none",
                      outlineOffset: 4,
                      maxWidth: "92%",
                    }}
                  >
                    {applyCase(layer.text, layer.textCase) || "Type something…"}
                  </div>
                );
              })}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: curvedLayers.length ? "auto" : "none" }}
              onPointerDown={onOverlayPointerDown}
            />
          </div>
        </div>
      )}
      <p className="text-xs text-neutral-400 mt-2 text-center">
        Canvas: {canvasWidth}×{canvasHeight}px — {activeFont.name} at {activeLayer.fontSize}px
      </p>
    </Card>
  );
}
