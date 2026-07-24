"use client";

import { ACCENT } from "@/lib/fonts";
import { Card, Label, SliderRow } from "./ui";
import { ColorPicker } from "./ColorPicker";
import { TextStampState } from "@/hooks/useTextStamp";

export function ShadowPanel(props: TextStampState) {
  const { activeLayer, updateActiveLayer } = props;
  return (
    <Card>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={activeLayer.shadowOn}
          onChange={(e) => updateActiveLayer({ shadowOn: e.target.checked })}
          className="w-4 h-4"
          style={{ accentColor: ACCENT }}
        />
        <Label>Shadow</Label>
      </label>
      {activeLayer.shadowOn && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SliderRow label="X" value={activeLayer.shadowX} min={-30} max={30} unit="px" onChange={(v) => updateActiveLayer({ shadowX: v })} compact />
            <SliderRow label="Y" value={activeLayer.shadowY} min={-30} max={30} unit="px" onChange={(v) => updateActiveLayer({ shadowY: v })} compact />
          </div>
          <SliderRow label="Blur" value={activeLayer.shadowBlur} min={0} max={40} unit="px" onChange={(v) => updateActiveLayer({ shadowBlur: v })} compact />
          <SliderRow
            label="Opacity"
            value={Math.round(activeLayer.shadowOpacity * 100)}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => updateActiveLayer({ shadowOpacity: v / 100 })}
            compact
          />
          <ColorPicker label="Color" value={activeLayer.shadowColor} onChange={(v) => updateActiveLayer({ shadowColor: v })} compact />
        </div>
      )}
    </Card>
  );
}
