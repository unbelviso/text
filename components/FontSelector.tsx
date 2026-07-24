"use client";

import { Search, Star, Upload, X } from "lucide-react";
import { ACCENT, CATEGORIES } from "@/lib/fonts";
import { Card, Label } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function FontSelector(props: TextStampState) {
  const {
    fileInputRef,
    onFileInputChange,
    query,
    setQuery,
    category,
    setCategory,
    recentFonts,
    filteredFonts,
    activeLayer,
    selectFont,
    favoriteIds,
    toggleFavorite,
    removeCustomFont,
    fontsReady,
  } = props;

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <Label>Font</Label>
        <label
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg cursor-pointer text-white active:scale-95 transition"
          style={{ backgroundColor: ACCENT }}
        >
          <Upload size={13} />
          Add Font
          <input ref={fileInputRef} type="file" accept=".ttf,.otf" multiple onChange={onFileInputChange} className="hidden" />
        </label>
      </div>

      <div className="relative mb-2">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fonts…"
          className="w-full rounded-lg border border-neutral-200 pl-8 pr-2.5 py-1.5 text-sm focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as any]: ACCENT }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="text-xs px-2.5 py-1 rounded-full border transition"
            style={category === c ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "white" } : { borderColor: "#e5e5e5", color: "#525252" }}
          >
            {c}
          </button>
        ))}
      </div>

      {recentFonts.length > 0 && !query && (
        <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
          {recentFonts.map((f) => (
            <button
              key={`recent-${f.id}`}
              onClick={() => selectFont(f.id)}
              className="shrink-0 text-xs px-2.5 py-1 rounded-full border whitespace-nowrap"
              style={
                f.id === activeLayer.fontId
                  ? { backgroundColor: "#FFF1F3", borderColor: ACCENT, color: ACCENT }
                  : { borderColor: "#e5e5e5", color: "#525252" }
              }
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
        {filteredFonts.length === 0 && <p className="text-sm text-neutral-400 py-6 text-center">No fonts found</p>}
        {filteredFonts.map((f) => {
          const isSelected = f.id === activeLayer.fontId;
          const isCustom = f.id.startsWith("custom-");
          const isFav = favoriteIds.includes(f.id);
          return (
            <div
              key={f.id}
              onClick={() => selectFont(f.id)}
              className="flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer border transition"
              style={isSelected ? { borderColor: ACCENT, backgroundColor: "#FFF1F3" } : { borderColor: "#f0f0f0" }}
            >
              <span className="truncate text-lg" style={{ fontFamily: fontsReady ? f.cssFamily : "inherit" }}>
                {f.name}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(f.id);
                  }}
                  className="p-1"
                  style={{ color: isFav ? ACCENT : "#d4d4d4" }}
                >
                  <Star size={14} fill={isFav ? ACCENT : "none"} />
                </button>
                {isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomFont(f.id);
                    }}
                    className="text-neutral-300 hover:text-neutral-500 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
