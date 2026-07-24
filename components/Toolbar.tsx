"use client";

import { Type } from "lucide-react";
import { ACCENT } from "@/lib/fonts";

export function Toolbar() {
  return (
    <header className="border-b border-neutral-200 px-5 py-4 flex items-center gap-2">
      <Type size={22} style={{ color: ACCENT }} strokeWidth={2.5} />
      <h1 className="text-lg font-semibold tracking-tight">
        Text<span style={{ color: ACCENT }}>Stamp</span>
      </h1>
      <span className="ml-auto text-xs text-neutral-400 hidden sm:inline">
        Any font. Any phrase. One PNG (or SVG).
      </span>
    </header>
  );
}
