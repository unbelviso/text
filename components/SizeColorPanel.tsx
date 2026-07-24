"use client";

import { ACCENT } from "@/lib/fonts";
import { Card, Label } from "./ui";
import { ColorPicker } from "./ColorPicker";
import { TextStampState } from "@/hooks/useTextStamp";

export function SizeColorPanel(props: TextStampState) {
  const { activeLayer, updateActiveLayer } = props;
  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <Label>Size</Label>
        <span className="text-xs text-neutral-400">{activeLayer.fontSize}px</span>
      </div>
      <input
        type="range"
        min={8}
        max={300}
        value={activeLayer.fontSize}
        onChange={(e) => updateActiveLayer({ fontSize: Number(e.target.value) })}
        className="w-full mb-3"
        style={{ accentColor: ACCENT }}
      />
      <ColorPicker label="Text Color" value={activeLayer.fontColor} onChange={(v) => updateActiveLayer({ fontColor: v })} />
    </Card>
  );
}
