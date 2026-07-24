"use client";

import { useTextStamp } from "@/hooks/useTextStamp";
import { Toolbar } from "@/components/Toolbar";
import { LayerPanel } from "@/components/LayerPanel";
import { TextEditor } from "@/components/TextEditor";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { FontSelector } from "@/components/FontSelector";
import { SizeColorPanel } from "@/components/SizeColorPanel";
import { TextStylePanel } from "@/components/TextStylePanel";
import { TypographyPanel } from "@/components/TypographyPanel";
import { OutlinePanel } from "@/components/OutlinePanel";
import { ShadowPanel } from "@/components/ShadowPanel";
import { CanvasSizePanel } from "@/components/CanvasSizePanel";
import { BackgroundPanel } from "@/components/BackgroundPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { Preview } from "@/components/Preview";
import { DownloadButton } from "@/components/DownloadButton";
import { StatusOverlays } from "@/components/StatusOverlays";

export default function Home() {
  const state = useTextStamp();

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Toolbar />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 grid lg:grid-cols-[380px_1fr] gap-5">
        {/* Left: controls */}
        <div className="space-y-4">
          <LayerPanel {...state} />
          <TextEditor {...state} />
          <TemplatesPanel {...state} />
          <FontSelector {...state} />
          <SizeColorPanel {...state} />
          <TextStylePanel {...state} />
          <TypographyPanel {...state} />
          <OutlinePanel {...state} />
          <ShadowPanel {...state} />
          <CanvasSizePanel {...state} />
          <BackgroundPanel {...state} />
          <ExportPanel {...state} />
        </div>

        {/* Right: preview + download */}
        <div className="space-y-4">
          <Preview {...state} />
          <DownloadButton {...state} />
        </div>
      </main>

      <StatusOverlays {...state} />
    </div>
  );
}
