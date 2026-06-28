"use client";

import * as React from "react";
import { X } from "lucide-react";
import { getCategories } from "@/lib/services";
import { mapCategory } from "@/lib/mappers";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function CategorySelector({ selected, onChange }: { selected: string | null; onChange: (categoryId: string | null) => void }) {
  const [categories, setCategories] = React.useState<Category[] | null>(null);

  React.useEffect(() => {
    getCategories()
      .then((raw) => setCategories(raw.map(mapCategory)))
      .catch(() => setCategories([]));
  }, []);

  if (!categories) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors",
            selected === c.id ? "border-transparent text-white" : "border-border text-text-secondary hover:border-border-strong hover:text-text-primary"
          )}
          style={selected === c.id ? { backgroundColor: c.color } : undefined}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: selected === c.id ? "white" : c.color }} />
          {c.name}
        </button>
      ))}
    </div>
  );
}

export function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = React.useState("");

  function addTag() {
    const clean = draft.trim().toLowerCase().replace(/\s+/g, "-");
    if (clean && !tags.includes(clean) && tags.length < 6) onChange([...tags, clean]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-accent-violet/10 text-accent-violet text-[13px] font-medium px-3 py-1.5">
            #{tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove tag ${tag}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
        placeholder={tags.length >= 6 ? "Tag limit reached" : "Add a tag and press Enter…"}
        disabled={tags.length >= 6}
      />
    </div>
  );
}
