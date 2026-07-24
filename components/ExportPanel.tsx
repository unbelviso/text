"use client";

import { ACCENT } from "@/lib/fonts";
import { ExportFormat } from "@/lib/types";
import { Card, Label, SegmentedToggle, SliderRow } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function ExportPanel(props: TextStampState) {
  const { exportFormat, setExportFormat, exportScale, setExportScale, watermarkOn, setWatermarkOn, watermarkText, setWatermarkText, watermarkOpacity, setWatermarkOpacity } =
    props;
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
      {exportFormat === "png" && (
        <>
          <span className="text-xs text-neutral-500">Resolution</span>
          <div className="mt-1.5 mb-3 flex gap-1.5">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setExportScale(s)}
                className="flex-1 text-xs py-1.5 rounded-lg border transition"
                style={exportScale === s ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "white" } : { borderColor: "#e5e5e5", color: "#525252" }}
              >
                {s}x
              </button>
            ))}
          </div>
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
        </div>
      )}
    </Card>
  );
}
