"use client";

import * as React from "react";
import { Link2, MessageCircle, Check } from "lucide-react";
import { Post } from "@/types";
import { LikeButton } from "@/components/shared/like-button";
import { BookmarkButton } from "@/components/shared/bookmark-button";

export function ArticleActionRail({ post }: { post: Post }) {
  const [copied, setCopied] = React.useState(false);

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="hidden lg:flex flex-col items-center gap-5 sticky top-28 h-fit w-12 shrink-0">
      <LikeButton post={post} size="lg" showCount={false} />
      <button onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })} className="text-text-secondary hover:text-accent-violet transition-colors" aria-label="Jump to comments">
        <MessageCircle className="h-5 w-5" />
      </button>
      <BookmarkButton post={post} size="lg" />
      <button onClick={handleShare} className="text-text-secondary hover:text-accent-violet transition-colors relative" aria-label="Copy link to article">
        {copied ? <Check className="h-5 w-5 text-accent-emerald" /> : <Link2 className="h-5 w-5" />}
      </button>
    </div>
  );
}
