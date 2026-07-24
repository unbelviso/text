"use client";

import { ChevronDown, ChevronUp, Copy, Layers, Plus, Trash2 } from "lucide-react";
import { ACCENT } from "@/lib/fonts";
import { Card, Label } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function LayerPanel(props: TextStampState) {
  const { layers, activeLayerId, setActiveLayerId, addLayer, duplicateLayer, deleteLayer, moveLayer } = props;

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Layers size={14} className="text-neutral-400" />
          <Label>Layers</Label>
        </div>
        <button
          onClick={addLayer}
          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-white active:scale-95 transition"
          style={{ backgroundColor: ACCENT }}
        >
          <Plus size={13} /> Add
        </button>
      </div>
      <div className="space-y-1">
        {layers.map((l, i) => (
          <div
            key={l.id}
            onClick={() => setActiveLayerId(l.id)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 cursor-pointer border transition"
            style={l.id === activeLayerId ? { borderColor: ACCENT, backgroundColor: "#FFF1F3" } : { borderColor: "#f0f0f0" }}
          >
            <span className="flex-1 truncate text-sm">{l.text || "(empty)"}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveLayer(l.id, 1);
              }}
              disabled={i === 0}
              className="p-1 text-neutral-400 disabled:opacity-20"
            >
              <ChevronUp size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveLayer(l.id, -1);
              }}
              disabled={i === layers.length - 1}
              className="p-1 text-neutral-400 disabled:opacity-20"
            >
              <ChevronDown size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateLayer(l.id);
              }}
              className="p-1 text-neutral-400"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteLayer(l.id);
              }}
              disabled={layers.length <= 1}
              className="p-1 text-neutral-400 disabled:opacity-20"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-400 mt-2">Drag a layer directly on the canvas to reposition it.</p>
    </Card>
  );
}
