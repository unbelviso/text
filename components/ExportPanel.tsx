"use client";

import { ClipboardCopy } from "lucide-react";
import { ACCENT, DPI_PRESETS } from "@/lib/fonts";
import { ExportFormat } from "@/lib/types";
import { SvgMode } from "@/lib/exportImage";
import { Card, Label, SegmentedToggle, SliderRow } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function ExportPanel(props: TextStampState) {
  const {
    exportFormat,
    setExportFormat,
    dpi,
    setDpi,
    svgMode,
    setSvgMode,
    watermarkOn,
    setWatermarkOn,
    watermarkText,
    setWatermarkText,
    watermarkOpacity,
    setWatermarkOpacity,
    handleCopyImage,
    isCopying,
  } = props;

  return (
    <Card>
      <Label>Export</Label>
      <div className="mt-1.5 mb-3">
        <SegmentedToggle<ExportFormat>
          options={[
            { id: "png", label: "PNG" },
            { id: "svg", label: "SVG" },
          ]}
          value={exportFormat}
          onChange={setExportFormat}
        />
      </div>

      {exportFormat === "png" ? (
        <>
          <span className="text-xs text-neutral-500">Resolution (DPI)</span>
          <div className="mt-1.5 mb-3 grid grid-cols-3 gap-1.5">
            {DPI_PRESETS.map((d) => (
              <button
                key={d}
                onClick={() => setDpi(d)}
                className="text-xs py-1.5 rounded-lg border transition"
                style={dpi === d ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "white" } : { borderColor: "#e5e5e5", color: "#525252" }}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-400 mb-3">
            Higher DPI = larger file, sharper print. The PNG carries real DPI metadata (Photoshop/Illustrator will read it correctly).
          </p>
          <button
            onClick={handleCopyImage}
            disabled={isCopying}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-neutral-200 hover:border-neutral-300 transition disabled:opacity-60 mb-3"
          >
            <ClipboardCopy size={13} />
            {isCopying ? "Copying…" : "Copy image (no download)"}
          </button>
        </>
      ) : (
        <>
          <span className="text-xs text-neutral-500">SVG Type</span>
          <div className="mt-1.5 mb-1">
            <SegmentedToggle<SvgMode>
              options={[
                { id: "editable", label: "Text (Editable)" },
                { id: "outline", label: "Outline (Universal)" },
              ]}
              value={svgMode}
              onChange={setSvgMode}
            />
          </div>
          <p className="text-xs text-neutral-400 mb-3">
            {svgMode === "editable"
              ? "Text stays selectable/editable, but needs the font installed to display correctly (built-in fonts embed by name only)."
              : "Converts uploaded fonts (.ttf/.otf) to true vector paths — displays identically everywhere, no font dependency. Built-in Google Fonts still export as editable text."}
          </p>
        </>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={watermarkOn} onChange={(e) => setWatermarkOn(e.target.checked)} className="w-4 h-4" style={{ accentColor: ACCENT }} />
        <span className="text-sm font-medium text-neutral-600">Watermark</span>
      </label>
      {watermarkOn && (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="yourshopname"
            className="w-full rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm"
          />
          <SliderRow label="Opacity" value={Math.round(watermarkOpacity * 100)} min={5} max={100} unit="%" onChange={(v) => setWatermarkOpacity(v / 100)} compact />
          <p className="text-xs text-neutral-400">Shown live in the preview and baked into every export.</p>
        </div>
      )}
    </Card>
  );
}
