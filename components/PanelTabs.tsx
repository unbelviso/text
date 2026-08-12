"use client";

import { useState } from "react";
import { TextStampState } from "@/hooks/useTextStamp";
import { TextEditor } from "./TextEditor";
import { FontSelector } from "./FontSelector";
import { TemplatesPanel } from "./TemplatesPanel";
import { SizeColorPanel } from "./SizeColorPanel";
import { TextStylePanel } from "./TextStylePanel";
import { TypographyPanel } from "./TypographyPanel";
import { OutlinePanel } from "./OutlinePanel";
import { ShadowPanel } from "./ShadowPanel";
import { CanvasSizePanel } from "./CanvasSizePanel";
import { BackgroundPanel } from "./BackgroundPanel";
import { ExportPanel } from "./ExportPanel";
import { LayerPanel } from "./LayerPanel";

const TABS = [
  { id: "text", label: "Text" },
  { id: "style", label: "Style" },
  { id: "effects", label: "Effects" },
  { id: "canvas", label: "Canvas" },
  { id: "export", label: "Export" },
  { id: "layers", label: "Layers" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Groups the existing panel components into tabs instead of one long scrolling stack. */
export function PanelTabs(props: TextStampState) {
  const [tab, setTab] = useState<TabId>("text");

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-neutral-100 rounded-full p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition"
            style={tab === t.id ? { backgroundColor: "#171717", color: "white" } : { color: "#737373" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "text" && (
        <div className="space-y-3">
          <TextEditor {...props} />
          <FontSelector {...props} />
          <TemplatesPanel {...props} />
        </div>
      )}
      {tab === "style" && (
        <div className="space-y-3">
          <SizeColorPanel {...props} />
          <TextStylePanel {...props} />
          <TypographyPanel {...props} />
        </div>
      )}
      {tab === "effects" && (
        <div className="space-y-3">
          <OutlinePanel {...props} />
          <ShadowPanel {...props} />
        </div>
      )}
      {tab === "canvas" && (
        <div className="space-y-3">
          <CanvasSizePanel {...props} />
          <BackgroundPanel {...props} />
        </div>
      )}
      {tab === "export" && <ExportPanel {...props} />}
      {tab === "layers" && <LayerPanel {...props} />}
    </div>
  );
}
