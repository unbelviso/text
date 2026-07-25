"use client";

export function Toolbar() {
  return (
    <header className="border-b border-neutral-200 px-5 py-4 flex items-center gap-2.5">
      {/* Swap public/logo.svg to change this icon — no code changes needed. */}
      <img src="/logo.svg" alt="" width={28} height={28} className="rounded-lg" />
      <h1 className="text-lg font-semibold tracking-tight">Font Studio</h1>
      <span className="ml-auto text-xs text-neutral-400 hidden sm:inline">
        Create beautiful text images with any font.
      </span>
    </header>
  );
}
