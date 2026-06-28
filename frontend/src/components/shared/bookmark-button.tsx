"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/hooks/use-app-state";
import { Post } from "@/types";
import { toast } from "@/hooks/use-toast";

export function BookmarkButton({
  post,
  size = "md",
  withToast = false,
}: {
  post: Post;
  size?: "sm" | "md" | "lg";
  withToast?: boolean;
}) {
  const { isBookmarked, toggleBookmark, registerPostBaseline } = useApp();
  const saved = isBookmarked(post.id);

  React.useEffect(() => {
    registerPostBaseline(post);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasSaved = saved;
    toggleBookmark(post.id);
    if (withToast) {
      toast({
        variant: "success",
        title: wasSaved ? "Removed from saved" : "Saved to your reading list",
        description: wasSaved ? post.title : "Find it later in your profile.",
      });
    }
  };

  const sizes = { sm: "h-4 w-4", md: "h-[18px] w-[18px]", lg: "h-5 w-5" }[size];

  return (
    <button
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Save for later"}
      className={cn("inline-flex items-center justify-center rounded-full transition-colors", saved ? "text-accent-violet" : "text-text-secondary hover:text-accent-violet")}
    >
      <motion.span animate={saved ? { y: [0, -3, 0] } : { y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="inline-flex">
        <Bookmark className={cn(sizes, saved && "fill-current")} />
      </motion.span>
    </button>
  );
}
