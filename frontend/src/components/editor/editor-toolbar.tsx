"use client";

import { Bold, Italic, Underline, Heading2, Heading3, Quote, List, ListOrdered, Link2, Code, Undo, Redo } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
  { cmd: "bold", icon: Bold, label: "Bold" },
  { cmd: "italic", icon: Italic, label: "Italic" },
  { cmd: "underline", icon: Underline, label: "Underline" },
  { divider: true },
  { cmd: "formatBlock:h2", icon: Heading2, label: "Heading" },
  { cmd: "formatBlock:h3", icon: Heading3, label: "Subheading" },
  { cmd: "formatBlock:blockquote", icon: Quote, label: "Quote" },
  { divider: true },
  { cmd: "insertUnorderedList", icon: List, label: "Bullet list" },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
  { cmd: "createLink", icon: Link2, label: "Link" },
  { cmd: "formatBlock:pre", icon: Code, label: "Code block" },
  { divider: true },
  { cmd: "undo", icon: Undo, label: "Undo" },
  { cmd: "redo", icon: Redo, label: "Redo" },
] as const;

export function EditorToolbar({ onCommand }: { onCommand: (cmd: string) => void }) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap rounded-xl border border-border bg-surface-sunken p-1.5 sticky top-[68px] z-20">
      {TOOLS.map((tool, i) =>
        "divider" in tool ? (
          <span key={i} className="w-px h-5 bg-border mx-1" />
        ) : (
          <button
            key={tool.cmd}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            onClick={() => onCommand(tool.cmd)}
            className={cn("h-8 w-8 flex items-center justify-center rounded-lg text-text-secondary", "hover:bg-surface hover:text-text-primary transition-colors")}
          >
            <tool.icon className="h-[15px] w-[15px]" />
          </button>
        )
      )}
    </div>
  );
}
