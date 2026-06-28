"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useApp } from "@/hooks/use-app-state";
import { Post } from "@/types";

export function LikeButton({
  post,
  size = "md",
  showCount = true,
}: {
  post: Post;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}) {
  const { isLiked, toggleLike, getLikeCount, registerPostBaseline } = useApp();
  const liked = isLiked(post.id);
  const [burst, setBurst] = React.useState(false);

  React.useEffect(() => {
    registerPostBaseline(post);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(post.id);
    if (!liked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 500);
    }
  };

  const sizes = {
    sm: { icon: "h-4 w-4", text: "text-xs", gap: "gap-1.5" },
    md: { icon: "h-[18px] w-[18px]", text: "text-sm", gap: "gap-2" },
    lg: { icon: "h-5 w-5", text: "text-[15px]", gap: "gap-2" },
  }[size];

  return (
    <button
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Unlike post" : "Like post"}
      className={cn("relative inline-flex items-center rounded-full transition-colors", sizes.gap, liked ? "text-accent-coral" : "text-text-secondary hover:text-accent-coral")}
    >
      <span className="relative inline-flex">
        <motion.span animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.35, ease: "easeOut" }} className="inline-flex">
          <Heart className={cn(sizes.icon, liked && "fill-current")} />
        </motion.span>
        <AnimatePresence>
          {burst && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-accent-coral/40"
            />
          )}
        </AnimatePresence>
      </span>
      {showCount && <span className={cn(sizes.text, "font-medium tabular-nums")}>{formatNumber(getLikeCount(post))}</span>}
    </button>
  );
}
