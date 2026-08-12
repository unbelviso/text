"use client";

import { ACCENT } from "@/lib/fonts";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-neutral-50 rounded-3xl p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-extrabold uppercase tracking-wide text-neutral-400">{children}</label>;
}

export function ToggleChip({
  active,
  onClick,
  label,
  style,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3.5 py-2 rounded-xl border transition"
      style={
        active
          ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "#171717", ...style }
          : { borderColor: "rgba(0,0,0,0.08)", background: "#fff", color: "#525252", ...style }
      }
    >
      {label}
    </button>
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  decimals = 0,
  onChange,
  compact = false,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  decimals?: number;
  onChange: (v: number) => void;
  compact?: boolean;
  hint?: string;
}) {
  return (
    <div className={compact ? "" : "mb-3"}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={compact ? "text-xs text-neutral-500 font-medium" : "text-xs font-bold text-neutral-500"}>{label}</span>
        <span className="text-xs text-neutral-400">
          {decimals ? value.toFixed(decimals) : value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: ACCENT }}
      />
      {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className="flex-1 text-xs py-2 rounded-xl border transition capitalize font-semibold"
          style={
            value === opt.id
              ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "#171717" }
              : { borderColor: "rgba(0,0,0,0.08)", background: "#fff", color: "#525252" }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** New: pill on/off switch, replaces native checkboxes for Outline/Shadow/Watermark toggles. */
export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-10 h-[22px] rounded-full transition"
      style={{ backgroundColor: checked ? ACCENT : "#e0e0e0" }}
    >
      <span
        className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all"
        style={{ left: checked ? 20 : 2 }}
      />
    </button>
  );
}
