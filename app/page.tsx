"use client";

import { useTextStamp } from "@/hooks/useTextStamp";
import { Toolbar } from "@/components/Toolbar";
import { Preview } from "@/components/Preview";
import { DownloadButton } from "@/components/DownloadButton";
import { PanelTabs } from "@/components/PanelTabs";
import { StatusOverlays } from "@/components/StatusOverlays";
import { Footer } from "@/components/Footer";

export default function Home() {
  const state = useTextStamp();

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      <Toolbar />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 grid lg:grid-cols-[1fr_380px] gap-5 w-full flex-1">
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start order-1">
          <Preview {...state} />
          <DownloadButton {...state} />
        </div>

        <div className="order-2">
          <PanelTabs {...state} />
        </div>
      </main>

      <Footer />
      <StatusOverlays {...state} />
    </div>
  );
}
