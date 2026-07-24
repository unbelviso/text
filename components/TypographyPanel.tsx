"use client";

import { Align } from "@/lib/types";
import { Card, Label, SegmentedToggle, SliderRow } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function TypographyPanel(props: TextStampState) {
  const { activeLayer, updateActiveLayer } = props;
  return (
    <Card>
      <Label>Alignment</Label>
      <div className="mt-1.5 mb-3">
        <SegmentedToggle<Align>
          options={[
            { id: "left", label: "left" },
            { id: "center", label: "center" },
            { id: "right", label: "right" },
          ]}
          value={activeLayer.align}
          onChange={(v) => updateActiveLayer({ align: v })}
        />
      </div>

      <SliderRow label="Letter Spacing" value={activeLayer.letterSpacing} min={-10} max={30} unit="px" onChange={(v) => updateActiveLayer({ letterSpacing: v })} />
      <SliderRow
        label="Line Height"
        value={activeLayer.lineHeightMult}
        min={0.8}
        max={3}
        step={0.1}
        decimals={1}
        onChange={(v) => updateActiveLayer({ lineHeightMult: v })}
      />
      <SliderRow
        label="Curve"
        value={activeLayer.curve}
        min={-100}
        max={100}
        onChange={(v) => updateActiveLayer({ curve: v })}
        hint="Positive arches up, negative arches down. 0 = straight."
      />
      <SliderRow label="Rotation" value={activeLayer.rotation} min={-180} max={180} unit="°" onChange={(v) => updateActiveLayer({ rotation: v })} />
    </Card>
  );
}
