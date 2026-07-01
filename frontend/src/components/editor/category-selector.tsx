"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { getCategories } from "@/lib/services";
import { mapCategory } from "@/lib/mappers";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * Free-text category input. Existing categories are shown underneath as
 * tappable suggestions purely for convenience/autocomplete — typing any
 * other value is always allowed, and the backend creates it on first use
 * (see services/category.service.ts -> findOrCreateCategory).
 */
export function CategorySelector({
  value,
  onChange,
}: {
  /** The category name as typed by the user (not an id). */
  value: string;
  onChange: (categoryName: string) => void;
}) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    getCategories()
      .then((raw) => setCategories(raw.map(mapCategory)))
      .catch(() => setCategories([]));
  }, []);

  const normalizedValue = value.trim().toLowerCase();
  const suggestions = categories.filter((c) =>
    normalizedValue ? c.name.toLowerCase().includes(normalizedValue) : true
  );
  const isExactExistingMatch = categories.some((c) => c.name.toLowerCase() === normalizedValue);

  return (
    <div>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Type any category — e.g. Travel, Personal Finance, Parenting…"
          maxLength={40}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear category"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {value.trim() && (
        <p className="text-xs text-text-tertiary mt-1.5 flex items-center gap-1.5">
          {isExactExistingMatch ? (
            <>
              <Check className="h-3 w-3 text-accent-emerald" /> Using existing category &ldquo;{value.trim()}&rdquo;
            </>
          ) : (
            <>This will create a new category called &ldquo;{value.trim()}&rdquo;</>
          )}
        </p>
      )}

      {focused && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.slice(0, 10).map((c) => (
            <button
              key={c.id}
              type="button"
              // onMouseDown (not onClick) fires before the input's onBlur closes this list.
              onMouseDown={() => onChange(c.name)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors",
                normalizedValue === c.name.toLowerCase()
                  ? "border-transparent text-white"
                  : "border-border text-text-secondary hover:border-border-strong hover:text-text-primary"
              )}
              style={normalizedValue === c.name.toLowerCase() ? { backgroundColor: c.color } : undefined}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: normalizedValue === c.name.toLowerCase() ? "white" : c.color }}
              />
              {c.name}
            </button>
          ))}
        </div>
      )}
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
