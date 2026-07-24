"use client";

import { Card, Label, ToggleChip } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function TextStylePanel(props: TextStampState) {
  const { activeLayer, updateActiveLayer } = props;
  return (
    <Card>
      <Label>Text Style</Label>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        <ToggleChip active={activeLayer.bold} onClick={() => updateActiveLayer({ bold: !activeLayer.bold })} label="Bold" style={{ fontWeight: 700 }} />
        <ToggleChip active={activeLayer.italic} onClick={() => updateActiveLayer({ italic: !activeLayer.italic })} label="Italic" style={{ fontStyle: "italic" }} />
        <ToggleChip
          active={activeLayer.underline}
          onClick={() => updateActiveLayer({ underline: !activeLayer.underline })}
          label="Underline"
          style={{ textDecoration: "underline" }}
        />
        <ToggleChip
          active={activeLayer.textCase === "upper"}
          onClick={() => updateActiveLayer({ textCase: activeLayer.textCase === "upper" ? "none" : "upper" })}
          label="UPPERCASE"
        />
        <ToggleChip
          active={activeLayer.textCase === "lower"}
          onClick={() => updateActiveLayer({ textCase: activeLayer.textCase === "lower" ? "none" : "lower" })}
          label="lowercase"
        />
      </div>
    </Card>
  );
}
