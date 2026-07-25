"use client";

import { ACCENT } from "@/lib/fonts";
import { Label } from "./ui";

export function ColorPicker({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500 w-14">{label}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 shrink-0 rounded-lg border border-neutral-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-neutral-200 px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as any]: ACCENT }}
        />
      </div>
    );
  }
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 mt-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-200 px-2.5 py-2 text-sm font-mono focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as any]: ACCENT }}
        />
      </div>
    </div>
  );
}
