"use client";

import { Download } from "lucide-react";
import { ACCENT } from "@/lib/fonts";
import { TextStampState } from "@/hooks/useTextStamp";

export function DownloadButton(props: TextStampState) {
  const { handleDownload, isExporting, exportFormat } = props;
  return (
    <button
      onClick={handleDownload}
      disabled={isExporting}
      className="w-full flex items-center justify-center gap-2 rounded-xl text-white font-medium py-3.5 text-base active:scale-[0.99] transition disabled:opacity-60"
      style={{ backgroundColor: ACCENT }}
    >
      <Download size={18} />
      {isExporting ? "Preparing…" : `Download ${exportFormat.toUpperCase()}`}
    </button>
  );
}
