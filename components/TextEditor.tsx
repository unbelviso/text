"use client";

import { Bookmark, X } from "lucide-react";
import { ACCENT } from "@/lib/fonts";
import { Card, Label } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function TextEditor(props: TextStampState) {
  const { activeLayer, updateActiveLayer, textPresets, deletePreset, savePreset } = props;

  return (
    <Card>
      <Label>Text (selected layer)</Label>
      <textarea
        value={activeLayer.text}
        onChange={(e) => updateActiveLayer({ text: e.target.value })}
        rows={2}
        className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:border-transparent mt-1.5"
        style={{ ["--tw-ring-color" as any]: ACCENT }}
        placeholder="Type your text…"
      />
      {textPresets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {textPresets.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1 text-xs pl-2.5 pr-1 py-1 rounded-full border border-neutral-200 cursor-pointer"
              onClick={() => updateActiveLayer({ text: p.text })}
            >
              {p.text}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePreset(p.id);
                }}
                className="text-neutral-300 hover:text-neutral-500 p-0.5"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <button onClick={savePreset} className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
        <Bookmark size={12} /> Save this phrase
      </button>
    </Card>
  );
}
