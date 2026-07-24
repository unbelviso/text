"use client";

import { ACCENT } from "@/lib/fonts";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-neutral-200 p-4 ${className}`}>{children}</div>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-neutral-600">{children}</label>;
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
      className="text-xs px-2.5 py-1.5 rounded-lg border transition"
      style={
        active
          ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "white", ...style }
          : { borderColor: "#e5e5e5", color: "#525252", ...style }
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
      <div className="flex items-center justify-between mb-1">
        <span className={compact ? "text-xs text-neutral-500" : "text-sm font-medium text-neutral-600"}>{label}</span>
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
          className="flex-1 text-xs py-1.5 rounded-lg border transition capitalize"
          style={
            value === opt.id
              ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "white" }
              : { borderColor: "#e5e5e5", color: "#525252" }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
