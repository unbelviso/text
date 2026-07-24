"use client";

import { Image as ImageIcon } from "lucide-react";
import { ACCENT } from "@/lib/fonts";
import { BgMode } from "@/lib/types";
import { Card, Label, SegmentedToggle } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function BackgroundPanel(props: TextStampState) {
  const { bgMode, setBgMode, bgColor, setBgColor, bgImage, setBgImage, bgImageInputRef, onBgImageChange } = props;
  return (
    <Card>
      <Label>Background</Label>
      <div className="mt-1.5 mb-2">
        <SegmentedToggle<BgMode>
          options={[
            { id: "transparent", label: "Transparent" },
            { id: "white", label: "White" },
            { id: "black", label: "Black" },
            { id: "custom", label: "Color" },
          ]}
          value={bgMode}
          onChange={setBgMode}
        />
      </div>
      {bgMode === "custom" && (
        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer mb-2" />
      )}
      <label
        className="flex items-center justify-center gap-1.5 text-xs font-medium px-2.5 py-2 rounded-lg cursor-pointer border transition"
        style={bgMode === "image" ? { borderColor: ACCENT, color: ACCENT, backgroundColor: "#FFF1F3" } : { borderColor: "#e5e5e5", color: "#525252" }}
      >
        <ImageIcon size={14} />
        {bgImage ? "Change background image" : "Upload background image"}
        <input ref={bgImageInputRef} type="file" accept="image/*" onChange={onBgImageChange} className="hidden" />
      </label>
      {bgImage && (
        <button
          onClick={() => {
            setBgImage(null);
            setBgMode("transparent");
          }}
          className="text-xs text-neutral-400 mt-1.5"
        >
          Remove background image
        </button>
      )}
    </Card>
  );
}
