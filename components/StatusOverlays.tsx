"use client";

import { Upload } from "lucide-react";
import { ACCENT } from "@/lib/fonts";
import { TextStampState } from "@/hooks/useTextStamp";

export function StatusOverlays(props: TextStampState) {
  const { isDragging, toast } = props;
  return (
    <>
      {isDragging && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.85)" }}>
          <div className="rounded-2xl border-2 border-dashed px-8 py-6 text-center" style={{ borderColor: ACCENT }}>
            <Upload size={28} className="mx-auto mb-2" style={{ color: ACCENT }} />
            <p className="font-medium text-neutral-700">Drop TTF/OTF to add font</p>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>
      )}
    </>
  );
}
