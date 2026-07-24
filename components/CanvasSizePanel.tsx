"use client";

import { CANVAS_PRESETS } from "@/lib/fonts";
import { clamp } from "@/lib/canvasRender";
import { Card, Label } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function CanvasSizePanel(props: TextStampState) {
  const { canvasWidth, canvasHeight, setCanvasWidth, setCanvasHeight } = props;
  return (
    <Card>
      <Label>Canvas Size</Label>
      <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
        {CANVAS_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setCanvasWidth(p.w);
              setCanvasHeight(p.h);
            }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300"
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={100}
          max={4000}
          value={canvasWidth}
          onChange={(e) => setCanvasWidth(clamp(Number(e.target.value) || 100, 100, 4000))}
          className="w-full rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm"
        />
        <span className="text-neutral-400 text-xs">×</span>
        <input
          type="number"
          min={100}
          max={4000}
          value={canvasHeight}
          onChange={(e) => setCanvasHeight(clamp(Number(e.target.value) || 100, 100, 4000))}
          className="w-full rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm"
        />
      </div>
    </Card>
  );
}
