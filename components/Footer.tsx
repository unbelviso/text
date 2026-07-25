"use client";

import { Instagram } from "lucide-react";
import { ACCENT } from "@/lib/fonts";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-4 flex items-center justify-center">
      <a
        href="https://www.instagram.com/unbel_viso"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition"
      >
        <Instagram size={15} style={{ color: ACCENT }} />
        <span>
          Made by <span className="font-medium">@unbel_viso</span>
        </span>
      </a>
    </footer>
  );
}
