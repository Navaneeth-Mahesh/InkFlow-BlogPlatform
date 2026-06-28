"use client";

import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { useApp } from "@/hooks/use-app-state";
import { Category } from "@/types";
import { Clock, Calendar } from "lucide-react";

export function PreviewModal({
  open,
  onOpenChange,
  title,
  content,
  coverImage,
  category,
  readTime,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  coverImage: string | null;
  category: Category | null;
  readTime: number;
}) {
  const { user } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-surface/95 backdrop-blur-sm">
          <span className="text-xs font-mono uppercase tracking-wide text-text-tertiary">Preview mode</span>
        </div>

        <div className="px-6 pb-8 pt-2">
          {coverImage && (
            <div className="relative aspect-[16/8] rounded-xl overflow-hidden mt-4">
              <Image src={coverImage} alt="Cover" fill className="object-cover" unoptimized={coverImage.startsWith("blob:")} />
            </div>
          )}

          {category && <Badge dotColor={category.color} className="mt-5">{category.name}</Badge>}

          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary leading-tight mt-4">{title || "Untitled story"}</h1>

          <div className="flex items-center gap-3 mt-5 pb-5 border-b border-border">
            <InitialsAvatar name={user.name || "?"} size="sm" />
            <div>
              <p className="text-sm font-medium text-text-primary">{user.name}</p>
              <div className="flex items-center gap-2 text-xs text-text-tertiary">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Today</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {readTime} min read</span>
              </div>
            </div>
          </div>

          {content ? (
            <div className="prose-ink mt-6" dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="text-text-tertiary text-sm mt-6 italic">Nothing written yet — your content will appear here as you type.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
