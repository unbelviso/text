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
import { Footer } from "@/components/Footer";

export default function Home() {
  const state = useTextStamp();

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      <Toolbar />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 grid lg:grid-cols-[1fr_380px] gap-5 w-full flex-1">
        {/* Preview: first in DOM so it's on top on mobile; left column + sticky on desktop */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start order-1">
          <Preview {...state} />
          <DownloadButton {...state} />
        </div>

        {/* Controls: Text -> Font -> everything else -> Layers near the bottom */}
        <div className="space-y-4 order-2">
          <TextEditor {...state} />
          <FontSelector {...state} />
          <TemplatesPanel {...state} />
          <SizeColorPanel {...state} />
          <TextStylePanel {...state} />
          <TypographyPanel {...state} />
          <OutlinePanel {...state} />
          <ShadowPanel {...state} />
          <CanvasSizePanel {...state} />
          <BackgroundPanel {...state} />
          <ExportPanel {...state} />
          <LayerPanel {...state} />
        </div>
      </main>

      <Footer />
      <StatusOverlays {...state} />
    </div>
  );
}
