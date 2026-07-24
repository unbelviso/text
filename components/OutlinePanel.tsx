"use client";

import { ACCENT } from "@/lib/fonts";
import { Card, Label, SliderRow } from "./ui";
import { ColorPicker } from "./ColorPicker";
import { TextStampState } from "@/hooks/useTextStamp";

export function OutlinePanel(props: TextStampState) {
  const { activeLayer, updateActiveLayer } = props;
  return (
    <Card>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={activeLayer.outlineOn}
          onChange={(e) => updateActiveLayer({ outlineOn: e.target.checked })}
          className="w-4 h-4"
          style={{ accentColor: ACCENT }}
        />
        <Label>Outline</Label>
      </label>
      {activeLayer.outlineOn && (
        <div className="mt-3 space-y-3">
          <SliderRow label="Width" value={activeLayer.outlineWidth} min={1} max={20} unit="px" onChange={(v) => updateActiveLayer({ outlineWidth: v })} compact />
          <ColorPicker label="Color" value={activeLayer.outlineColor} onChange={(v) => updateActiveLayer({ outlineColor: v })} compact />
        </div>
      )}
    </Card>
  );
}
