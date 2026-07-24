"use client";

import { Sparkles } from "lucide-react";
import { TEMPLATES } from "@/lib/fonts";
import { Card, Label } from "./ui";
import { TextStampState } from "@/hooks/useTextStamp";

export function TemplatesPanel(props: TextStampState) {
  const { applyTemplate } = props;
  return (
    <Card>
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={14} className="text-neutral-400" />
        <Label>Templates</Label>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => applyTemplate(t)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 transition"
          >
            {t.name}
          </button>
        ))}
      </div>
    </Card>
  );
}
